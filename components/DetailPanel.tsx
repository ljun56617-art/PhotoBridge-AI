import React from 'react';
import { Photo } from '../types';
import { RatingStars } from './RatingStars';
import { X, Sparkles, Calendar, HardDrive, MapPin, Tag as TagIcon, Aperture } from 'lucide-react';
import { formatBytes } from '../services/imageUtils';

interface DetailPanelProps {
  photo: Photo | null;
  onClose: () => void;
  onRate: (rating: number) => void;
  onAnalyze: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
  photo,
  onClose,
  onRate,
  onAnalyze,
  onAddTag,
  onRemoveTag
}) => {
  const [newTag, setNewTag] = React.useState('');

  if (!photo) return null;

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim()) {
      onAddTag(newTag.trim());
      setNewTag('');
    }
  };

  const dateStr = new Date(photo.metadata.lastModified).toLocaleDateString() + ' ' + 
                  new Date(photo.metadata.lastModified).toLocaleTimeString();

  return (
    <div className="w-80 bg-app-panel border-l border-app-border flex flex-col h-full overflow-hidden absolute right-0 top-0 bottom-0 z-20 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-app-border">
        <h2 className="font-semibold text-app-text-bright">Details</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {/* Preview */}
        <div className="aspect-video bg-black/50 rounded-lg overflow-hidden border border-app-border flex items-center justify-center">
             <img src={photo.previewUrl} className="max-w-full max-h-full object-contain" alt="preview" />
        </div>

        {/* Basic Info */}
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">File Info</h3>
            <div className="text-sm space-y-2">
                <div className="flex items-start gap-2 text-app-text-bright">
                    <span className="font-medium break-all">{photo.metadata.filename}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                     <HardDrive size={14} />
                     <span>{formatBytes(photo.metadata.size)} • {photo.metadata.type.split('/')[1].toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={14} />
                    <span>{dateStr}</span>
                </div>
                 {photo.metadata.dimensions && (
                    <div className="flex items-center gap-2 text-gray-400">
                        <Aperture size={14} />
                        <span>{photo.metadata.dimensions.width} x {photo.metadata.dimensions.height} px</span>
                    </div>
                )}
                 <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={14} />
                    <span className="truncate" title={photo.metadata.path}>{photo.metadata.path || 'Root'}</span>
                </div>
            </div>
        </div>

        {/* Rating */}
        <div className="space-y-2">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Rating</h3>
             <div className="bg-neutral-800 p-3 rounded-lg inline-block">
                <RatingStars rating={photo.rating} onChange={onRate} size={24} />
             </div>
        </div>

        {/* AI Section */}
        <div className="space-y-3">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-app-accent uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={14} /> AI Analysis
                </h3>
             </div>
             
             {!photo.aiDescription && !photo.isAnalyzing && (
                 <button 
                    onClick={onAnalyze}
                    className="w-full py-2 bg-gradient-to-r from-indigo-600 to-app-accent text-white rounded shadow hover:opacity-90 transition-opacity text-sm font-medium flex items-center justify-center gap-2"
                 >
                    <Sparkles size={16} /> Analyze Photo
                 </button>
             )}

             {photo.isAnalyzing && (
                 <div className="text-sm text-app-accent animate-pulse flex items-center gap-2">
                    <div className="h-2 w-2 bg-app-accent rounded-full animate-bounce"></div>
                    Generating tags & description...
                 </div>
             )}

             {photo.aiDescription && (
                 <div className="bg-neutral-800 p-3 rounded-lg border border-app-border space-y-2">
                     <p className="text-sm text-gray-300 italic">"{photo.aiDescription}"</p>
                 </div>
             )}
        </div>

        {/* Tags */}
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <TagIcon size={14} /> Tags
            </h3>
            <div className="flex flex-wrap gap-2">
                {photo.tags.map(tag => (
                    <span key={tag} className="bg-neutral-800 text-gray-300 px-2 py-1 rounded text-xs border border-gray-700 flex items-center gap-1 group">
                        {tag}
                        <button onClick={() => onRemoveTag(tag)} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <X size={12} />
                        </button>
                    </span>
                ))}
            </div>
            <form onSubmit={handleAddTag} className="relative">
                <input 
                    type="text" 
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    className="w-full bg-neutral-900 border border-app-border rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-app-accent"
                />
            </form>
        </div>

      </div>
    </div>
  );
};
