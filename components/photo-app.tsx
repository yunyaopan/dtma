'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PhotoUpload } from '@/components/photo-upload';
import { PhotoGallery } from '@/components/photo-gallery';
import { PhotoModal } from '@/components/photo-modal';
import { PhotoResponse } from '@/lib/types';

export function PhotoApp() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(user?.email === 'timerainy2@gmail.com');
    };

    checkAuth();

    // Listen for auth changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAdmin(session?.user?.email === 'timerainy2@gmail.com');
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePhotoClick = (photo: PhotoResponse) => {
    setSelectedPhoto(photo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Photo Guessing Game</h1>
        <p className="text-muted-foreground mt-2">
          Upload your photos and let us guess who uploaded them.
        </p>
      </div>

      {/* Upload Section */}
      <div className="flex justify-center">
        <PhotoUpload onUploadSuccess={handleUploadSuccess} />
      </div>

      {/* Gallery Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Photos</h2>
        <PhotoGallery 
          isAdmin={isAdmin}
          refreshTrigger={refreshTrigger}
          onPhotoClick={handlePhotoClick}
        />
      </div>

      {/* Full-screen Modal */}
      <PhotoModal
        photo={selectedPhoto}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
