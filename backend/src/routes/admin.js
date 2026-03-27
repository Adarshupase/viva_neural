import { Router } from 'express';
import Groq from 'groq-sdk';
import { requireAuth } from '../middleware/auth.js';
import { query } from '../db/index.js';

const router = Router();
router.use(requireAuth);

// ── Stats ────────────────────────────────────────────────────────────────────

router.get('/stats', async (_req, res) => {
  try {
    const [profs, topics, questions, images] = await Promise.all([
      query('SELECT COUNT(*) FROM professors'),
      query('SELECT COUNT(*) FROM topics'),
      query('SELECT COUNT(*) FROM questions'),
      query('SELECT COUNT(*) FROM question_images'),
    ]);
    res.json({
      professors: parseInt(profs.rows[0].count),
      topics: parseInt(topics.rows[0].count),
      questions: parseInt(questions.rows[0].count),
      images: parseInt(images.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ── Professors ────────────────────────────────────────────────────────────────

router.get('/professors', async (_req, res) => {
  try {
    const result = await query('SELECT * FROM professors ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch professors' });
  }
});

router.get('/professors/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM professors WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch professor' });
  }
});

router.post('/professors', async (req, res) => {
  try {
    const { name, title, credentials, avatar_emoji, bio } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = await query(
      'INSERT INTO professors (name, title, credentials, avatar_emoji, bio) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, title || null, credentials || null, avatar_emoji || '👨‍⚕️', bio || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create professor' });
  }
});

router.put('/professors/:id', async (req, res) => {
  try {
    const { name, title, credentials, avatar_emoji, bio } = req.body;
    const result = await query(
      'UPDATE professors SET name=$1, title=$2, credentials=$3, avatar_emoji=$4, bio=$5 WHERE id=$6 RETURNING *',
      [name, title || null, credentials || null, avatar_emoji || '👨‍⚕️', bio || null, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update professor' });
  }
});

router.delete('/professors/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM professors WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete professor' });
  }
});

// ── Topics ────────────────────────────────────────────────────────────────────

router.get('/topics', async (req, res) => {
  try {
    const { professor_id } = req.query;
    let sql = `
      SELECT t.*, p.name AS professor_name
      FROM topics t
      JOIN professors p ON t.professor_id = p.id
    `;
    const params = [];
    if (professor_id) {
      sql += ' WHERE t.professor_id = $1';
      params.push(professor_id);
    }
    sql += ' ORDER BY t.display_order ASC, t.name ASC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

router.get('/topics/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM topics WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
});

router.post('/topics', async (req, res) => {
  try {
    const { name, icon, professor_id, is_published, display_order } = req.body;
    if (!name || !professor_id) return res.status(400).json({ error: 'name and professor_id are required' });
    const result = await query(
      'INSERT INTO topics (name, icon, professor_id, is_published, display_order) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, icon || '📚', professor_id, is_published ?? false, display_order ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

router.put('/topics/:id', async (req, res) => {
  try {
    const { name, icon, professor_id, is_published, display_order } = req.body;
    const result = await query(
      'UPDATE topics SET name=$1, icon=$2, professor_id=$3, is_published=$4, display_order=$5 WHERE id=$6 RETURNING *',
      [name, icon || '📚', professor_id, is_published ?? false, display_order ?? 0, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update topic' });
  }
});

router.delete('/topics/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM topics WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
});

// ── Questions ─────────────────────────────────────────────────────────────────

router.get('/questions', async (req, res) => {
  try {
    const { topic_id } = req.query;
    let sql = `
      SELECT q.*, t.name AS topic_name
      FROM questions q
      JOIN topics t ON q.topic_id = t.id
    `;
    const params = [];
    if (topic_id) {
      sql += ' WHERE q.topic_id = $1';
      params.push(topic_id);
    }
    sql += ' ORDER BY q.display_order ASC, q.id ASC';
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

router.get('/questions/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM questions WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

router.post('/questions', async (req, res) => {
  try {
    const { topic_id, question_text, difficulty, answer_html, display_order } = req.body;
    if (!topic_id || !question_text) return res.status(400).json({ error: 'topic_id and question_text are required' });
    const result = await query(
      'INSERT INTO questions (topic_id, question_text, difficulty, answer_html, display_order) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [topic_id, question_text, difficulty || 'easy', answer_html || null, display_order ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

router.put('/questions/:id', async (req, res) => {
  try {
    const { topic_id, question_text, difficulty, answer_html, display_order } = req.body;
    const result = await query(
      'UPDATE questions SET topic_id=$1, question_text=$2, difficulty=$3, answer_html=$4, display_order=$5 WHERE id=$6 RETURNING *',
      [topic_id, question_text, difficulty || 'easy', answer_html || null, display_order ?? 0, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

router.delete('/questions/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM questions WHERE id=$1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// ── Question Images ───────────────────────────────────────────────────────────

router.get('/questions/:id/images', async (req, res) => {
  try {
    const result = await query('SELECT * FROM question_images WHERE question_id = $1', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

router.post('/questions/:id/images', async (req, res) => {
  try {
    const { image_url, caption } = req.body;
    if (!image_url) return res.status(400).json({ error: 'image_url is required' });
    const result = await query(
      'INSERT INTO question_images (question_id, image_url, caption) VALUES ($1,$2,$3) RETURNING *',
      [req.params.id, image_url, caption || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create image' });
  }
});

router.delete('/questions/:id/images/:imageId', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM question_images WHERE id=$1 AND question_id=$2 RETURNING id',
      [req.params.imageId, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// ── AI Config ─────────────────────────────────────────────────────────────────

router.get('/ai-config/:professor_id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM ai_config WHERE professor_id = $1', [req.params.professor_id]);
    if (!result.rows.length) {
      return res.json({
        professor_id: parseInt(req.params.professor_id),
        system_prompt:
          'You are a knowledgeable and encouraging medical professor helping students prepare for viva voce examinations. Provide clear, accurate, and educational responses.',
        user_prompt_template:
          'Topic: {{topic_name}}\nOriginal Question: {{question_text}}\nStandard Answer: {{answer_html}}\n\nThe student asks: {{user_message}}\n\nPlease provide a helpful explanation.',
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
      });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch AI config' });
  }
});

router.put('/ai-config/:professor_id', async (req, res) => {
  try {
    const { system_prompt, user_prompt_template, model, max_tokens } = req.body;
    const result = await query(
      `INSERT INTO ai_config (professor_id, system_prompt, user_prompt_template, model, max_tokens)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (professor_id) DO UPDATE SET
         system_prompt = EXCLUDED.system_prompt,
         user_prompt_template = EXCLUDED.user_prompt_template,
         model = EXCLUDED.model,
         max_tokens = EXCLUDED.max_tokens
       RETURNING *`,
      [req.params.professor_id, system_prompt, user_prompt_template, model || 'llama-3.3-70b-versatile', max_tokens || 1000]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update AI config' });
  }
});

// ── AI Config Test ────────────────────────────────────────────────────────────

router.post('/ai-config/:professor_id/test', async (req, res) => {
  try {
    const { system_prompt, user_prompt_template, model, max_tokens } = req.body;

    const testPrompt = (user_prompt_template || '')
      .replace('{{topic_name}}', 'Cardiology')
      .replace('{{question_text}}', 'What is the normal cardiac output?')
      .replace('{{answer_html}}', 'Normal cardiac output is 4-8 L/min')
      .replace('{{user_message}}', 'Can you explain this in more detail?');

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: model || 'llama-3.3-70b-versatile',
      max_tokens: Math.min(max_tokens || 500, 500),
      messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: testPrompt },
      ],
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Test failed: ' + err.message });
  }
});

export default router;
