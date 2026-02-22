'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Play, Plus, Star, ChevronRight } from 'lucide-react';
import { getImageUrl, Movie, tmdb } from '@/lib/tmdb';

interface MovieCardProps {
  movie: Movie;
  index: number;
}

export const MovieCard = ({ movie, index }: MovieCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [trailerId, setTrailerId] = useState<string | null>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    hoverTimer.current = setTimeout(async () => {
      try {
        const videos = await tmdb.getVideos(movie.media_type || 'movie', movie.id);
        const trailer = videos.results.find((v: any) => v.type === 'Trailer' || v.type === 'Teaser');
        if (trailer) setTrailerId(trailer.key);
      } catch (err) {
        console.error(err);
      }
    }, 1500);
  };

  return (
    <Link 
      href={`/player/${movie.id}`} 
      className="block w-full snap-start focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-600 rounded-2xl transition-all"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.05 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative group w-full cursor-pointer perspective-1000 hover:scale-105 transition-transform duration-300"
      >
        {/* Poster Container */}
        <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#1a1f2e] border border-white/5 shadow-2xl transition-all duration-500 group-hover:border-white/20">
          {/* Language Badge */}
          <div className="absolute top-2 left-2 z-40 bg-black/60 backdrop-blur-md text-white text-[8px] md:text-[10px] font-black px-1.5 md:px-2 py-0.5 rounded-lg border border-white/10 uppercase tracking-tighter">
            {movie.original_language === 'hi' ? 'HINDI' : movie.original_language === 'en' ? 'ENGLISH' : movie.original_language?.toUpperCase() || 'DUAL'}
          </div>

          {/* Image / Trailer */}
          <AnimatePresence mode="wait">
            {isHovered && trailerId ? (
              <motion.div
                key="trailer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10"
              >
                <iframe
                  src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerId}&modestbranding=1`}
                  className="w-full h-full object-cover scale-150"
                  allow="autoplay"
                />
              </motion.div>
            ) : (
              <motion.div
                key="poster"
                className="absolute inset-0 w-full h-full transition-transform duration-700 group-hover:scale-110"
              >
                <Image
                  src={getImageUrl(movie.poster_path)}
                  alt={movie.title || movie.name || ''}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic Glare */}
          <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/40 via-transparent to-transparent" />

          {/* Hover Overlay Actions */}
          <div className="absolute inset-0 z-30 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white text-black rounded-full flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
              <Play className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Info Section Below Poster */}
        <div className="mt-2 md:mt-3 px-1">
          <div className="flex items-center justify-between gap-1 md:gap-2 mb-0.5 md:mb-1">
            <h3 className="text-white font-bold text-xs md:text-sm 2xl:text-lg line-clamp-1 flex-1">
              {movie.title || movie.name}
            </h3>
            <span className="text-[9px] md:text-[11px] 2xl:text-sm text-gray-500 font-medium shrink-0">
              {new Date(movie.release_date || movie.first_air_date || '').getFullYear() || 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-[8px] md:text-[10px] 2xl:text-xs text-gray-400 font-black border border-white/10 px-1 md:px-1.5 rounded bg-white/5">
              {movie.vote_average > 7.5 ? '4K' : 'HD'}
            </span>
            <div className="flex items-center gap-1 text-yellow-500 text-[9px] md:text-[11px] 2xl:text-sm font-bold">
              <Star className="w-2 h-2 md:w-2.5 md:h-2.5" fill="currentColor" />
              {movie.vote_average.toFixed(1)}
            </div>
          </div>
        </div>

        {/* 3D Depth Elements */}
        {index < 5 && (
          <div 
            style={{ transform: "translateZ(50px)" }}
            className="absolute top-2 right-2 z-40 bg-red-600 text-white text-[7px] md:text-[9px] font-black px-1.5 md:px-2 py-0.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            TRENDING
          </div>
        )}
      </motion.div>
    </Link>
  );
};
