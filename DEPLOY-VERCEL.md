# Deploying ED Code Assist to Vercel

This folder is the **Vercel twin** of the workspace version. The tool itself
— `public/ed-code-assist.html` — is **byte-identical** to the workspace build
(same `scripts/build_ed_code_assist.py` output, md5-matched), and **both
embedded pilot API keys stay in the HTML exactly as the owner instructed**
(the free Groq key is the default backend; the NVIDIA key remains switchable
in ⚙ Admin).

## What is different here vs the workspace version (and why)

| | Workspace (`/home/z/my-project`) | This folder (`vercel-deploy`) |
|---|---|---|
| Build script | `next build` + standalone copy steps (for `bun .next/standalone/server.js`) | plain `next build` (Vercel builds & serves itself) |
| `next.config.ts` | `output: "standalone"` | standalone removed (Vercel warns on it) |
| AI relay abort timer | 330 s | 295 s + `export const maxDuration = 300` (Vercel Functions cap: 300 s on Hobby w/ Fluid compute; up to 800 s on Pro) |
| Dev tooling | scripts/, icd-data/, research/, db/, prisma/ … | none — only what the deployed app needs |
| Tool HTML / prompts / keys | — | **identical, byte-for-byte** |

Everything else — the redirect page, the same-origin AI relay route, the
docs served from `public/` — is the same code.

## Path A — deploy with the Vercel CLI (fastest, ~3 minutes)

Prerequisites: a free Vercel account (https://vercel.com/signup — the Hobby
plan is enough) and Node 20+ installed.

```bash
npm i -g vercel          # or: bun i -g vercel
cd vercel-deploy
vercel login             # opens the browser to authenticate
vercel --prod            # first run: answer "Y" to set up, directory = ./
```

The first deploy uploads this folder (node_modules is ignored automatically),
installs dependencies and builds remotely. When it finishes it prints the URL:

```
https://<your-project>.vercel.app
```

Opening it redirects `/` → `/ed-code-assist.html` (the tool).

## Path B — deploy via GitHub (auto-redeploy on every push)

1. Create a new GitHub repository and push **the contents of this folder**
   (not the parent workspace — the workspace carries the whole build
   pipeline and research data):

   ```bash
   cd vercel-deploy
   git init && git add -A && git commit -m "ED Code Assist — Vercel twin (update 2.8)"
   git remote add origin https://github.com/<you>/ed-code-assist.git
   git push -u origin main
   ```

2. On vercel.com → **Add New… → Project** → import the repo.
3. Keep every default (framework auto-detected as Next.js, build command
   `next build`, install command auto from the lockfile) → **Deploy**.
4. Every future `git push` to `main` redeploys automatically; pull requests
   get their own preview URLs.

## After deploying — 2-minute verification checklist

1. `https://<project>.vercel.app` redirects to `/ed-code-assist.html` and the
   tool loads (Data & build info in the footer says **update 2.8**).
2. **Diagnosis tab**: search "chest pain" — works fully offline, no key needed.
3. **Clinical Notes tab**: paste a short note → **Alt+Q** (notes, DDX, ICD) —
   the DDx + codes come back through the embedded free Groq key, default
   model **gpt-oss-120b**; the run footer names the model.
4. Footer → **What's new** shows the 2.8 entry (workup gate, only Audit
   notes, Alt+Q/A/Y/N map, Tintinalli's index, the default-model switch).
5. Theme picker, tray, and the offline audit all work — they are all in the
   same single HTML file.

## How the AI backends behave on Vercel (identical to any hosted deploy)

- **Groq (the default)** — called **directly from each visitor's browser**
  to api.groq.com (it allows CORS). The embedded free key ships inside the
  HTML. This is the exact same path the workspace version uses — no server
  involved, so Vercel function limits never touch it.
- **NVIDIA NIM (GLM 5.3)** — same as on any non-localhost host: browsers
  cannot call it directly (CORS) and the bundled `ai_gateway.py` gateway is
  local-machine-only, so the tool itself shows its "on the deployed site,
  switch the provider to Groq" hint. Nothing to fix — by design, in both
  versions.
- The same-origin relay (`/api/ai/v1/chat/completions`) deploys as a Vercel
  Function (300 s cap, clean JSON timeout at 295 s) and stays available for
  manual use / future wiring — the tool's own gateway probe still targets
  `localhost:8787` by design, in both versions.

**A note on the embedded keys (per the owner's decision):** the free pilot
keys are intentionally kept in the public HTML. Anyone who opens the deployed
URL can read them in DevTools — fine for the free-tier pilot; rotate or strip
them before any wider rollout if you ever want to.

## Keeping the two versions in sync

After any change to the tool (template edits), rebuild once in the workspace
and sync — never edit the HTML inside this folder by hand:

```bash
# in the workspace:
cd /home/z/my-project/scripts && python3 build_ed_code_assist.py

# then in this folder:
./sync-from-workspace.sh          # copies ed-code-assist.html + the docs

# and redeploy:
vercel --prod                     # CLI path
git add -A && git commit -m "rebuild" && git push   # GitHub path
```

`sync-from-workspace.sh` prints the md5 so you can confirm the Vercel copy
matches the workspace build before deploying.

## Hobby-plan limits that matter here (all comfortably above our usage)

| Limit | Hobby value | This app |
|---|---|---|
| Function max duration | 300 s (Fluid compute, default for new projects) | relay capped at 295 s |
| Source upload size | 100 MB | ~5 MB (tool + docs) |
| Build time | 45 min | ~2–4 min |
| Deployments per day | 100 | — |
| Fast data transfer | 100 GB/month | ~5 MB per first page load, then cached |

If an **older** Vercel project (created before Fluid compute) rejects the
deploy with *"maxDuration between 1 and 60"*: Project → Settings → Functions
→ enable **Fluid Compute** (or lower `maxDuration` in
`src/app/api/ai/v1/chat/completions/route.ts` to 60).

## Troubleshooting

- **Build fails on Vercel** → reproduce locally first: `bun install && bun run build`
  inside this folder must succeed (it is verified in the workspace).
- **AI calls fail on the deployed site only** → check the network tab: the
  browser must reach `api.groq.com` (some hospital networks block it — that
  is a local network issue, not a Vercel one; the workspace has the NVIDIA
  gateway fallback for exactly that case).
- **Custom domain** → Project → Settings → Domains → add it; Vercel handles
  the certificate.
