export interface Photo {
  id: string;
  name: string;
  file_path: string;
  file_url: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePhotoRequest {
  name: string;
  file: File;
}

export interface PhotoResponse {
  id: string;
  file_url: string;
  created_at: string;
  // name is only included for admin users
  name?: string;
}
