# Medical Viva Voce Study Platform

A full-stack web application for medical viva voce exam preparation.
Students browse professors and topics, read collapsible Q&A cards, and chat with an AI professor.
Admins manage all content via a protected panel.

---

## What You Need to Change Before It Works

There are **3 things** you must configure before the app runs:

### 1. Groq API Key (AI chat — free)
1. Go to **https://console.groq.com** and sign up (no credit card needed)
2. Click **API Keys → Create API Key**
3. Copy the key that starts with `gsk_...`
4. Paste it into your `.env` file as `GROQ_API_KEY=gsk_your_key_here`

### 2. Admin Password
In your `.env` file, change:
```
ADMIN_PASSWORD=admin123
```
to anything you want. This is what you type at `/admin/login`.

### 3. JWT Secret
In your `.env` file, change:
```
JWT_SECRET=change-me-to-a-long-random-secret
```
to a long random string (e.g. run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` in a terminal).

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 20+
- PostgreSQL running locally **OR** Docker + Docker Compose

---

### Option A — Run with Docker Compose (easiest)

```bash
# 1. Clone / enter the project
cd /path/to/website

# 2. Copy env file and fill in your Groq key
cp .env.example .env
# Edit .env: set GROQ_API_KEY

# 3. Start everything (postgres + backend + frontend)
docker-compose up --build

# 4. In a separate terminal, seed the database
docker-compose exec backend node src/seed.js
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Admin panel: http://localhost:5173/admin/login

---

### Option B — Run without Docker

```bash
# ── Terminal 1: Start PostgreSQL
# (Make sure PostgreSQL is installed and running)
# Create a database:
createdb vivavoce

# ── Copy and configure environment
cp .env.example .env
# Edit .env:
#   DATABASE_URL=postgresql://youruser:yourpassword@localhost:5432/vivavoce
#   GROQ_API_KEY=gsk_...
#   ADMIN_PASSWORD=yourpassword
#   JWT_SECRET=your-long-random-secret

# ── Terminal 1: Backend
cd backend
npm install
npm run seed      # creates tables + sample data
npm run dev       # starts on http://localhost:3000

# ── Terminal 2: Frontend
cd frontend
npm install
npm run dev       # starts on http://localhost:5173
```

---

## Seeded Sample Data

After running `npm run seed`, you'll have:
- **1 Professor**: Dr. Aisha Nkrumah (Internal Medicine)
- **2 Topics**: Cardiac Physiology, Heart Failure
- **3 Questions** with full HTML answers
- **AI Config** pre-configured for the professor

---

## Project Structure

```
/
├── backend/
│   ├── src/
│   │   ├── index.js          ← Express app entry point
│   │   ├── seed.js           ← Seed script (run once)
│   │   ├── db/
│   │   │   ├── index.js      ← PostgreSQL pool
│   │   │   └── schema.sql    ← Table definitions
│   │   ├── middleware/
│   │   │   └── auth.js       ← JWT verification
│   │   └── routes/
│   │       ├── auth.js       ← POST /api/auth/login
│   │       ├── public.js     ← Public student API
│   │       └── admin.js      ← Protected admin CRUD
│   └── package.json
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx         ← Professor cards
│       │   ├── ProfessorPage.jsx   ← Topics grid
│       │   ├── TopicPage.jsx       ← Q&A cards
│       │   └── admin/
│       │       ├── Login.jsx
│       │       ├── Dashboard.jsx
│       │       ├── ProfessorsManager.jsx
│       │       ├── TopicsManager.jsx
│       │       ├── QuestionsManager.jsx
│       │       └── AIConfigEditor.jsx
│       ├── components/
│       │   ├── QuestionCard.jsx    ← Collapsible card with AI button
│       │   ├── AskProfessor.jsx    ← AI chat modal
│       │   └── Lightbox.jsx        ← Image viewer
│       └── lib/
│           └── api.js              ← All fetch calls
│
├── Dockerfile                ← Production build
├── Dockerfile.dev            ← Dev hot-reload
├── docker-compose.yml        ← Local dev stack
└── .env.example
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `GROQ_API_KEY` | Yes | From console.groq.com (free) |
| `JWT_SECRET` | Yes | Random secret for signing tokens |
| `ADMIN_PASSWORD` | Yes | Password for /admin/login |
| `PORT` | No | Backend port (default: 3000) |
| `NODE_ENV` | No | `development` or `production` |
| `CORS_ORIGIN` | No | Restrict CORS in production |

---

## Deployment (Railway or Render)

### Railway
1. Push the repo to GitHub
2. New Project → Deploy from GitHub
3. Set **Root Directory** to `/` (uses the `Dockerfile`)
4. Add environment variables in Railway dashboard:
   - `DATABASE_URL` (Railway provides a free Postgres plugin — click **+ New** → **Database** → **PostgreSQL**)
   - `GROQ_API_KEY`
   - `JWT_SECRET`
   - `ADMIN_PASSWORD`
   - `NODE_ENV=production`
5. After first deploy, open a shell and run: `node src/seed.js`

### Render
1. New Web Service → connect GitHub repo
2. Build Command: `cd frontend && npm install && npm run build && cd ../backend && npm install`
   (or use the Dockerfile — select **Docker** as environment)
3. Set environment variables same as above
4. Add a Render PostgreSQL database and copy its `DATABASE_URL`

---

## Switching AI Provider (Optional)

The AI is powered by **Groq** (free, uses Llama 3.3 70B by default).

To switch to a different provider, edit **`backend/src/routes/public.js`** and **`backend/src/routes/admin.js`**:

### Switch to OpenAI
```bash
cd backend && npm install openai
```
Replace in both files:
```js
// Before:
import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const completion = await groq.chat.completions.create({ model: ..., messages: [...] });
const text = completion.choices[0].message.content;

// After:
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const completion = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [...] });
const text = completion.choices[0].message.content;
```
Update `.env`: replace `GROQ_API_KEY` with `OPENAI_API_KEY`.

### Switch to Google Gemini (free tier)
```bash
cd backend && npm install @google/generative-ai
```
```js
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const result = await model.generateContent(systemPrompt + '\n\n' + userPrompt);
const text = result.response.text();
```
Get a free key at https://aistudio.google.com/app/apikey

### Groq Free Tier Limits
- 30 requests/minute
- 14,400 requests/day
- Models: llama-3.3-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768, gemma2-9b-it

---

## Admin Usage

1. Go to `/admin/login` — enter your `ADMIN_PASSWORD`
2. **Professors** → Add professors with name, emoji, title, bio
3. **Topics** → Add topics per professor, toggle Published on/off
4. **Questions** → Add Q&A per topic, write HTML answers, set difficulty, attach image URLs
5. **AI Config** → Edit system prompt and user prompt template per professor, test live

> The "Published" toggle on topics controls what students see. Unpublished topics are hidden from the student view.

---

## Answer HTML Reference

The answer field accepts HTML. Supported tags:

```html
<p>Paragraph text</p>
<strong>Bold / key term</strong>
<em>Italic</em>
<h4>Sub-heading</h4>
<ul><li>Bullet point</li></ul>
<ol><li>Numbered list</li></ol>
<code>Inline code / formula</code>
```

---

## Troubleshooting

**"Failed to initialize database"** → Check `DATABASE_URL` is correct and PostgreSQL is running.

**"Invalid credentials"** at admin login → Check `ADMIN_PASSWORD` in your `.env` matches what you typed.

**AI returns an error** → Verify `GROQ_API_KEY` is set and valid. Test at console.groq.com.

**CORS errors in browser** → Make sure the Vite proxy is running (dev) or `CORS_ORIGIN` is set correctly (prod).

**Port already in use** → Change `PORT=3001` in `.env`.
