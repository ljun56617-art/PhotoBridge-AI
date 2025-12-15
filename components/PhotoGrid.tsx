import React from 'react';
import { Photo } from '../types';
import { Star, Zap } from 'lucide-react';
import { RatingStars } from './RatingStars';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onPhotoClick }) => {
  if (photos.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 h-full">
        <div className="text-6xl mb-4 opacity-20">🖼️</div>
        <p className="text-lg">No photos found.</p>
        <p className="text-sm opacity-60">Import a folder or adjust your filters.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-app-bg">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {photos.map(photo => (
          <div 
            key={photo.id}
            onClick={() => onPhotoClick(photo)}
            className="group relative aspect-square bg-app-panel rounded-lg overflow-hidden cursor-pointer border border-transparent hover:border-app-accent transition-all shadow-sm hover:shadow-lg"
          >
            {/* Image */}
            <img 
              src={photo.previewUrl} 
              alt={photo.metadata.filename}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs text-white font-medium truncate w-32">{photo.metadata.filename}</p>
                        <div className="scale-75 origin-bottom-left">
                           <RatingStars rating={photo.rating} readonly />
                        </div>
                    </div>
                    {photo.tags.length > 0 && (
                        <div className="bg-app-accent/80 p-1 rounded text-white" title="Has AI Tags">
                             <Zap size={12} fill="currentColor" />
                        </div>
                    )}
                </div>
            </div>

            {/* Selection/Status Indicators */}
            {photo.isAnalyzing && (
                <div className="absolute top-2 right-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-app-accent border-t-transparent"></div>
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
