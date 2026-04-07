# InkedIn

**AI-powered LinkedIn post generator** — craft compelling, personalised LinkedIn posts in seconds.

🔗 **Live:** [inkedin-gamma.vercel.app](https://inkedin-gamma.vercel.app)

---

## What it does

InkedIn takes a topic or idea you want to post about and turns it into a polished LinkedIn post using Google Gemini AI. You control the tone, length, style, and format through an intuitive set of sliders and toggles. If your topic is too vague, the AI asks follow-up questions to gather enough detail before generating.

---

## Features

- **AI generation** — powered by Google Gemini 2.5 Flash
- **Smart follow-up questions** — if your topic lacks detail the AI asks up to 3 targeted questions before generating
- **Tone & style sliders** — fine-tune 5 dimensions:
  - Professional ↔ Friendly
  - Serious ↔ Casual
  - Short ↔ Detailed
  - Safe ↔ Bold
  - Personal ↔ Corporate
- **Format toggles** — hook at the beginning, emojis, call-to-action at the end
- **Poster identity** — choose from CEO, CTO, Founder, Student, and more, or type your own
- **Profile personalisation** — paste your LinkedIn headline and About section so the AI matches your voice
- **Post history** — last 10 generated posts saved in your browser, accessible from the navbar
- **Your own API key** — use the shared key by default or save your own Gemini key (stored only in your browser)
- **Rate limit guidance** — clear step-by-step instructions to get a free API key when the shared one runs out
- **Dark / Light mode**
- **Copy to clipboard**

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Animation | Framer Motion |
| AI | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| Routing | React Router v6 |
| Storage | Browser localStorage (no backend, no database) |

---

## Running locally

**Prerequisites:** Node.js 18+

```bash
# 1. Clone the repo
git clone https://github.com/your-username/inkedin.git
cd inkedin

# 2. Install dependencies
npm install

# 3. Add your Gemini API key
# Create a .env file in the root with:
# VITE_GEMINI_API_KEY=your_key_here

# 4. Start the dev server
npm run dev
```

Open [http://localhost:8080](http://localhost:8080).

### Getting a Gemini API key

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey) and sign in with Google
2. Click **"Create API key"**
3. Select or create a project
4. Copy the key and paste it into `.env` as `VITE_GEMINI_API_KEY`

The free tier includes 1,500 requests/day and 15 requests/minute — more than enough for personal use.

---

## Project structure

```
src/
├── components/
│   ├── PostGenerator.tsx   # Main generator UI + all settings
│   ├── PostHistory.tsx     # Slide-in history panel
│   ├── Navbar.tsx          # Top nav with history + theme toggle
│   ├── HeroSection.tsx     # Landing hero
│   ├── HowItWorks.tsx      # 3-step explainer
│   ├── Footer.tsx
│   └── ThemeToggle.tsx
├── lib/
│   ├── gemini.ts           # Gemini API client + prompt builder
│   ├── history.ts          # localStorage helpers for post history
│   └── linkedinScraper.ts  # LinkedIn profile interface
└── pages/
    └── Index.tsx
```

---

## How the AI prompt works

Every generation call passes:

- The user's **role** (CEO, Student, custom, etc.)
- **Tone settings** derived from the 5 sliders — translated into natural language instructions (e.g. *"very short — maximum 80 words, 2–3 tight sentences"*)
- **Explicit DO / DO NOT rules** for every toggle (e.g. *"DO NOT use any emojis whatsoever — none at all"*)
- **Profile info** if the user provided a headline or bio
- **Follow-up answers** if the AI requested more detail in a previous round

The model is instructed to respond with JSON only — either a post or a list of follow-up questions.

---

## Deployment

The app is a static SPA — deploy anywhere that serves static files.

**Vercel (recommended):**

Connect your GitHub repo to Vercel — it auto-detects Vite and builds automatically. Set `VITE_GEMINI_API_KEY` in your Vercel project's environment variables.

```bash
# Or build manually
npm run build
```

> **Note:** The API key set in `VITE_GEMINI_API_KEY` is the shared default key visible in the browser bundle. It is rate-limited and intended for demo use. Users can always supply their own key through the UI — it is stored only in their browser's localStorage and never sent to any server.

---

## Scripts

```bash
npm run dev        # Start dev server (port 8080)
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # ESLint
npm run test       # Run tests (Vitest)
```
