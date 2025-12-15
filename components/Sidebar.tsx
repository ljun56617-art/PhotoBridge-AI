import React, { useRef } from 'react';
import { FolderOpen, Tag, Image as ImageIcon, Search } from 'lucide-react';

interface SidebarProps {
  folders: string[]; // List of unique folder paths
  allTags: Map<string, number>; // Tag -> Count
  activeFilterTags: Set<string>;
  activeRatingFilter: number;
  activeFolder: string | null;
  searchQuery: string;
  onSelectFolder: (folder: string | null) => void;
  onToggleTag: (tag: string) => void;
  onSetRatingFilter: (rating: number) => void;
  onSearch: (query: string) => void;
  onImport: (files: FileList) => void;
  photoCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  allTags,
  activeFilterTags,
  activeRatingFilter,
  activeFolder,
  searchQuery,
  onSelectFolder,
  onToggleTag,
  onSetRatingFilter,
  onSearch,
  onImport,
  photoCount
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImport(e.target.files);
    }
    // Reset to allow same folder selection again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Convert map to sorted array
  const sortedTags = Array.from(allTags.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="w-64 bg-app-panel border-r border-app-border flex flex-col h-full text-sm select-none">
      {/* App Header */}
      <div className="p-4 border-b border-app-border flex items-center gap-2">
        <div className="w-8 h-8 bg-app-accent rounded flex items-center justify-center">
            <ImageIcon className="text-white" size={20} />
        </div>
        <h1 className="font-bold text-app-text-bright tracking-wide">PhotoBridge</h1>
      </div>

      {/* Actions Section */}
      <div className="p-4 space-y-3 border-b border-app-border bg-app-panel/50">
        <button 
          onClick={handleImportClick}
          className="w-full bg-app-accent hover:bg-sky-600 text-white py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
        >
          <FolderOpen size={16} />
          Import Folder
        </button>
        <input 
          ref={fileInputRef}
          type="file" 
          multiple 
          className="hidden" 
          // @ts-ignore - webkitdirectory is non-standard but supported
          webkitdirectory="" 
          directory=""
          onChange={handleFileChange}
        />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={14} />
          <input 
            type="text" 
            placeholder="Search name or tags..." 
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-app-bg border border-app-border rounded pl-9 pr-3 py-2 text-xs text-app-text focus:outline-none focus:border-app-accent focus:ring-1 focus:ring-app-accent placeholder-gray-600 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Folders Section */}
        <div className="mb-6 mt-4">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
            <span>Folders</span>
          </div>
          <ul className="mt-1">
            <li>
                <button
                    onClick={() => onSelectFolder(null)}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-neutral-800 transition-colors ${activeFolder === null ? 'bg-neutral-800 text-app-accent border-r-2 border-app-accent' : 'text-gray-400'}`}
                >
                    <ImageIcon size={16} />
                    <span className="flex-1 truncate">All Photos</span>
                    <span className="text-xs opacity-50">{photoCount}</span>
                </button>
            </li>
            {folders.map(folder => (
              <li key={folder}>
                <button
                  onClick={() => onSelectFolder(folder)}
                  className={`w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-neutral-800 transition-colors ${activeFolder === folder ? 'bg-neutral-800 text-app-accent border-r-2 border-app-accent' : 'text-gray-400'}`}
                >
                  <FolderOpen size={16} />
                  <span className="flex-1 truncate">{folder}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Filters Section */}
        <div className="mb-6">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Rating Filter
            </div>
            <div className="px-4 py-2">
                <div className="flex flex-col gap-1">
                    {[5, 4, 3, 2, 1].map(stars => (
                        <button
                            key={stars}
                            onClick={() => onSetRatingFilter(activeRatingFilter === stars ? 0 : stars)}
                            className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-neutral-800 ${activeRatingFilter === stars ? 'bg-neutral-800 ring-1 ring-app-border' : ''}`}
                        >
                            <div className="flex text-yellow-500">
                                {Array.from({length: stars}).map((_, i) => <span key={i}>★</span>)}
                            </div>
                            <span className="text-xs text-gray-500">& Up</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Tags Section */}
        <div>
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Tag size={12} />
            <span>Tags</span>
          </div>
          <div className="px-4 py-2 flex flex-wrap gap-2 mb-4">
            {sortedTags.length === 0 && (
                <span className="text-xs text-gray-600 italic">No tags yet. Use AI to analyze photos.</span>
            )}
            {sortedTags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => onToggleTag(tag)}
                className={`text-xs px-2 py-1 rounded-full border transition-all ${
                  activeFilterTags.has(tag)
                    ? 'bg-app-accent border-app-accent text-white'
                    : 'bg-transparent border-gray-600 text-gray-400 hover:border-gray-400'
                }`}
              >
                {tag} <span className="opacity-60 ml-1">{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};