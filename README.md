# Tone Converter

Emotion-aware writing tool. The site reads the emotion of what you type (a
WebGL gradient and an animated robot assistant react as you write) and rewrites
angry, casual, or unclear text into clear, professional messages.

> Write it badly. Send it professionally.

## Setup

```bash
cp .env.local.example .env.local   # add at least one provider key
npm install
npm run dev
```

Open http://localhost:3000.

## How it works

Two analysis layers drive the experience:

1. **Instant heuristic** (`lib/emotion/heuristic.ts`): zero-latency lexical
   scoring on every keystroke. Produces an emotion (angry, frustrated,
   anxious, sad, excited, happy, calm), an intensity, and a "messiness"
   score. Drives the visuals immediately.
2. **LLM deep analysis** (`POST /api/analyze-emotion`): debounced, immediate
   on paste. Returns an empathetic summary and a suggested action such as
   *"Make it professional"*, which the avatar assistant proposes proactively.

The visuals respond through:

- **EmotionField** (`components/emotion/EmotionField.tsx`): a three.js
  domain-warped noise shader covering the page. Colors, speed, turbulence,
  and glitch follow the emotion; messy text shatters the field into jitter.
  Falls back to a pure-CSS aurora without WebGL or with reduced-motion.
- **Avatar** (`components/avatar/Avatar.tsx`): animated mascot that blinks,
  floats, morphs expressions, shakes when your text is furious, and shows
  thinking dots while the LLM reads.

## Layout

- `app/` - pages and API routes (`convert-tone`, `analyze-emotion`,
  `check-originality`, `providers`, `contact`, `feedback`)
- `components/` - converter UI, landing sections, the 3D avatar and the
  emotion field background
- `lib/` - provider layer, emotion heuristics, SEO copy for use-case pages

## Providers

Tone conversion runs through a pluggable provider layer (`lib/providers/`):

| Provider | Enabled when | Default model |
| --- | --- | --- |
| OpenAI | `OPENAI_API_KEY` set | `gpt-4o-mini` |
| Llama 3.2 (OpenRouter) | `OPENROUTER_API_KEY` set | `meta-llama/llama-3.2-3b-instruct:free` |
| Local model | always (uses `BACKEND_URL`, default `http://localhost:8000`) | prithivida Styleformer T5 |
| Claude | `ANTHROPIC_API_KEY` set | `claude-3-5-haiku-latest` |

OpenAI is the default engine (override the model with `OPENAI_MODEL`). The
emotion analysis and originality checker use the first configured key
(OpenAI, then Anthropic, then OpenRouter) in JSON mode.

When more than one provider is configured, an "Engine" selector appears in the
converter UI. Keys live server-side only; users never enter keys.

## API

- `POST /api/convert-tone`: `{ text, tone, length, provider }` returns `{ result }`
- `POST /api/analyze-emotion`: `{ text }` returns `{ emotion, intensity, messiness, summary, suggestion }`
- `POST /api/check-originality`: `{ text }` returns `{ aiLikelihood, originality, verdict, summary, passages }`
  (LLM stylistic analysis, not a web-crawl plagiarism database)
- `GET /api/providers`: list of enabled providers
- `POST /api/contact`: contact form stub
- `POST /api/feedback`: output feedback stub
