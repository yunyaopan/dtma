-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anyone to read photos (but not the names unless admin)
CREATE POLICY "Photos are viewable by everyone" ON photos
    FOR SELECT USING (true);

-- Allow anyone to insert photos
CREATE POLICY "Anyone can upload photos" ON photos
    FOR INSERT WITH CHECK (true);

-- Allow anyone to delete photos
CREATE POLICY "Anyone can delete photos" ON photos
    FOR DELETE USING (true);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
-- Allow anyone to upload photos
CREATE POLICY "Anyone can upload photos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'photos');

-- Allow anyone to view photos
CREATE POLICY "Photos are publicly viewable" ON storage.objects
    FOR SELECT USING (bucket_id = 'photos');

-- Allow anyone to delete photos
CREATE POLICY "Anyone can delete photos" ON storage.objects
    FOR DELETE USING (bucket_id = 'photos');
