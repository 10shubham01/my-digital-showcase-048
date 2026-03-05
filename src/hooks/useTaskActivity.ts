import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TaskActivity {
  id: string;
  task_id: string;
  project_id: string;
  user_id: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export const useTaskActivity = (projectId: string | null) => {
  return useQuery({
    queryKey: ["task-activity", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("task_activity_log")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as TaskActivity[];
    },
    enabled: !!projectId,
  });
};
