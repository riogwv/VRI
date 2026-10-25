/* ==========================================================================
   Supabase Edge Function: news-proxy
   Proxies GNews API so the secret key never reaches the frontend.
   Deploy: supabase functions deploy news-proxy
   ========================================================================== */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GNEWS_API_KEY = Deno.env.get("GNEWS_API_KEY");
const GNEWS_BASE = "https://gnews.io/api/v4";

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

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "technology";
    const max = parseInt(url.searchParams.get("max") || "10", 10);
    const lang = url.searchParams.get("lang") || "id";

    if (!GNEWS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GNews API key not configured on server" }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const res = await fetch(
      `${GNEWS_BASE}/top-headlines?category=${encodeURIComponent(category)}&max=${max}&lang=${encodeURIComponent(lang)}&apikey=${GNEWS_API_KEY}`
    );

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
});