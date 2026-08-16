import { Star, StarHalf } from 'lucide-react';

export default function RatingStars({ value = 0, size = 16, className = '' }) {
  const rating = Number(value) || 0;
  const full = Math.floor(rating);
  const half = rating - full >= 0.25 && rating - full < 0.75 ? 0.5 : rating - full >= 0.75 ? 1 : 0;
  const total = Math.ceil(rating);

  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        if (i <= full + half) {
          return <Star key={i} size={size} className="fill-amber-400 text-amber-400" />;
        }
        if (i === full + 1 && half === 0.5) {
          return <StarHalf key={i} size={size} className="fill-amber-400 text-amber-400" />;
        }
        return <Star key={i} size={size} className="text-zinc-300" />;
      })}
    </div>
  );
}
