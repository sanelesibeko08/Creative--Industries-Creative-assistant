# Creative Ideation & Storytelling Assistant

An AI-powered creative tool built for the IBM Bob hackathon.  
Helps creators **brainstorm**, **structure**, **draft**, and **visualise** content faster — powered by IBM Granite via watsonx.ai.

---

## Features

| Mode | What it does |
|------|-------------|
| **Brainstorm** | Enter a theme → get 5 creative directions from the AI |
| **Outline** | Turn ideas into a structured 3-act outline |
| **Draft** | Expand any outline scene into polished prose, streamed live |
| **Visual** | Generate an image from a concept via Stable Diffusion |
| **Export** | Download any session as Markdown or PDF |
| **Preferences** | Set preferred genre, tone, and style — injected into every prompt |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│               Next.js 14 (App Router)               │
│                                                     │
│  ┌─────────────────┐  ┌──────────────────────────┐  │
│  │  React Frontend │  │     API Routes           │  │
│  │  Tailwind CSS   │──│  POST /api/brainstorm     │  │
│  │  SessionContext │  │  POST /api/outline        │  │
│  │  ExportButton   │  │  POST /api/draft (SSE)    │  │
│  └─────────────────┘  │  POST /api/visual         │  │
│                       │  GET/POST /api/sessions   │  │
│                       │  GET/PATCH /api/prefs     │  │
│                       └────────────┬─────────────┘  │
└────────────────────────────────────│────────────────┘
                                     │
              ┌──────────────────────┼──────────────────┐
              │                      │                  │
              ▼                      ▼                  ▼
 ┌──────────────────────┐  ┌──────────────┐  ┌──────────────┐
 │ AI Provider          │  │ Hugging Face │  │  Supabase    │
 │ dev:  OpenAI GPT-4o  │  │ Stable Diff  │  │  PostgreSQL  │
 │ prod: IBM Granite    │  │ (image gen)  │  │  sessions    │
 │       watsonx.ai     │  └──────────────┘  │  messages    │
 └──────────────────────┘                   │  preferences │
                                            └──────────────┘
```

### Switching from OpenAI → IBM Granite

Set `AI_PROVIDER=watsonx` in `.env.local` and fill in the watsonx credentials.  
**No code changes required** — the AI layer uses a provider abstraction.

---

## Prerequisites

- **Node.js 18+** and npm
- **Supabase** account (free tier): https://supabase.com
- **OpenAI** API key (dev) or **IBM Cloud** account + watsonx.ai project (production)
- **Hugging Face** account + API token: https://huggingface.co/settings/tokens

---

## Setup

### 1. Clone & install

```bash
git clone <repo-url>
cd creative-assistant
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in:

```env
# AI provider: "openai" (dev) or "watsonx" (IBM Granite)
AI_PROVIDER=openai

# OpenAI (dev stand-in)
OPENAI_API_KEY=sk-...

# IBM watsonx.ai (switch AI_PROVIDER=watsonx once you have these)
WATSONX_API_KEY=
WATSONX_PROJECT_ID=
WATSONX_URL=https://us-south.ml.cloud.ibm.com

# Hugging Face (image generation)
HF_API_TOKEN=hf_...

# Supabase
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
```

### 3. Set up Supabase database

1. Create a new project at https://supabase.com
2. Open **SQL Editor** → paste the contents of `supabase/migrations/001_initial_schema.sql` → **Run**
3. Copy your **Project URL** and **anon key** into `.env.local`

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Usage Walkthrough

1. **Click "Start Creating"** on the home page — a new session is created automatically
2. **Brainstorm tab** → enter a theme (e.g. *"a detective who can rewind time"*) → click **Generate**
3. **Select ideas** you like → click **Send to Outline**
4. **Outline tab** → your ideas are pre-loaded → click **Generate Outline**
5. **Draft tab** → pick a scene from the outline dropdown → click **Write Draft** — text streams live
6. **Visual tab** → describe a scene → click **Generate** — get an image + SD prompt
7. **Export button** (top-right) → Download Markdown or Export as PDF
8. **Settings icon** → change preferred genre, tone, and style

---

## Switching to IBM Granite (production)

Once you have an IBM Cloud account and a watsonx.ai project:

1. Set `AI_PROVIDER=watsonx` in `.env.local`
2. Fill in `WATSONX_API_KEY`, `WATSONX_PROJECT_ID`, and `WATSONX_URL`
3. Restart `npm run dev`

The model used is `ibm/granite-13b-instruct-v2` — no other code changes needed.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 19, Tailwind CSS v4 |
| Backend | Next.js API Routes (Node.js) |
| AI — dev | OpenAI GPT-4o |
| AI — prod | IBM Granite `granite-13b-instruct-v2` via watsonx.ai |
| Images | Hugging Face Inference API (Stable Diffusion XL) |
| Database | Supabase (PostgreSQL) |
| Validation | Zod |
| Icons | lucide-react |

---

## Project Structure

```
creative-assistant/
├── app/
│   ├── api/             # Next.js API routes
│   │   ├── brainstorm/
│   │   ├── draft/
│   │   ├── outline/
│   │   ├── preferences/
│   │   ├── sessions/
│   │   └── visual/
│   ├── session/
│   │   ├── [id]/        # Workspace page
│   │   └── new/         # Redirect → creates session
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── layout.tsx
│   └── page.tsx         # Landing page
├── components/
│   ├── workspace/       # BrainstormPanel, OutlinePanel, DraftPanel, VisualPanel
│   ├── ExportButton.tsx
│   ├── MessageHistory.tsx
│   ├── PreferencesPanel.tsx
│   └── Sidebar.tsx
├── context/
│   └── SessionContext.tsx
├── lib/
│   ├── ai/              # OpenAI + watsonx.ai clients + router
│   ├── db/              # Supabase CRUD helpers
│   ├── export/          # Markdown + PDF export
│   ├── prompts/         # System prompts for each mode
│   ├── validators/      # Zod request schemas
│   ├── env.ts
│   ├── huggingface.ts
│   └── supabase.ts
├── scripts/
│   └── test-ai.ts       # AI smoke test
└── supabase/
    └── migrations/      # SQL schema
```
