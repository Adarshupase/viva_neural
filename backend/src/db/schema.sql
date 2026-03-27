CREATE TABLE IF NOT EXISTS professors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  credentials VARCHAR(500),
  avatar_emoji VARCHAR(10) DEFAULT '👨‍⚕️',
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50) DEFAULT '📚',
  professor_id INTEGER REFERENCES professors(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  difficulty VARCHAR(10) DEFAULT 'easy' CHECK (difficulty IN ('easy', 'med', 'hot')),
  answer_html TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_images (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT
);

CREATE TABLE IF NOT EXISTS ai_config (
  id SERIAL PRIMARY KEY,
  professor_id INTEGER REFERENCES professors(id) ON DELETE CASCADE UNIQUE,
  system_prompt TEXT,
  user_prompt_template TEXT,
  model VARCHAR(100) DEFAULT 'claude-opus-4-6',
  max_tokens INTEGER DEFAULT 1000
);
