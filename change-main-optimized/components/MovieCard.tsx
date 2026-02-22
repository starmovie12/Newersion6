'use client';

import React, { useState, useRef, memo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import { getImageUrl, Movie, tmdb } from '@/lib/tmdb';

interface MovieCardProps {
  movie: Movie;
  index: number;
}

export const MovieCard = memo(({ movie, index }: MovieCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [trailerId, setTrailerId] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const trailerFetched = useRef(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    // Only fetch trailer after 2s hover (was 1.5s) and only once
    if (!trailerFetched.current) {
      hoverTimer.current = setTimeout(async () => {
        trailerFetched.current = true;
        try {
          const videos = await tmdb.getVideos(movie.media_type || 'movie', movie.id);
          const trailer = videos.results.find((v: any) => v.type === 'Trailer' || v.type === 'Teaser');
          if (trailer) setTrailerId(trailer.key);
        } catch (err) {
          // silent fail
        }
      }, 2000);
    }
  }, [movie.id, movie.media_type]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }, []);

  return (
    <Link
      href={`/player/${movie.id}`}
      className="block w-full snap-start focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-600 rounded-2xl"
    >
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative group w-full cursor-pointer hover:scale-105 transition-transform duration-300 ease-out"
      >
        {/* Poster Container */}
        <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#1a1f2e] border border-white/5 shadow-2xl transition-all duration-300 group-hover:border-white/20">
          {/* Language Badge */}
          <div className="absolute top-2 left-2 z-40 bg-black/60 backdrop-blur-md text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 rounded-lg border border-white/10 uppercase tracking-tighter">
            {movie.original_language === 'hi' ? 'HINDI' : movie.original_language === 'en' ? 'ENGLISH' : movie.original_language?.toUpperCase() || 'DUAL'}
          </div>

          {/* Image or Trailer */}
          {isHovered && trailerId ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerId}&modestbranding=1`}
              className="absolute inset-0 w-full h-full object-cover scale-150"
              allow="autoplay"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105">
              <Image
                src={getImageUrl(movie.poster_path)}
                alt={movie.title || movie.name || ''}
                fill
                sizes="(max-width: 768px) 30vw, (max-width: 1200px) 20vw, 16vw"
                className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                loading={index < 6 ? 'eager' : 'lazy'}
                onLoad={() => setImageLoaded(true)}
                referrerPolicy="no-referrer"
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-[#1a1f2e] animate-pulse" />
              )}
            </div>
          )}

          {/* Glare on hover */}
          <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-white/40 via-transparent to-transparent" />

          {/* Hover Play Button */}
          <div className="absolute inset-0 z-30 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white text-black rounded-full flex items-center justify-center shadow-xl">
              <Play className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Info Below Poster */}
        <div className="mt-2 md:mt-3 px-1">
          <div className="flex items-center justify-between gap-1 md:gap-2 mb-0.5 md:mb-1">
            <h3 className="text-white font-bold text-xs md:text-sm line-clamp-1 flex-1">
              {movie.title || movie.name}
            </h3>
            <span className="text-[9px] md:text-[11px] text-gray-500 font-medium shrink-0">
              {new Date(movie.release_date || movie.first_air_date || '').getFullYear() || 'N/A'}
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-[8px] md:text-[10px] text-gray-400 font-black border border-white/10 px-1 md:px-1.5 rounded bg-white/5">
              {movie.vote_average > 7.5 ? '4K' : 'HD'}
            </span>
            <div className="flex items-center gap-1 text-yellow-500 text-[9px] md:text-[11px] font-bold">
              <Star className="w-2 h-2 md:w-2.5 md:h-2.5" fill="currentColor" />
              {movie.vote_average.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Trending badge */}
        {index < 5 && (
          <div className="absolute top-2 right-2 z-40 bg-red-600 text-white text-[7px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            TRENDING
          </div>
        )}
      </div>
    </Link>
  );
});

MovieCard.displayName = 'MovieCard';
