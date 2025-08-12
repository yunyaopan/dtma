# Photo Gallery Setup Instructions

## Overview
This is a photo gallery application with the following features:
- General users can upload photos with names, view all photos (without names), view photos in full-screen, and delete any photos
- Admin users (authenticated via Supabase) can reveal photo names and manage all photos
- Photos are stored in Supabase Storage
- Proper REST API endpoints for all operations

## Prerequisites
1. A Supabase project
2. Environment variables configured

## Supabase Setup

### 1. Database Schema
Run the SQL commands in `supabase-setup.sql` in your Supabase SQL editor:

```sql
-- The file contains:
-- - photos table creation
-- - Row Level Security policies
-- - Storage bucket creation
-- - Storage policies
```

### 2. Storage Bucket
The SQL script will create a public storage bucket named `photos`. If you prefer to create it manually:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `photos`
3. Make it public
4. Set up the policies as defined in the SQL script

### 3. Authentication (Optional for Admin Features)
If you want admin functionality:
1. Enable authentication in your Supabase project
2. Set up your preferred auth providers
3. Any authenticated user will have admin privileges

### 4. Environment Variables
Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
```

## Features

### General Users (No Authentication Required)
- **Upload Photos**: Upload photos with associated names
- **View Gallery**: Browse all uploaded photos (names are hidden)
- **Full-Screen View**: Click any photo to view it in full-screen
- **Delete Photos**: Delete any uploaded photo

### Admin Users (Authenticated)
- **Reveal Names**: Click the eye icon to reveal the name of each photo
- **Full Management**: Same CRUD operations as general users
- **Name Visibility**: Can see revealed photo names

## API Endpoints

### GET /api/photos
- Fetch all photos
- For authenticated users: includes names if previously revealed
- For general users: only photo URLs and metadata

### POST /api/photos
- Upload a new photo
- Requires: `name` (string) and `file` (File) in FormData
- Returns: photo metadata

### GET /api/photos/[id]
- Fetch a specific photo with name (admin only)
- Requires authentication
- Returns: full photo details including name

### DELETE /api/photos/[id]
- Delete a photo
- Removes from both database and storage
- Available to all users

## Security Considerations

1. **Row Level Security**: Enabled on the photos table
2. **Storage Policies**: Public read access, unrestricted upload/delete
3. **Name Privacy**: Names are only revealed to authenticated admin users
4. **File Validation**: Only image files are accepted for upload

## Usage

1. Run the setup SQL in Supabase
2. Configure environment variables
3. Start the development server: `npm run dev`
4. Visit the application to upload and browse photos
5. Sign in to access admin features (reveal names)

## File Structure

```
lib/
├── types.ts              # TypeScript interfaces
├── api/photos.ts         # Photo API functions
└── supabase/            # Supabase client configuration

app/api/photos/
├── route.ts             # GET /api/photos, POST /api/photos
└── [id]/route.ts        # GET /api/photos/[id], DELETE /api/photos/[id]

components/
├── photo-app.tsx        # Main application component
├── photo-upload.tsx     # Photo upload form
├── photo-gallery.tsx    # Photo grid display
└── photo-modal.tsx      # Full-screen photo viewer
```
