# ED Code Assist — Vercel twin

The deployable copy of ED Code Assist (update 2.8) for Vercel. The tool
(`public/ed-code-assist.html`) is byte-identical to the workspace build —
same file, same embedded pilot keys, same behavior.

**Deploy: follow [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md).**

What's here on top of the workspace app:

- plain `next build` (no standalone output) — Vercel builds and serves itself
- the AI relay route carries `maxDuration = 300` + a 295 s abort timer
  (Vercel Functions caps; see the route header comment)
- `sync-from-workspace.sh` — pull a fresh tool build into this folder
- `DEPLOY-VERCEL.md` — the full deployment + sync + troubleshooting guide

Served routes:

- `/` → redirects to `/ed-code-assist.html` (the tool)
- `/ed-code-assist.html` — the tool (single self-contained file)
- `/README.md`, `/PROMPT.md`, `/LOGIC.md` — the project docs
- `/api/ai/v1/chat/completions` — same-origin AI relay (POST; GET returns info)
