# OTTRESTORATIONS

Vanilla static CRM for Over The Top Restoration — **no build step**. Deploy from this GitHub repo to Netlify.

## Netlify site `t-o-p`

| What | Value |
|------|--------|
| **Production URL** | [https://t-o-p.netlify.app/](https://t-o-p.netlify.app/) |
| **Netlify project slug** | `t-o-p` (shown in the dashboard — not the same as the GitHub repo name) |
| **GitHub (Netlify deploy)** | `zaveirdaley-cell/t-o-p` — branch **`main`** (same app as this folder; `origin` may point at `daleypaulk-ux/OTTRESTORATIONS` for a second remote) |

Continuous deployment: link **this** repo in Netlify (**Project configuration → Build & deploy → Continuous deployment**), branch **`main`**.

Build settings are defined in [`netlify.toml`](netlify.toml):

- **Publish directory:** `.` (repository root)
- **Functions directory:** `netlify/functions`
- **Node (build/functions):** `22`

Leave the Netlify **build command** empty unless you add a build pipeline later.

### Environment variables (set in Netlify, not in git)

Configure under **Project configuration → Environment variables**:

| Variable | Purpose |
|----------|---------|
| `ANTHROPIC_API_KEY` | Claude proxy ([`netlify/functions/anthropic-proxy.js`](netlify/functions/anthropic-proxy.js)) |
| `WEBHOOK_LEAD_SECRET` | Website lead webhook ([`netlify/functions/webhook-lead.js`](netlify/functions/webhook-lead.js)) |
| `HAILTRACE_APP_ID` | HailTrace proxy ([`netlify/functions/hail-proxy.mjs`](netlify/functions/hail-proxy.mjs)) |
| `HAILTRACE_API_KEY` | Optional, if HailTrace issues a bearer token |

Redeploy after changing variables.

### Manual “Drop” vs Git

If the site used **Netlify Drop** before, linking this repository replaces manual uploads. The live site then tracks **`main`** on `OTTRESTORATIONS`.

There is **no** separate GitHub repository required named `t-o-p`. To rename the GitHub repo to match the Netlify name, use **GitHub → Settings → General → Repository name** (optional).
