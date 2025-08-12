import { createClient } from '@/lib/supabase/server';
import { Photo, PhotoResponse } from '@/lib/types';

export async function getAllPhotos(includeNames = false): Promise<PhotoResponse[]> {
  const supabase = await createClient();
  
  const { data: photos, error } = await supabase
    .from('photos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Database error:', error);
    if (error.code === 'PGRST116' || error.message.includes('relation "public.photos" does not exist')) {
      // Table doesn't exist yet - return empty array
      return [];
    }
    throw new Error(`Failed to fetch photos: ${error.message}`);
  }

  if (!photos) {
    return [];
  }

  return photos.map((photo: Photo) => ({
    id: photo.id,
    file_url: photo.file_url,
    created_at: photo.created_at,
    ...(includeNames && { name: photo.name }),
  }));
}

export async function createPhoto(name: string, file: File): Promise<PhotoResponse> {
  const supabase = await createClient();
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  // Upload file to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('photos')
    .upload(fileName, file);

  if (uploadError) {
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('photos')
    .getPublicUrl(fileName);

  // Save photo record to database
  const { data: photo, error: dbError } = await supabase
    .from('photos')
    .insert({
      name,
      file_path: uploadData.path,
      file_url: publicUrl,
    })
    .select()
    .single();

  if (dbError) {
    // Clean up uploaded file if database insert fails
    await supabase.storage.from('photos').remove([fileName]);
    
    if (dbError.code === 'PGRST116' || dbError.message.includes('relation "public.photos" does not exist')) {
      throw new Error('Database not set up. Please run the setup SQL script in your Supabase project.');
    }
    
    throw new Error(`Failed to save photo record: ${dbError.message}`);
  }

  return {
    id: photo.id,
    file_url: photo.file_url,
    created_at: photo.created_at,
  };
}

export async function deletePhoto(id: string): Promise<void> {
  const supabase = await createClient();
  
  // First get the photo to get the file path
  const { data: photo, error: fetchError } = await supabase
    .from('photos')
    .select('file_path')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to find photo: ${fetchError.message}`);
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('photos')
    .remove([photo.file_path]);

  if (storageError) {
    console.warn(`Failed to delete file from storage: ${storageError.message}`);
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('photos')
    .delete()
    .eq('id', id);

  if (dbError) {
    throw new Error(`Failed to delete photo record: ${dbError.message}`);
  }
}

export async function getPhotoWithName(id: string): Promise<PhotoResponse> {
  const supabase = await createClient();
  
  const { data: photo, error } = await supabase
    .from('photos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch photo: ${error.message}`);
  }

  return {
    id: photo.id,
    file_url: photo.file_url,
    created_at: photo.created_at,
    name: photo.name,
  };
}
