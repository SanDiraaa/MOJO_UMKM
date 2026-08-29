"use client";

import { Star } from "lucide-react";

export function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={i <= Math.round(rating) ? "fill-accent text-accent" : "fill-transparent text-muted-foreground/40"}
        />
      ))}
    </div>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          aria-label={`Beri rating ${i} bintang`}
          className="p-0.5 hover:scale-110 transition-transform"
        >
          <Star
            width={30}
            height={30}
            className={i <= value ? "fill-accent text-accent" : "fill-transparent text-muted-foreground/40"}
          />
        </button>
      ))}
    </div>
  );
}
