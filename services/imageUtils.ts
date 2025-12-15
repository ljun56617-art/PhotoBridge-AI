import { PhotoMetadata } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Resize image for AI analysis to save bandwidth/tokens
// Returns a base64 string without the prefix
export const resizeImageForAI = async (file: File, maxDimension = 1024): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height *= maxDimension / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width *= maxDimension / height;
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        // Export as JPEG with 0.8 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        // Remove "data:image/jpeg;base64," prefix
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const extractMetadata = async (file: File, relativePath: string): Promise<PhotoMetadata> => {
    // In a real app, we would use a library like exif-js here to read EXIF data.
    // For this demo, we extract what is available on the File object.
    
    // Attempt to load image to get dimensions
    let dimensions = { width: 0, height: 0 };
    try {
        const url = URL.createObjectURL(file);
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
        });
        dimensions = { width: img.width, height: img.height };
        URL.revokeObjectURL(url);
    } catch (e) {
        console.warn("Could not extract dimensions", e);
    }

    return {
        filename: file.name,
        path: relativePath || file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        dimensions
    };
};
