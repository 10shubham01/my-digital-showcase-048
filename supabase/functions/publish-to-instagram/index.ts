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

    // Get Instagram config from database
    const { data: igConfig, error: configError } = await supabase
      .from("instagram_config")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (configError || !igConfig) {
      throw new Error("Instagram not configured. Go to Settings to add your credentials.");
    }

    const INSTAGRAM_ACCESS_TOKEN = igConfig.access_token;
    const INSTAGRAM_ACCOUNT_ID = igConfig.account_id;

    if (!INSTAGRAM_ACCESS_TOKEN) {
      throw new Error("Instagram Access Token not set. Go to Settings to add it.");
    }
    if (!INSTAGRAM_ACCOUNT_ID) {
      throw new Error("Instagram Account ID not set. Go to Settings to add it.");
    }

    const { post_id, caption, image_data } = await req.json();

    if (!image_data || !Array.isArray(image_data) || image_data.length === 0) {
      throw new Error("No images provided");
    }

    console.log(`Publishing ${image_data.length} images to Instagram...`);

    // Upload base64 images to public storage and get URLs
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const publicUrls: string[] = [];

    for (let i = 0; i < image_data.length; i++) {
      const img = image_data[i];
      if (img.startsWith("http")) {
        publicUrls.push(img);
      } else {
        const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
        const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        const fileName = `instagram/${user.id}/${Date.now()}-${i}.png`;

        const { error: uploadErr } = await serviceClient.storage
          .from("slide-images")
          .upload(fileName, binaryData, { contentType: "image/png", upsert: true });

        if (uploadErr) throw new Error(`Failed to upload image ${i + 1}: ${uploadErr.message}`);

        const { data: urlData } = serviceClient.storage.from("slide-images").getPublicUrl(fileName);
        publicUrls.push(urlData.publicUrl);
        console.log(`Uploaded image ${i + 1} to storage`);
      }
    }

    const graphUrl = `https://graph.facebook.com/v19.0/${INSTAGRAM_ACCOUNT_ID}`;

    if (publicUrls.length === 1) {
      const createResp = await fetch(`${graphUrl}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: publicUrls[0],
          caption,
          access_token: INSTAGRAM_ACCESS_TOKEN,
        }),
      });
      const createData = await createResp.json();
      if (createData.error) throw new Error(`Instagram: ${createData.error.message}`);

      const publishResp = await fetch(`${graphUrl}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: createData.id,
          access_token: INSTAGRAM_ACCESS_TOKEN,
        }),
      });
      const publishData = await publishResp.json();
      if (publishData.error) throw new Error(`Instagram: ${publishData.error.message}`);

      return new Response(
        JSON.stringify({ success: true, instagram_media_id: publishData.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Carousel post
    const containerIds: string[] = [];
    for (const imageUrl of publicUrls) {
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
      if (data.error) throw new Error(`Instagram: ${data.error.message}`);
      containerIds.push(data.id);
    }

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
    if (carouselData.error) throw new Error(`Instagram: ${carouselData.error.message}`);

    const publishResp = await fetch(`${graphUrl}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: carouselData.id,
        access_token: INSTAGRAM_ACCESS_TOKEN,
      }),
    });
    const publishData = await publishResp.json();
    if (publishData.error) throw new Error(`Instagram: ${publishData.error.message}`);

    console.log("Published to Instagram:", publishData.id);

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
