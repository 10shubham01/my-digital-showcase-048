
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fingerprint TEXT NOT NULL UNIQUE,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read visitor count"
  ON public.visitors FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert visitor"
  ON public.visitors FOR INSERT
  WITH CHECK (true);
