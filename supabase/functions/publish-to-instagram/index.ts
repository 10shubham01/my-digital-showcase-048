import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const INSTAGRAM_ACCESS_TOKEN = Deno.env.get("INSTAGRAM_ACCESS_TOKEN");
    const INSTAGRAM_ACCOUNT_ID = Deno.env.get("INSTAGRAM_ACCOUNT_ID");

    if (!INSTAGRAM_ACCESS_TOKEN) {
      throw new Error("INSTAGRAM_ACCESS_TOKEN not configured. Please add your Instagram access token in settings.");
    }
    if (!INSTAGRAM_ACCOUNT_ID) {
      throw new Error("INSTAGRAM_ACCOUNT_ID not configured. Please add your Instagram Business Account ID in settings.");
    }

    const { post_id, caption, image_data } = await req.json();

    if (!image_data || !Array.isArray(image_data) || image_data.length === 0) {
      throw new Error("No images provided");
    }

    const graphUrl = `https://graph.facebook.com/v19.0/${INSTAGRAM_ACCOUNT_ID}`;

    if (image_data.length === 1) {
      // Single image post
      // Instagram requires a publicly accessible URL, so we need to upload first
      // For now, we'll use the image_url approach - user needs to host images
      throw new Error("Single image posts require publicly hosted image URLs. Use carousel for multiple slides.");
    }

    // Carousel post flow:
    // Step 1: Create container items for each image
    // Note: Instagram Graph API requires publicly accessible image URLs
    // The client sends base64 data, but Instagram needs URLs
    // This is a limitation - images need to be uploaded to a public hosting first

    // For now, return instructions about the requirement
    // In production, you'd upload to Supabase Storage (public bucket) first

    // Check if images are URLs or base64
    const imageUrls: string[] = [];
    for (const img of image_data) {
      if (img.startsWith("http")) {
        imageUrls.push(img);
      } else {
        // Base64 images need to be uploaded to public storage first
        throw new Error(
          "Instagram requires publicly accessible image URLs. Please export slides as images and upload them to a public hosting service, or configure Supabase Storage with a public bucket for auto-upload."
        );
      }
    }

    // Step 1: Create individual media containers
    const containerIds: string[] = [];
    for (const imageUrl of imageUrls) {
      const resp = await fetch(`${graphUrl}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: imageUrl,
          is_carousel_item: true,
          access_token: INSTAGRAM_ACCESS_TOKEN,
        }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(`Instagram API: ${data.error.message}`);
      containerIds.push(data.id);
    }

    // Step 2: Create carousel container
    const carouselResp = await fetch(`${graphUrl}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        media_type: "CAROUSEL",
        children: containerIds.join(","),
        caption,
        access_token: INSTAGRAM_ACCESS_TOKEN,
      }),
    });
    const carouselData = await carouselResp.json();
    if (carouselData.error) throw new Error(`Instagram API: ${carouselData.error.message}`);

    // Step 3: Publish
    const publishResp = await fetch(`${graphUrl}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: carouselData.id,
        access_token: INSTAGRAM_ACCESS_TOKEN,
      }),
    });
    const publishData = await publishResp.json();
    if (publishData.error) throw new Error(`Instagram API: ${publishData.error.message}`);

    return new Response(
      JSON.stringify({ success: true, instagram_media_id: publishData.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("publish-to-instagram error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
