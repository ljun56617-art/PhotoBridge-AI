export interface PhotoMetadata {
  filename: string;
  path: string; // Relative path from import root
  size: number;
  type: string;
  lastModified: number;
  dimensions?: { width: number; height: number };
}

export interface Photo {
  id: string;
  file: File; // The actual file object (kept in memory)
  previewUrl: string; // Blob URL for display
  metadata: PhotoMetadata;
  rating: number; // 0-5
  tags: string[];
  aiDescription?: string;
  aiAnalysisDate?: number;
  isAnalyzing?: boolean;
}

export interface FolderNode {
  name: string;
  path: string;
  children: FolderNode[];
  photoCount: number;
}

export enum SortOption {
  DATE_DESC = 'Date (Newest)',
  DATE_ASC = 'Date (Oldest)',
  RATING_DESC = 'Rating (High-Low)',
  NAME_ASC = 'Name (A-Z)'
}
