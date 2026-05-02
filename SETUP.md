# 3DTSI Change Order — Production Setup

This guide walks through provisioning the cloud backend (D1 sync, Cloudflare Access, DocuSign). Each step is in priority order — you can stop after the GEMINI_API_KEY step and have a working single-device app, then add cloud sync and DocuSign when ready.

After each section, hit `https://your-pages.pages.dev/api/health` to verify the wiring. The response tells you exactly what's configured.

---

## 1. Gemini API key (required)

The app cannot generate change orders without this.

1. Get a Gemini key: https://aistudio.google.com/app/apikey
2. Restrict it (Google Cloud Console → APIs & Services → Credentials → click the key):
   - Application restriction: **HTTP referrers** → add your Pages domain
   - API restriction: **Generative Language API** only
3. In Cloudflare Pages → Settings → Environment variables:
   - Add `GEMINI_API_KEY` (production + preview)
   - **NO `VITE_` prefix** — it must stay server-side
4. Redeploy.

Verify: `/api/health` shows `gemini.configured: true`.

---

## 2. D1 cloud sync (required for multi-device / multi-coordinator)

Without this, every coordinator's history/customers/templates live only in their own browser. With this, all data is shared across the org.

```bash
# From your local checkout, with you logged into Cloudflare:
npm run setup:d1
```

This script:
1. Logs you in to Cloudflare (interactive, browser opens — first time only)
2. Creates the D1 database `co-storage` (or reuses existing)
3. Patches `wrangler.toml` with the database UUID — **commit this change**
4. Runs the schema migration (creates the `blobs` table)

**Then in the Cloudflare Pages dashboard** (the one piece I can't script):
- Pages → your project → Settings → Functions → D1 database bindings
- Click "Add binding": Variable = `DB`, D1 database = `co-storage`
- Save and redeploy (push to main, or manual deploy)

Verify: `/api/health` shows `cloudSync.d1Bound: true`.

---

## 3. Cloudflare Access (required to protect /api/data*)

Cloud sync without auth = anyone on the internet can read/write your CO history. Cloudflare Access is the simplest way to gate it.

1. Cloudflare → Zero Trust → Access → Applications → Add Application
2. Choose **Self-hosted**
3. Application configuration:
   - Application name: `3DTSI CO Tool API`
   - Session duration: 24 hours (or your preference)
   - Application domain: `your-pages.pages.dev` path `/api/data*`
   - Add a second domain entry for `/api/health` (so the setup banner works)
4. Identity providers: pick what your team uses (Google Workspace, Microsoft, OTP-email)
5. Policy:
   - Action: Allow
   - Include: Emails ending in `@3dtsi.com` (or whatever your domain is)
6. Save

Verify: open `/api/data` in a browser. You should be redirected to a login page first time, then see a JSON response after auth.

`/api/health` will now show `cloudSync.userEmail` populated with your authenticated email.

---

## 4. DocuSign (optional — for in-app e-signature)

Without this, the "Send for e-signature" button shows a "not configured" message. The app still works fine; coordinators can email PDFs manually.

### One-time DocuSign account setup (~30 minutes)

1. Create a developer account: https://developers.docusign.com (free)
2. Apps and Keys → Add App and Integration Key
   - Note the **Integration Key** (used as `DOCUSIGN_INTEGRATION_KEY`)
3. Generate an RSA keypair:
   ```bash
   openssl genrsa -out docusign_private.pem 2048
   openssl rsa -in docusign_private.pem -pubout -out docusign_public.pem
   ```
4. In your DocuSign app settings:
   - Authentication: enable "JWT Grant"
   - Add the **public key** (paste the contents of `docusign_public.pem`)
   - Save
5. Find your **User ID (GUID)**: My Profile → My API Information (32-char UUID)
6. Find your **Account ID**: Settings → API and Keys → API Account ID

### One-time consent grant (required for JWT)

DocuSign's JWT flow requires the impersonated user to grant consent **once**, in a browser. Visit (substitute your integration key):

```
https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=YOUR_INTEGRATION_KEY&redirect_uri=https%3A%2F%2Fwww.docusign.com
```

(Use `account.docusign.com` instead of `account-d.docusign.com` for production.)

Click **Allow**. You don't need to do anything with the redirect — the consent record is what matters.

### Cloudflare Pages env vars

Pages → Settings → Environment variables, add:

| Variable | Value | Notes |
|---|---|---|
| `DOCUSIGN_INTEGRATION_KEY` | from app settings | |
| `DOCUSIGN_USER_ID` | the 32-char GUID | |
| `DOCUSIGN_ACCOUNT_ID` | the API account ID | |
| `DOCUSIGN_RSA_PRIVATE_KEY` | contents of `docusign_private.pem` | including the `-----BEGIN…END-----` lines |
| `DOCUSIGN_BASE_URL` | `https://demo.docusign.net` (testing) or `https://www.docusign.net` (prod) | |
| `DOCUSIGN_OAUTH_HOST` | `https://account-d.docusign.com` (testing) or `https://account.docusign.com` (prod) | |

Redeploy.

Verify: `/api/health` shows `docusign.configured: true`. Send a test envelope to your own email first.

---

## 5. Optional but recommended

### Origin lockdown (prevent quota draining)

Pages env vars:
- `ALLOWED_ORIGINS`: comma-separated list (e.g. `https://your-pages.pages.dev,https://co.3dtsi.com`)

If unset, defaults to same-origin only — fine for most cases.

### Rate limit tuning (multi-office NAT)

Pages env vars:
- `RATE_LIMIT_PER_MINUTE`: default 200. If your office shares one IP and 10 coordinators are bidding simultaneously, raise to 500.

### Margin floor calibration

Edit `constants.tsx`:
- `DEFAULT_MATERIAL_COST_FACTOR`, `DEFAULT_EQUIPMENT_COST_FACTOR`, `DEFAULT_LABOR_COST_FACTOR` — match your real wholesale and loaded labor costs
- `MARGIN_FLOOR_PCT` — floor your finance team is comfortable with
- `TAX_ON_MARKED_UP_PRICE` — flip to `true` if your accountant says so (CDTFA Reg 1521)

---

## Health-check cheat sheet

`GET /api/health` returns a JSON snapshot. Map response fields to remediation:

| Field | If false / null | Fix |
|---|---|---|
| `integrations.gemini.configured` | Set `GEMINI_API_KEY` |
| `integrations.cloudSync.d1Bound` | Bind D1 → `DB` in Pages dashboard |
| `integrations.cloudSync.accessEnabled` | Configure Access for `/api/data*` and `/api/health` |
| `integrations.docusign.configured` | Set the four `DOCUSIGN_*` env vars |
