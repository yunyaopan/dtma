'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { PhotoResponse } from '@/lib/types';

interface PhotoModalProps {
  photo: PhotoResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PhotoModal({ photo, isOpen, onClose }: PhotoModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !photo) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Photo */}
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        <Image
          src={photo.file_url}
          alt={photo.name || 'Photo'}
          width={1200}
          height={800}
          className="max-w-full max-h-full object-contain cursor-pointer"
          onClick={onClose}
          priority
        />
      </div>

      {/* Photo info */}
      {photo.name && (
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg inline-block">
            <p className="font-medium">{photo.name}</p>
            <p className="text-sm text-gray-300">
              {new Date(photo.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* Background click to close */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
      />
    </div>
  );
}
