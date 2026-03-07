import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AiPostSlide {
  type: "cover" | "news" | "cta";
  headline: string;
  subheadline?: string;
  bullets?: string[];
  source?: string;
  accent_color?: string;
}

export interface AiPost {
  id: string;
  user_id: string;
  title: string;
  summary: string | null;
  slides: AiPostSlide[];
  hashtags: string[];
  status: string;
  source_urls: string[];
  scheduled_for: string | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useAiPosts = (status?: string) => {
  return useQuery({
    queryKey: ["ai-posts", status],
    queryFn: async () => {
      let query = supabase
        .from("ai_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as AiPost[];
    },
  });
};

export const useGeneratePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-ai-post");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-posts"] }),
  });
};

export const useUpdateAiPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AiPost> & { id: string }) => {
      const { error } = await supabase
        .from("ai_posts")
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-posts"] }),
  });
};

export const useDeleteAiPost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-posts"] }),
  });
};
