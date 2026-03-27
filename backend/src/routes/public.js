import { Router } from 'express';
import Groq from 'groq-sdk';
import { query } from '../db/index.js';

const router = Router();

// GET /api/professors — list all professors
router.get('/professors', async (_req, res) => {
  try {
    const result = await query('SELECT * FROM professors ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch professors' });
  }
});

// GET /api/professors/:id — professor with their published topics
router.get('/professors/:id', async (req, res) => {
  try {
    const profResult = await query('SELECT * FROM professors WHERE id = $1', [req.params.id]);
    if (!profResult.rows.length) return res.status(404).json({ error: 'Professor not found' });

    const topicsResult = await query(
      'SELECT * FROM topics WHERE professor_id = $1 AND is_published = true ORDER BY display_order ASC, name ASC',
      [req.params.id]
    );

    res.json({ ...profResult.rows[0], topics: topicsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch professor' });
  }
});

// GET /api/topics/:id/questions — questions with images for a topic
router.get('/topics/:id/questions', async (req, res) => {
  try {
    const topicResult = await query('SELECT * FROM topics WHERE id = $1', [req.params.id]);
    if (!topicResult.rows.length) return res.status(404).json({ error: 'Topic not found' });

    const questionsResult = await query(
      'SELECT * FROM questions WHERE topic_id = $1 ORDER BY display_order ASC, id ASC',
      [req.params.id]
    );

    const questions = await Promise.all(
      questionsResult.rows.map(async (q) => {
        const imagesResult = await query(
          'SELECT * FROM question_images WHERE question_id = $1',
          [q.id]
        );
        return { ...q, images: imagesResult.rows };
      })
    );

    res.json({ ...topicResult.rows[0], questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// POST /api/ask — proxy to Groq API (API key never exposed to frontend)
router.post('/ask', async (req, res) => {
  try {
    const { question_id, professor_id, user_message } = req.body;

    if (!question_id || !professor_id) {
      return res.status(400).json({ error: 'question_id and professor_id are required' });
    }

    const qResult = await query(
      `SELECT q.*, t.name AS topic_name
       FROM questions q
       JOIN topics t ON q.topic_id = t.id
       WHERE q.id = $1`,
      [question_id]
    );
    if (!qResult.rows.length) return res.status(404).json({ error: 'Question not found' });
    const question = qResult.rows[0];

    const configResult = await query(
      'SELECT * FROM ai_config WHERE professor_id = $1',
      [professor_id]
    );

    const config = configResult.rows[0] || {
      system_prompt:
        'You are a knowledgeable and encouraging medical professor helping students prepare for viva voce examinations. Provide clear, accurate, and educational responses.',
      user_prompt_template:
        'Topic: {{topic_name}}\nOriginal Question: {{question_text}}\nStandard Answer: {{answer_html}}\n\nThe student asks: {{user_message}}\n\nPlease provide a helpful explanation.',
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1000,
    };

    const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, '').trim();

    const userPrompt = (config.user_prompt_template || '')
      .replace('{{topic_name}}', question.topic_name || '')
      .replace('{{question_text}}', question.question_text || '')
      .replace('{{answer_html}}', stripHtml(question.answer_html))
      .replace('{{user_message}}', user_message || 'Please explain this question and answer in detail.');

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: config.model || 'llama-3.3-70b-versatile',
      max_tokens: config.max_tokens || 1000,
      messages: [
        { role: 'system', content: config.system_prompt },
        { role: 'user', content: userPrompt },
      ],
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

export default router;
