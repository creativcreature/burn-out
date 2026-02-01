# BurnOut - Keys & Configuration

**STOP. READ THIS FIRST. DON'T ASK JAMES FOR KEYS.**

---

## API Keys Location

All keys are in **TWO places**:

### 1. Local Development (`.env`)
```
/Users/x/Documents/Projects/burnout/.env
```

Contains:
- `ANTHROPIC_API_KEY` — Claude AI
- `GEMINI_API_KEY` — Google Gemini
- `VITE_SUPABASE_URL` — Supabase
- `VITE_SUPABASE_ANON_KEY` — Supabase

### 2. Vercel Production
All keys are configured in Vercel for:
- ✅ Production
- ✅ Preview  
- ✅ Development

Verified 2026-02-01 via `vercel env ls`

---

## How to Use

### Local Development
```bash
cd ~/Documents/Projects/burnout
npm run dev
# Opens at http://localhost:3000
# Uses .env file automatically
```

### Deploy to Vercel
```bash
npm run build
npx vercel --prod
```

**Note:** Free tier = 100 deploys/day. If blocked, wait or upgrade.

---

## Services

| Service | Purpose | Key Location |
|---------|---------|--------------|
| Anthropic Claude | AI Chat | .env + Vercel |
| Google Gemini | Backup AI | .env + Vercel |
| Supabase | Database | .env + Vercel |
| Vercel | Hosting | CLI authenticated |

---

## NEVER ASK JAMES FOR KEYS AGAIN

They exist. They're configured. Check this file.

If something's not working, debug the CODE, not the keys.

---

*Last updated: 2026-02-01 by MiloX*
