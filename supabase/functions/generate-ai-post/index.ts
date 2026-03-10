import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    const [settingsRes, recentPostsRes] = await Promise.all([
      supabase.from("ai_settings").select("*").eq("user_id", user.id).single(),
      supabase.from("ai_posts").select("title").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);

    const settings = settingsRes.data;
    const systemPrompt = settings?.system_prompt ||
      "You are a sharp, witty tech content creator making Instagram carousel posts about the latest AI/ML news.";
    const model = settings?.model || "google/gemini-3-flash-preview";

    const recentTitles = (recentPostsRes.data || []).map((p: any) => p.title).join(", ");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    // Step 1: Generate post content
    console.log("[STEP 1] Generating post content with model:", model);
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
            content: `Today is ${today}. You are an AI news expert with deep knowledge of the latest developments in AI, machine learning, and technology.

Generate a NEW and UNIQUE Instagram carousel post about the LATEST AI/tech news and developments.

IMPORTANT - AVOID REPEATING these recent topics I already covered: ${recentTitles || "none yet"}

Pick 3-5 DIFFERENT and FRESH news items. Be specific with names, companies, dates, and numbers.

RULES:
- No emojis anywhere
- Punchy, conversational tone. Short sentences. Active voice.
- Catchy headlines that drive curiosity
- Max 3-4 bullet points per slide, each max 15 words
- Use strong verbs and concrete numbers
- For each slide, include an "image_search" field with 2-3 keywords for finding a relevant stock photo (e.g. "artificial intelligence robot", "neural network visualization", "tech startup office")

Return ONLY valid JSON (no markdown wrapping) with this structure:
{
  "title": "Catchy post title without emojis",
  "summary": "Engaging 2-3 sentence caption. No emojis.",
  "hashtags": ["ai", "machinelearning", "tech"],
  "slides": [
    {
      "type": "cover",
      "headline": "AI Updates",
      "subheadline": "${today}",
      "accent_color": "#6366f1",
      "image_search": "futuristic artificial intelligence"
    },
    {
      "type": "news",
      "headline": "Catchy headline here",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "source": "Source name",
      "accent_color": "#06b6d4",
      "image_search": "machine learning data"
    },
    {
      "type": "cta",
      "headline": "Stay Updated",
      "subheadline": "Follow for daily AI news",
      "accent_color": "#22c55e",
      "image_search": "technology network"
    }
  ]
}

Create 5-8 slides. First is cover, last is CTA. Middle slides are news.`,
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
                        image_search: { type: "string" },
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
      const errText = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, errText);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error ${aiResp.status}`);
    }

    const aiData = await aiResp.json();
    console.log("[STEP 1] AI response received, finish_reason:", aiData.choices?.[0]?.finish_reason);

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let postContent: any;

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

    // Step 2: Generate images for each slide using AI image generation
    console.log("[STEP 2] Generating images for", postContent.slides.length, "slides");
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const imageModel = "google/gemini-2.5-flash-image";

    for (let idx = 0; idx < postContent.slides.length; idx++) {
      const slide = postContent.slides[idx];
      const searchTerms = slide.image_search || slide.headline || "technology";
      console.log(`[STEP 2] Generating image ${idx + 1}/${postContent.slides.length}: "${searchTerms}"`);

      try {
        const imgResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: imageModel,
            messages: [
              {
                role: "user",
                content: `Generate a visually stunning, cinematic photograph-style image. Dark moody tones with subtle color accents. Subject: ${searchTerms}. Style: editorial tech magazine cover art. Abstract and artistic. Absolutely NO text, NO words, NO letters, NO numbers in the image.`,
              },
            ],
            modalities: ["image", "text"],
          }),
        });

        console.log(`[STEP 2] Image API response status: ${imgResp.status}`);

        if (imgResp.ok) {
          const imgData = await imgResp.json();
          const imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

          if (imageUrl && imageUrl.startsWith("data:image")) {
            console.log(`[STEP 2] Got base64 image, uploading to storage...`);
            const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
            const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
            const fileName = `${user.id}/${Date.now()}-slide-${idx}.png`;

            const { error: uploadErr } = await serviceClient.storage
              .from("slide-images")
              .upload(fileName, binaryData, { contentType: "image/png", upsert: true });

            if (!uploadErr) {
              const { data: urlData } = serviceClient.storage.from("slide-images").getPublicUrl(fileName);
              slide.image_url = urlData.publicUrl;
              console.log(`[STEP 2] Image ${idx + 1} uploaded successfully`);
            } else {
              console.error(`[STEP 2] Upload error for slide ${idx + 1}:`, uploadErr.message);
            }
          } else {
            console.log(`[STEP 2] No valid base64 image in response for slide ${idx + 1}`);
          }
        } else {
          const errBody = await imgResp.text();
          console.error(`[STEP 2] Image gen failed for slide ${idx + 1}: ${imgResp.status} - ${errBody.slice(0, 200)}`);
        }
      } catch (imgErr) {
        console.error(`[STEP 2] Image generation exception for slide ${idx + 1}:`, imgErr);
      }

      // Clean up the search field
      delete slide.image_search;
    }

    // Step 3: Save the post
    console.log("[STEP 3] Saving post...");
    const { data: post, error: insertError } = await supabase
      .from("ai_posts")
      .insert({
        user_id: user.id,
        title: postContent.title,
        summary: postContent.summary,
        slides: postContent.slides,
        hashtags: postContent.hashtags,
        source_urls: [],
        status: "pending",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const imageCount = postContent.slides.filter((s: any) => s.image_url).length;
    console.log(`[STEP 3] Post created: ${post.id} with ${imageCount}/${postContent.slides.length} images`);

    return new Response(JSON.stringify({ success: true, post }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ai-post error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
