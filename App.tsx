import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Photo, FolderNode } from './types';
import { Sidebar } from './components/Sidebar';
import { PhotoGrid } from './components/PhotoGrid';
import { DetailPanel } from './components/DetailPanel';
import { generateId, extractMetadata, resizeImageForAI } from './services/imageUtils';
import { analyzeImage } from './services/geminiService';
import { AlertCircle } from 'lucide-react';

// Main App Component
const App: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  
  // Filters state
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [activeFilterTags, setActiveFilterTags] = useState<Set<string>>(new Set());
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // API Key Check
  const [hasApiKey, setHasApiKey] = useState(false);
  
  useEffect(() => {
    if (process.env.API_KEY) {
        setHasApiKey(true);
    }
  }, []);

  // Compute derived state: Folders list
  const folders = useMemo(() => {
    const folderSet = new Set<string>();
    photos.forEach(p => {
        if (p.metadata.path) {
            // Extract just the directory part if needed, assuming path is relative path "folder/file.jpg"
            const parts = p.metadata.path.split('/');
            if (parts.length > 1) {
                folderSet.add(parts.slice(0, parts.length - 1).join('/'));
            }
        }
    });
    return Array.from(folderSet).sort();
  }, [photos]);

  // Compute derived state: All Tags map
  const allTags = useMemo(() => {
    const map = new Map<string, number>();
    photos.forEach(p => {
      p.tags.forEach(t => {
        map.set(t, (map.get(t) || 0) + 1);
      });
    });
    return map;
  }, [photos]);

  // Filter photos
  const filteredPhotos = useMemo(() => {
    return photos.filter(p => {
      // Folder filter
      if (activeFolder) {
        if (!p.metadata.path.startsWith(activeFolder)) return false;
      }
      
      // Rating filter
      if (p.rating < ratingFilter) return false;

      // Tags filter (AND logic: must have all selected tags)
      if (activeFilterTags.size > 0) {
        const hasAllTags = Array.from(activeFilterTags).every(t => p.tags.includes(t));
        if (!hasAllTags) return false;
      }

      // Text Search (Filename or Tags)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.metadata.filename.toLowerCase().includes(query);
        const matchesTag = p.tags.some(t => t.toLowerCase().includes(query));
        if (!matchesName && !matchesTag) return false;
      }

      return true;
    });
  }, [photos, activeFolder, ratingFilter, activeFilterTags, searchQuery]);

  // Handlers
  const handleImport = async (fileList: FileList) => {
    const newPhotos: Photo[] = [];
    
    // Convert FileList to array for processing
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));

    for (const file of files) {
        // webkitRelativePath gives us the folder structure
        // @ts-ignore
        const relativePath = file.webkitRelativePath || file.name;
        const metadata = await extractMetadata(file, relativePath);
        
        const photo: Photo = {
            id: generateId(),
            file,
            previewUrl: URL.createObjectURL(file),
            metadata,
            rating: 0,
            tags: [],
        };
        newPhotos.push(photo);
    }

    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const handleRate = useCallback((id: string, rating: number) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, rating } : p));
  }, []);

  const handleToggleTagFilter = (tag: string) => {
    setActiveFilterTags(prev => {
        const next = new Set(prev);
        if (next.has(tag)) next.delete(tag);
        else next.add(tag);
        return next;
    });
  };

  const handleAddTagToPhoto = (id: string, tag: string) => {
    setPhotos(prev => prev.map(p => {
        if (p.id === id && !p.tags.includes(tag)) {
            return { ...p, tags: [...p.tags, tag] };
        }
        return p;
    }));
  };

  const handleRemoveTagFromPhoto = (id: string, tag: string) => {
    setPhotos(prev => prev.map(p => {
        if (p.id === id) {
            return { ...p, tags: p.tags.filter(t => t !== tag) };
        }
        return p;
    }));
  };

  const handleAnalyzePhoto = async (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (!photo) return;
    if (!hasApiKey) {
        alert("Please set REACT_APP_GEMINI_API_KEY in your .env file to use AI features.");
        return;
    }

    // Set loading state
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, isAnalyzing: true } : p));

    try {
        const base64 = await resizeImageForAI(photo.file);
        const result = await analyzeImage(base64);

        setPhotos(prev => prev.map(p => {
            if (p.id === id) {
                return {
                    ...p,
                    isAnalyzing: false,
                    aiDescription: result.description,
                    tags: [...new Set([...p.tags, ...result.tags])], // Merge existing and new tags
                    rating: p.rating === 0 ? result.ratingSuggestion : p.rating // Only auto-rate if not rated
                };
            }
            return p;
        }));
    } catch (error) {
        console.error(error);
        setPhotos(prev => prev.map(p => p.id === id ? { ...p, isAnalyzing: false } : p));
        alert("AI Analysis failed. Check console for details.");
    }
  };

  const selectedPhoto = photos.find(p => p.id === selectedPhotoId) || null;

  return (
    <div className="flex h-screen bg-app-bg text-app-text font-sans overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar 
            folders={folders}
            allTags={allTags}
            activeFilterTags={activeFilterTags}
            activeRatingFilter={ratingFilter}
            activeFolder={activeFolder}
            searchQuery={searchQuery}
            onSelectFolder={setActiveFolder}
            onToggleTag={handleToggleTagFilter}
            onSetRatingFilter={setRatingFilter}
            onSearch={setSearchQuery}
            onImport={handleImport}
            photoCount={photos.length}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
            {/* Top Bar */}
            <div className="h-14 border-b border-app-border bg-app-bg flex items-center px-4 justify-between">
                <div className="text-sm text-gray-400">
                    Showing {filteredPhotos.length} item{filteredPhotos.length !== 1 && 's'}
                    {activeFolder && <span className="ml-2 bg-neutral-800 px-2 py-0.5 rounded text-xs">in /{activeFolder}</span>}
                    {activeFilterTags.size > 0 && <span className="ml-2 bg-app-accent/20 text-app-accent px-2 py-0.5 rounded text-xs">{activeFilterTags.size} tags active</span>}
                    {searchQuery && <span className="ml-2 bg-neutral-800 px-2 py-0.5 rounded text-xs">Search: "{searchQuery}"</span>}
                </div>
                {!hasApiKey && (
                    <div className="flex items-center gap-2 text-yellow-500 text-xs bg-yellow-500/10 px-3 py-1 rounded">
                        <AlertCircle size={14} />
                        <span>API Key missing. AI features disabled.</span>
                    </div>
                )}
            </div>

            {/* Photo Grid */}
            <PhotoGrid 
                photos={filteredPhotos} 
                onPhotoClick={(p) => setSelectedPhotoId(p.id)} 
            />
            
            {/* Details Panel Overlay */}
            {selectedPhotoId && (
                <DetailPanel 
                    photo={selectedPhoto}
                    onClose={() => setSelectedPhotoId(null)}
                    onRate={(r) => handleRate(selectedPhotoId, r)}
                    onAnalyze={() => handleAnalyzePhoto(selectedPhotoId)}
                    onAddTag={(tag) => handleAddTagToPhoto(selectedPhotoId, tag)}
                    onRemoveTag={(tag) => handleRemoveTagFromPhoto(selectedPhotoId, tag)}
                />
            )}
        </div>
    </div>
  );
};

export default App;