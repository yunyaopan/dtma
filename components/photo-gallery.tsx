'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, EyeOff, Maximize2 } from 'lucide-react';
import { PhotoResponse } from '@/lib/types';

interface PhotoGalleryProps {
  isAdmin: boolean;
  refreshTrigger: number;
  onPhotoClick: (photo: PhotoResponse) => void;
}

export function PhotoGallery({ isAdmin, refreshTrigger, onPhotoClick }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<PhotoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedNames, setRevealedNames] = useState<Map<string, string>>(new Map());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/photos');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to fetch photos: ${response.status}`);
      }
      
      const data = await response.json();
      setPhotos(data.photos || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const revealName = async (photoId: string) => {
    try {
      const response = await fetch(`/api/photos/${photoId}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          alert('Admin access required to reveal photo names');
          return;
        }
        throw new Error('Failed to fetch photo name');
      }
      
      const data = await response.json();
      
      // Store the revealed name in the map
      setRevealedNames(prev => new Map(prev.set(photoId, data.photo.name)));
    } catch (err) {
      console.error('Error revealing name:', err);
      alert('Failed to reveal photo name');
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      setDeletingIds(prev => new Set([...prev, photoId]));
      
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }
      
      // Remove photo from list
      setPhotos(prev => prev.filter(photo => photo.id !== photoId));
      setRevealedNames(prev => {
        const newMap = new Map(prev);
        newMap.delete(photoId);
        return newMap;
      });
    } catch (err) {
      console.error('Error deleting photo:', err);
      alert('Failed to delete photo');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(photoId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchPhotos}>Try Again</Button>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No photos uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <Card key={photo.id} className="overflow-hidden group">
          <CardContent className="p-0">
            <div className="relative aspect-square">
              <img
                src={photo.file_url}
                alt={photo.name || 'Photo'}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onPhotoClick(photo)}
              />
              
              {/* Overlay with controls */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onPhotoClick(photo)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deletePhoto(photo.id)}
                    disabled={deletingIds.has(photo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>


            </div>

            {/* Photo info section */}
            <div className="p-3 space-y-2">
              {/* Name badge for revealed names */}
              {revealedNames.has(photo.id) && (
                <div>
                  <Badge variant="outline" className="text-xs">
                    {revealedNames.get(photo.id)}
                  </Badge>
                </div>
              )}

              {/* Admin reveal button and upload date */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {new Date(photo.created_at).toLocaleDateString()}
                </p>
                
                {/* Admin reveal name button */}
                {isAdmin && !revealedNames.has(photo.id) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => revealName(photo.id)}
                    className="text-xs px-2 py-1 h-6"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Reveal Name
                  </Button>
                )}
                
                {/* Revealed indicator */}
                {isAdmin && revealedNames.has(photo.id) && (
                  <Badge variant="secondary" className="text-xs">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Revealed
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
