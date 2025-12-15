import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number; // 0-5
  onChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({ 
  rating, 
  onChange, 
  size = 16, 
  readonly = false 
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  return (
    <div 
      className="flex gap-1" 
      onMouseLeave={() => !readonly && setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors duration-150`}
          onClick={() => !readonly && onChange && onChange(star === rating ? 0 : star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
        >
          <Star
            size={size}
            className={`${
              (hoverRating || rating) >= star
                ? 'fill-yellow-500 text-yellow-500'
                : 'text-gray-600'
            }`}
          />
        </button>
      ))}
    </div>
  );
};
