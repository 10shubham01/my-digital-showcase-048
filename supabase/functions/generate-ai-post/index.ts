import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const { data: settings } = await supabase
      .from("ai_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const systemPrompt = settings?.system_prompt || "You are a sharp, witty tech content creator making Instagram carousel posts about the latest AI/ML news. Your tone is conversational, punchy, and fun to read -- like explaining tech to a smart friend over coffee.";
    const model = settings?.model || "google/gemini-2.5-flash";

    // Step 1: Scrape news
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured");

    const newsItems: string[] = [];
    const sourceUrls: string[] = [];

    const searchQueries = [
      "latest AI news",
      "new AI model released",
      "artificial intelligence breakthrough",
    ];

    for (const query of searchQueries) {
      if (newsItems.length >= 8) break;
      try {
        const searchResp = await fetch("https://api.firecrawl.dev/v1/search", {
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
        const searchData = await searchResp.json();
        console.log(`Search "${query}": status=${searchResp.status}, results=${searchData.data?.length || 0}, keys=${Object.keys(searchData)}`);
        if (searchData.data) {
          for (const item of searchData.data) {
            if (item.markdown) newsItems.push(item.markdown.slice(0, 2000));
            if (item.url) sourceUrls.push(item.url);
          }
        }
      } catch (e) {
        console.error("Search error:", e);
      }
    }

    if (newsItems.length === 0) {
      return new Response(
        JSON.stringify({ error: "No news found. Try again later." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Generate post with Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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
            content: `Based on the following AI/tech news scraped today, create an Instagram carousel post.

IMPORTANT RULES:
- Do NOT use any emojis anywhere in the content. Zero emojis.
- Write in a punchy, conversational tone. Short sentences. Active voice.
- Make headlines catchy and curiosity-driven (like "This changes everything" or "Here's what nobody's talking about")
- Bullet points should be concise insights, not boring summaries. Max 3-4 bullets per slide.
- Each bullet should be max 15 words.
- Think of it as "tech Twitter meets a magazine" -- sharp, opinionated, easy to scan.
- Use strong verbs and concrete numbers where possible.

NEWS CONTENT:
${newsContext}

Return a JSON response with this exact structure (no markdown, pure JSON):
{
  "title": "Catchy post title without emojis",
  "summary": "Engaging 2-3 sentence caption that hooks readers. No emojis. Write like you're texting a tech-savvy friend.",
  "hashtags": ["ai", "machinelearning", "tech", "aiupdate"],
  "slides": [
    {
      "type": "cover",
      "headline": "AI Updates",
      "subheadline": "March 8, 2026",
      "accent_color": "#6366f1"
    },
    {
      "type": "news",
      "headline": "Catchy headline here",
      "bullets": ["Short punchy point 1", "Point 2 with a number", "Why this matters in one line"],
      "source": "Source name",
      "accent_color": "#06b6d4"
    },
    {
      "type": "cta",
      "headline": "Stay Updated",
      "subheadline": "Follow for daily AI news",
      "accent_color": "#22c55e"
    }
  ]
}

Create 4-8 slides. First slide is always cover, last is always CTA. Middle slides are news items. Max 4 bullet points per news slide. No emojis anywhere.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_carousel_post",
              description: "Create a carousel post with slides",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  summary: { type: "string" },
                  hashtags: { type: "array", items: { type: "string" } },
                  slides: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["cover", "news", "cta"] },
                        headline: { type: "string" },
                        subheadline: { type: "string" },
                        bullets: { type: "array", items: { type: "string" } },
                        source: { type: "string" },
                        accent_color: { type: "string" },
                      },
                      required: ["type", "headline"],
                    },
                  },
                },
                required: ["title", "summary", "hashtags", "slides"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_carousel_post" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResp.text();
      throw new Error(`AI gateway error ${aiResp.status}: ${errText}`);
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let postContent;

    if (toolCall?.function?.arguments) {
      postContent = JSON.parse(toolCall.function.arguments);
    } else {
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        postContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse AI response");
      }
    }

    // Step 3: Try to find relevant images for ALL slides using Firecrawl search
    for (const slide of postContent.slides) {
      const searchQuery = slide.type === "cover"
        ? `AI artificial intelligence technology futuristic 2026`
        : slide.type === "cta"
        ? `AI community technology network abstract`
        : `${slide.headline} AI technology`;

      try {
        const imgSearch = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchQuery,
            limit: 3,
            scrapeOptions: { formats: ["links"] },
          }),
        });
        const imgData = await imgSearch.json();
        for (const result of (imgData.data || [])) {
          if (result?.metadata?.ogImage) {
            slide.image_url = result.metadata.ogImage;
            break;
          }
        }
      } catch {
        // Skip image search errors silently
      }
    }

    // Step 4: Save the post
    const { data: post, error: insertError } = await supabase
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

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, post }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ai-post error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
