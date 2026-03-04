
-- Change tasks.status from enum to text for flexible custom buckets
ALTER TABLE public.tasks 
  ALTER COLUMN status TYPE text USING status::text,
  ALTER COLUMN status SET DEFAULT 'todo';

-- Create project_statuses table for custom buckets
CREATE TABLE public.project_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  color text NOT NULL DEFAULT '#6366f1',
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, slug)
);

ALTER TABLE public.project_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own project statuses"
ON public.project_statuses FOR ALL
USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_statuses.project_id AND projects.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM projects WHERE projects.id = project_statuses.project_id AND projects.user_id = auth.uid()));

-- Seed default statuses for all existing projects
INSERT INTO public.project_statuses (project_id, name, slug, color, "order")
SELECT p.id, s.name, s.slug, s.color, s.ord
FROM public.projects p
CROSS JOIN (VALUES
  ('Backlog', 'backlog', '#6b7280', 0),
  ('Todo', 'todo', '#6366f1', 1),
  ('In Progress', 'in_progress', '#06b6d4', 2),
  ('Review', 'review', '#f97316', 3),
  ('Done', 'done', '#22c55e', 4)
) AS s(name, slug, color, ord);

-- Auto-create default statuses for new projects
CREATE OR REPLACE FUNCTION public.create_default_statuses()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.project_statuses (project_id, name, slug, color, "order") VALUES
    (NEW.id, 'Backlog', 'backlog', '#6b7280', 0),
    (NEW.id, 'Todo', 'todo', '#6366f1', 1),
    (NEW.id, 'In Progress', 'in_progress', '#06b6d4', 2),
    (NEW.id, 'Review', 'review', '#f97316', 3),
    (NEW.id, 'Done', 'done', '#22c55e', 4);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_create_default_statuses
AFTER INSERT ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.create_default_statuses();
