# news-proxy Edge Function

Proxy for GNews API. Keeps the GNews API key server-side (never in frontend).

## Setup

1. Get a GNews API key from https://gnews.io/ (free tier: 100 req/day).
2. Add the secret to your Supabase project:
   ```
   supabase secrets set GNEWS_API_KEY=your_key_here
   ```
3. Deploy:
   ```
   supabase functions deploy news-proxy
   ```
4. Set `VITE_EDGE_FUNCTION_URL` in `.env` to your function URL:
   ```
   https://<project>.supabase.co/functions/v1/news-proxy
   ```

## Free tier limits

- 100 requests/day
- 10 articles per request
- 12-hour delay on news
- 30 days of history
- Non-commercial use only