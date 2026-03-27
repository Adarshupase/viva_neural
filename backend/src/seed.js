import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db/index.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Run schema
    const schema = readFileSync(path.join(__dirname, 'db/schema.sql'), 'utf8');
    await client.query(schema);
    console.log('Schema applied');

    // Check if already seeded
    const existing = await client.query('SELECT COUNT(*) FROM professors');
    if (parseInt(existing.rows[0].count) > 0) {
      console.log('Database already has data. Skipping seed.');
      await client.query('ROLLBACK');
      return;
    }

    // Create professor
    const profResult = await client.query(
      `INSERT INTO professors (name, title, credentials, avatar_emoji, bio)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        'Dr. Aisha Nkrumah',
        'Professor of Internal Medicine',
        'MBBS, MD (Internal Medicine), FRCP',
        '👩‍⚕️',
        'Dr. Nkrumah is a seasoned clinician and educator with over 15 years of experience teaching medical students. She specialises in making complex physiological concepts accessible and exam-ready.',
      ]
    );
    const profId = profResult.rows[0].id;

    // Create topics
    const t1 = await client.query(
      `INSERT INTO topics (name, icon, professor_id, is_published, display_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['Cardiac Physiology', '🫀', profId, true, 1]
    );
    const t2 = await client.query(
      `INSERT INTO topics (name, icon, professor_id, is_published, display_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      ['Heart Failure', '💔', profId, true, 2]
    );

    // Create questions
    await client.query(
      `INSERT INTO questions (topic_id, question_text, difficulty, answer_html, display_order)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        t1.rows[0].id,
        'What is cardiac output and what are its determinants?',
        'easy',
        `<p><strong>Cardiac output (CO)</strong> is the volume of blood pumped by the heart per minute.</p>
<p><strong>Formula:</strong> CO = Stroke Volume (SV) × Heart Rate (HR)</p>
<p><strong>Normal value:</strong> 4–8 L/min (average ~5 L/min)</p>
<h4>Determinants of Stroke Volume:</h4>
<ul>
  <li><strong>Preload</strong> — venous return, end-diastolic volume</li>
  <li><strong>Afterload</strong> — systemic vascular resistance, aortic pressure</li>
  <li><strong>Contractility</strong> — intrinsic strength of myocardial contraction (inotropy)</li>
</ul>
<p><strong>Cardiac Index</strong> = CO / BSA (normal 2.5–4.0 L/min/m²)</p>`,
        1,
      ]
    );

    await client.query(
      `INSERT INTO questions (topic_id, question_text, difficulty, answer_html, display_order)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        t1.rows[0].id,
        'Explain the Frank-Starling mechanism.',
        'med',
        `<p>The <strong>Frank-Starling law</strong> states that the force of myocardial contraction is proportional to the initial length of the cardiac muscle fibre (end-diastolic volume).</p>
<p><strong>Mechanism:</strong> Increased venous return → increased EDV → myocardial stretch → improved actin-myosin overlap → greater force of contraction → increased stroke volume.</p>
<ul>
  <li>Allows the heart to match output to venous return automatically</li>
  <li>Maintains equal output from left and right ventricles</li>
  <li>Fails in dilated cardiomyopathy (overstretched, on descending limb)</li>
</ul>`,
        2,
      ]
    );

    await client.query(
      `INSERT INTO questions (topic_id, question_text, difficulty, answer_html, display_order)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        t2.rows[0].id,
        'What are the key differences between HFrEF and HFpEF?',
        'hot',
        `<p><strong>HFrEF</strong> (EF &lt; 40%) — systolic dysfunction, dilated ventricle. Causes: IHD, DCM. Treatment: ACEi/ARBs, beta-blockers, MRAs, SGLT2i.</p>
<p><strong>HFpEF</strong> (EF ≥ 50%) — diastolic dysfunction, stiff/hypertrophied ventricle. Causes: hypertension, diabetes, obesity. Treatment: diuretics, SGLT2i, manage comorbidities.</p>
<p><strong>HFmrEF</strong> (EF 40–49%) — mid-range, may respond to HFrEF therapies.</p>`,
        1,
      ]
    );

    // Create AI config
    await client.query(
      `INSERT INTO ai_config (professor_id, system_prompt, user_prompt_template, model, max_tokens)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        profId,
        `You are Dr. Aisha Nkrumah, a Professor of Internal Medicine. You help medical students prepare for viva voce examinations. Be clear, precise, and educational. Keep responses under 250 words unless depth is specifically needed.`,
        `Topic: {{topic_name}}\nQuestion: {{question_text}}\nStandard Answer: {{answer_html}}\n\nStudent asks: {{user_message}}\n\nRespond as Dr. Nkrumah would in a viva coaching session.`,
        'llama-3.3-70b-versatile',
        1000,
      ]
    );

    await client.query('COMMIT');
    console.log('Seed complete! 1 professor, 2 topics, 3 questions, AI config created.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
