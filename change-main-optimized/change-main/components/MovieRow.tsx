'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { MovieCard } from './MovieCard';
import { Movie, tmdb } from '@/lib/tmdb';

interface MovieRowProps {
  title: string;
  movies?: Movie[];
  isTop10?: boolean;
  genreId?: number;
  type?: 'movie' | 'tv' | 'trending';
}

export const MovieRow = ({ title, movies: initialMovies = [], isTop10 = false, genreId, type = 'movie' }: MovieRowProps) => {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  // Sync with initialMovies only when they change significantly
  useEffect(() => {
    if (initialMovies.length > 0) {
      setMovies(initialMovies);
      setPage(1);
      setHasMore(true);
    }
  }, [initialMovies, genreId, type]);

  useEffect(() => {
    if (movies.length === 0 && (genreId || type)) {
      const fetchInitial = async () => {
        setLoading(true);
        try {
          let res;
          if (type === 'trending') {
            res = await tmdb.getTrending('all', 'week', 1);
          } else if (genreId) {
            res = await tmdb.discoverByGenre(type, genreId.toString(), 1);
          } else if (title.toLowerCase().includes('top rated')) {
            res = await tmdb.getTopRated(type, 1);
          } else {
            res = await tmdb.getPopular(type, 1);
          }
          setMovies(res.results);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchInitial();
    }
  }, [genreId, type, movies.length, title]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      let res;
      const nextPage = page + 1;
      if (type === 'trending') {
        res = await tmdb.getTrending('all', 'week', nextPage);
      } else if (genreId) {
        res = await tmdb.discoverByGenre(type, genreId.toString(), nextPage);
      } else if (title.toLowerCase().includes('top rated')) {
        res = await tmdb.getTopRated(type, nextPage);
      } else {
        res = await tmdb.getPopular(type, nextPage);
      }

      if (res.results.length === 0) {
        setHasMore(false);
      } else {
        setMovies(prev => [...prev, ...res.results]);
        setPage(nextPage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, type, genreId, title]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMore();
        }
      },
      { threshold: 0.1, rootMargin: '0px 200px 0px 0px' }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [fetchMore]);

  return (
    <div className="relative group py-4 md:py-8">
      <div className="flex items-center justify-between px-4 md:px-8 lg:px-12 mb-2 md:mb-4">
        <h2 className="text-lg md:text-2xl 2xl:text-4xl font-black tracking-tighter text-white uppercase italic">
          {title}
        </h2>
        <div className="hidden md:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all focus-visible:ring-2 focus-visible:ring-red-500 outline-none"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all focus-visible:ring-2 focus-visible:ring-red-500 outline-none"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-2 md:gap-4 px-4 md:px-8 lg:px-12 overflow-x-auto no-scrollbar scroll-smooth pb-4 snap-x mandatory"
      >
        {movies.map((movie, i) => (
          <div 
            key={`${movie.id}-${i}`} 
            className={`
              ${isTop10 
                ? 'min-w-[70%] md:min-w-[320px] lg:min-w-[400px]' 
                : 'min-w-[28.5%] md:min-w-[20%] lg:min-w-[16.66%] xl:min-w-[12.5%]'} 
              relative snap-start
            `}
          >
            {isTop10 && (
              <div className="absolute -left-4 bottom-0 z-40 pointer-events-none">
                <span className="text-[80px] md:text-[120px] lg:text-[180px] font-black leading-none text-transparent stroke-white stroke-2 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] select-none">
                  {i + 1}
                </span>
              </div>
            )}
            <div className={isTop10 ? 'pl-8 md:pl-12' : ''}>
              <MovieCard movie={movie} index={i} />
            </div>
          </div>
        ))}
        
        {/* Sentinel for Infinite Scroll */}
        <div ref={observerRef} className="min-w-[15px] md:min-w-[30px] flex items-center justify-center pr-4">
          {loading && <Loader2 className="text-red-600 animate-spin w-6 h-6 md:w-8 md:h-8" />}
        </div>
      </div>
    </div>
  );
};
