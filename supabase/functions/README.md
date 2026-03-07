# Edge Functions

## generate-ai-post

**If you see `supabaseKey is required.`:**

1. **Redeploy the function** so the latest code is live (it uses `SUPABASE_ANON_KEY` with fallback to `SUPABASE_PUBLISHABLE_KEY`):
   ```bash
   supabase functions deploy generate-ai-post
   ```

2. **If the error persists**, set the anon key as a secret (some hosts don’t inject it automatically):
   - Supabase Dashboard → **Project Settings** → **API** → copy the **anon public** key.
   - Go to **Edge Functions** → **Secrets** (or **Project Settings** → **Edge Functions**).
   - Add secret: name `SUPABASE_ANON_KEY`, value = the anon key you copied.
   - Redeploy the function after saving the secret.

Required secrets for `generate-ai-post`:

- `SUPABASE_URL` – usually set by Supabase
- `SUPABASE_ANON_KEY` or `SUPABASE_PUBLISHABLE_KEY` – anon/public API key (set manually if needed)
- `FIRECRAWL_API_KEY` – for news scraping
- `LOVABLE_API_KEY` – for image generation (if used)
