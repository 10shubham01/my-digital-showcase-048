INSERT INTO storage.buckets (id, name, public)
VALUES ('slide-images', 'slide-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload slide images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'slide-images');

CREATE POLICY "Public read access for slide images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'slide-images');

CREATE POLICY "Users can delete own slide images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'slide-images');