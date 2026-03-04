import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ProjectStatus {
  id: string;
  project_id: string;
  name: string;
  slug: string;
  color: string;
  order: number;
  created_at: string;
}

export const useProjectStatuses = (projectId: string | null) => {
  return useQuery({
    queryKey: ["project-statuses", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from("project_statuses")
        .select("*")
        .eq("project_id", projectId)
        .order("order", { ascending: true });
      if (error) throw error;
      return data as ProjectStatus[];
    },
    enabled: !!projectId,
  });
};

export const useAddProjectStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (status: { project_id: string; name: string; slug: string; color: string; order: number }) => {
      const { data, error } = await supabase
        .from("project_statuses")
        .insert(status)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => qc.invalidateQueries({ queryKey: ["project-statuses", data.project_id] }),
  });
};

export const useUpdateProjectStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id, ...updates }: Partial<ProjectStatus> & { id: string; project_id: string }) => {
      const { error } = await supabase
        .from("project_statuses")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
      return project_id;
    },
    onSuccess: (projectId) => qc.invalidateQueries({ queryKey: ["project-statuses", projectId] }),
  });
};

export const useDeleteProjectStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, project_id }: { id: string; project_id: string }) => {
      const { error } = await supabase
        .from("project_statuses")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return project_id;
    },
    onSuccess: (projectId) => qc.invalidateQueries({ queryKey: ["project-statuses", projectId] }),
  });
};
