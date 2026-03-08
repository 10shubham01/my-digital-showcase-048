import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured");

    const { query } = await req.json();
    if (!query) throw new Error("Query is required");

    // Search for relevant images using Firecrawl
    const searchResp = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `${query} technology AI`,
        limit: 8,
        scrapeOptions: { formats: ["links"] },
      }),
    });

    const searchData = await searchResp.json();
    if (!searchResp.ok) {
      throw new Error(`Firecrawl error ${searchResp.status}: ${JSON.stringify(searchData)}`);
    }

    // Extract og:image URLs from results
    const images: { url: string; title: string; source: string }[] = [];
    for (const result of (searchData.data || [])) {
      const ogImage = result?.metadata?.ogImage;
      if (ogImage && !ogImage.includes("data:image")) {
        images.push({
          url: ogImage,
          title: result?.metadata?.title || result?.title || "",
          source: result?.url || "",
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, images }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-slide-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
