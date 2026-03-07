import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AiSettings {
  id: string;
  user_id: string;
  allowed_email: string;
  system_prompt: string;
  model: string;
  generation_interval_hours: number;
  news_sources: string[];
  template_style: string;
  created_at: string;
  updated_at: string;
}

export const useAiSettings = () => {
  return useQuery({
    queryKey: ["ai-settings"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("ai_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      // Auto-create settings if not exists
      if (!data) {
        const { data: newSettings, error: insertErr } = await supabase
          .from("ai_settings")
          .insert({
            user_id: user.id,
            allowed_email: user.email || "",
          })
          .select()
          .single();
        if (insertErr) throw insertErr;
        return newSettings as unknown as AiSettings;
      }

      return data as unknown as AiSettings;
    },
  });
};

export const useUpdateAiSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<AiSettings> & { id: string }) => {
      const { id, ...rest } = updates;
      const { error } = await supabase
        .from("ai_settings")
        .update(rest as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-settings"] }),
  });
};
