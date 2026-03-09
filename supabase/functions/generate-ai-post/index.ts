import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) throw new Error("Unauthorized");

    const [settingsRes, recentPostsRes] = await Promise.all([
      supabase.from("ai_settings").select("*").eq("user_id", user.id).single(),

      supabase
        .from("ai_posts")
        .select("source_urls")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const settings = settingsRes.data;

    const systemPrompt =
      settings?.system_prompt ||
      "You are a sharp, witty tech content creator making Instagram carousel posts about the latest AI/ML news.";

    const model = settings?.model || "google/gemini-2.5-flash";

    const usedUrls = new Set<string>();

    for (const post of recentPostsRes.data || []) {
      for (const url of post.source_urls || []) {
        usedUrls.add(url);
      }
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured");

    const newsItems: string[] = [];
    const sourceUrls: string[] = [];
    const usedTitles = new Set<string>();

    const queries = shuffle([
      "latest AI news",
      "AI startup funding",
      "new AI model released",
      "generative AI tools launch",
      "machine learning research breakthrough",
      "OpenAI Google Anthropic AI news",
      "AI robotics automation news",
      "LLM benchmark results",
      "AI agents tools released",
    ]);

    const userSources: string[] = settings?.news_sources || [];
    for (const src of userSources) {
      queries.push(`${src} AI`);
    }

    for (const query of queries) {
      if (newsItems.length >= 8) break;

      try {
        const resp = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            limit: 5,
            scrapeOptions: { formats: ["markdown"] },
          }),
        });

        if (!resp.ok) {
          console.error("Firecrawl error:", await resp.text());
          continue;
        }

        const data = await resp.json();

        console.log(`Search "${query}" → ${data.data?.length || 0} results`);

        for (const item of data.data || []) {
          if (!item) continue;

          if (item.url && usedUrls.has(item.url)) continue;

          const title = (item.title || "").toLowerCase();

          if (title && usedTitles.has(title)) continue;

          let content = "";

          if (item.markdown) {
            content = item.markdown.slice(0, 2000);
          } else if (item.title || item.description) {
            content = `${item.title}\n${item.description || ""}`;
          }

          if (!content) continue;

          newsItems.push(content);

          if (item.url) sourceUrls.push(item.url);

          if (title) usedTitles.add(title);

          if (newsItems.length >= 8) break;
        }
      } catch (err) {
        console.error("Search failed:", err);
      }
    }

    if (newsItems.length < 3) {
      console.warn("Fallback search triggered");

      const resp = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: "latest artificial intelligence news",
          limit: 5,
          scrapeOptions: { formats: ["markdown"] },
        }),
      });

      const data = await resp.json();

      for (const item of data.data || []) {
        if (item.markdown) {
          newsItems.push(item.markdown.slice(0, 2000));
          sourceUrls.push(item.url);
        }
      }
    }

    if (newsItems.length === 0) {
      throw new Error("Failed to collect news");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const newsContext = newsItems.slice(0, 8).join("\n\n---\n\n");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Create an Instagram carousel post from this AI news:

${newsContext}

Return JSON only with:
title
summary
hashtags
slides`,
          },
        ],
      }),
    });

    if (!aiResp.ok) {
      throw new Error(await aiResp.text());
    }

    const aiData = await aiResp.json();

    const content = aiData.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) throw new Error("AI JSON parse failed");

    const postContent = JSON.parse(jsonMatch[0]);

    const { data: post, error } = await supabase
      .from("ai_posts")
      .insert({
        user_id: user.id,
        title: postContent.title,
        summary: postContent.summary,
        slides: postContent.slides,
        hashtags: postContent.hashtags,
        source_urls: sourceUrls.slice(0, 10),
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, post }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    console.error(e);

    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
