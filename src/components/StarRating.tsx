
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  totalStars?: number;
  initialRating?: number;
  onRatingChange: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  totalStars = 5,
  initialRating = 0,
  onRatingChange
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleClick = (index: number) => {
    const newRating = index + 1;
    setRating(newRating);
    onRatingChange(newRating);
  };
  
  return (
    <div className="flex">
      {[...Array(totalStars)].map((_, index) => {
        const isActive = index < (hoverRating || rating);
        
        return (
          <Star
            key={index}
            size={24}
            className={`cursor-pointer transition-all ${
              isActive ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
            onMouseEnter={() => setHoverRating(index + 1)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleClick(index)}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
