/* ==========================================================================
   Supabase Edge Function: news-proxy
   Proxies GNews API so the secret key never reaches the frontend.
   Deploy: supabase functions deploy news-proxy
   ========================================================================== */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const GNEWS_API_KEY = Deno.env.get("GNEWS_API_KEY");
const GNEWS_BASE = "https://gnews.io/api/v4";
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "content-type" };
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { ...CORS, "content-type": "application/json" } });

serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "content-type",
      },
    });
  }

  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "technology";
    const maxText = url.searchParams.get("max") || "10";
    const max = Number(maxText);
    const lang = url.searchParams.get("lang") || "id";

    if (category !== "technology" || !/^\d+$/.test(maxText) || !Number.isInteger(max) || max < 1 || max > 10 || !/^[a-z]{2}$/.test(lang)) {
      return json({ error: "Invalid parameters" }, 400);
    }
    if (!GNEWS_API_KEY) return json({ error: "News service unavailable" }, 503);

    const res = await fetch(
      `${GNEWS_BASE}/top-headlines?category=${encodeURIComponent(category)}&max=${max}&lang=${encodeURIComponent(lang)}&apikey=${GNEWS_API_KEY}`
    );

    const data = await res.json();

    return json(data, res.status);
  } catch {
    return json({ error: "News service unavailable" }, 502);
  }
});