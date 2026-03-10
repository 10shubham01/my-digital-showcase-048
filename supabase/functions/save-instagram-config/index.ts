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
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    // Verify user has ai_settings (authorized user)
    const { data: settings } = await supabase
      .from("ai_settings")
      .select("id, allowed_email")
      .eq("user_id", user.id)
      .single();

    if (!settings) throw new Error("No settings found. Access denied.");

    // Check allowed email
    if (settings.allowed_email && settings.allowed_email !== "" && settings.allowed_email !== user.email) {
      throw new Error("Access denied.");
    }

    const { access_token, account_id } = await req.json();

    // We store Instagram credentials in ai_settings as JSON metadata
    // Since we can't set Deno env vars at runtime, we'll store them in the database
    // and the publish function will read from there
    const updates: Record<string, any> = {};
    if (access_token) updates.instagram_access_token = access_token;
    if (account_id) updates.instagram_account_id = account_id;

    // Store in a simple approach: use news_sources field temporarily
    // Better approach: add columns to ai_settings
    // For now, we'll use the Supabase vault or a separate approach

    // Actually, let's store these securely using Supabase's service role
    // to update the function secrets
    // The simplest approach: store encrypted in the ai_settings table
    // We'll add instagram fields via migration, but for now store as JSON in system_prompt metadata

    // Simplest reliable approach: store in ai_settings table directly
    // We need to add columns first, but as a workaround, we'll use a separate table or metadata

    // For immediate functionality, store in the database securely
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Upsert into a simple key-value approach using the ai_settings table
    // We'll store as part of the settings record
    const updateData: Record<string, any> = {};
    
    // Store credentials - these will be read by the publish function
    // Using a metadata approach with the existing table
    if (access_token) {
      // Store as Deno env var equivalent - use Supabase vault
      // For simplicity, we store in a secure way the publish function can access
      await serviceClient.from("instagram_config").upsert({
        user_id: user.id,
        access_token: access_token,
        account_id: account_id || "",
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Instagram credentials saved" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("save-instagram-config error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
