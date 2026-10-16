# Aloka Intelligence — Animated Chat UI

A minimal dark chatbot interface with a reactive animated orb, animated ambient light, responsive sidebar, prompt cards, message states, copy actions, and a functional composer. Built with React 19 + Vite + plain CSS + lucide-react.

## Run locally

```bash
npm install
npm run dev
```

## Connect a backend

1. Copy `.env.example` to `.env`.
2. Set `VITE_API_URL` to your FastAPI base URL (without a trailing slash), for example `https://your-api.example.com`.
3. The sample sends `POST {VITE_API_URL}/chat` with JSON `{ "message": "..." }` and expects a JSON response containing one of `response`, `answer`, or `message`.
4. If your backend uses another route or request/response schema, update the `fetch()` block in `src/App.jsx` to match it.

When `VITE_API_URL` is empty, the interface uses local demo responses. It does not access a police database or create real case records.

## Notes
- The add-attachment and voice controls are visual placeholders, not implemented features.
- Google Fonts are loaded over the internet; system fallback fonts are provided.
- To use inside an existing Vite app, copy `src/App.jsx` and `src/styles.css`, then render `App` from your existing entry point. Keep your current app's dependencies and scripts.
