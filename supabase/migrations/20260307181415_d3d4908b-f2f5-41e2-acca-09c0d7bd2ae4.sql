
-- AI Posts table
CREATE TABLE public.ai_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  slides JSONB NOT NULL DEFAULT '[]'::jsonb,
  hashtags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  source_urls TEXT[] DEFAULT '{}',
  scheduled_for TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own ai posts" ON public.ai_posts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- AI Settings table
CREATE TABLE public.ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  allowed_email TEXT NOT NULL DEFAULT '',
  system_prompt TEXT NOT NULL DEFAULT 'You are an AI news curator. Create engaging, concise Instagram carousel posts about the latest AI/ML news, model releases, and tech updates. Each slide should have a catchy headline and brief bullet points. Use professional but accessible language.',
  model TEXT NOT NULL DEFAULT 'google/gemini-2.5-flash',
  generation_interval_hours INTEGER NOT NULL DEFAULT 24,
  news_sources TEXT[] DEFAULT ARRAY['techcrunch.com', 'theverge.com', 'openai.com/blog', 'blog.google/technology/ai', 'huggingface.co/blog'],
  template_style TEXT NOT NULL DEFAULT 'modern-dark',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own ai settings" ON public.ai_settings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_ai_posts_updated_at BEFORE UPDATE ON public.ai_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_settings_updated_at BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
