'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, User, Home, Film, Tv, Heart, Compass } from 'lucide-react';
import { AuroraBackground } from '@/components/AuroraBackground';
import { HeroBanner } from '@/components/HeroBanner';
import { MovieRow } from '@/components/MovieRow';
import { MoodFilter } from '@/components/MoodFilter';
import { Navbar } from '@/components/Navbar';
import { tmdb, Movie, Genre } from '@/lib/tmdb';

export default function MflixHome() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [moodMovies, setMoodMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [visibleGenresCount, setVisibleGenresCount] = useState(3);
  const [activeMood, setActiveMood] = useState('trending');
  const [loading, setLoading] = useState(true);
  
  const bottomObserverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendingRes, topRatedRes, popularRes, genresRes] = await Promise.all([
          tmdb.getTrending('all', 'week'),
          tmdb.getTopRated('movie'),
          tmdb.getPopular('movie'),
          tmdb.getGenres('movie'),
        ]);

        setTrending(trendingRes.results);
        setTopRated(topRatedRes.results);
        setPopular(popularRes.results);
        setGenres(genresRes.genres);
        setMoodMovies(trendingRes.results); // Initial mood
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && genres.length > visibleGenresCount) {
          setVisibleGenresCount(prev => prev + 2);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px 400px 0px' }
    );

    if (bottomObserverRef.current) {
      observer.observe(bottomObserverRef.current);
    }

    return () => observer.disconnect();
  }, [genres, visibleGenresCount]);

  const handleMoodChange = async (mood: any) => {
    setActiveMood(mood.id);
    setLoading(true);
    try {
      if (mood.id === 'trending') {
        setMoodMovies(trending);
      } else {
        const res = await tmdb.discoverByGenre('movie', mood.genres);
        setMoodMovies(res.results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const trendingTop10 = React.useMemo(() => trending.slice(0, 10), [trending]);

  return (
    <main className="relative min-h-screen pb-24 md:pb-0">
      <AuroraBackground />
      
      <Navbar />

      <HeroBanner />

      <div className="relative z-10 -mt-20">
        <MoodFilter activeMood={activeMood} onMoodChange={handleMoodChange} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeMood}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <MovieRow title={`For Your Mood: ${activeMood.toUpperCase()}`} movies={moodMovies} />
          </motion.div>
        </AnimatePresence>

        <MovieRow title="Top 10 Movies Today" movies={trendingTop10} isTop10 type="trending" />
        <MovieRow title="Popular on MFLIX" movies={popular} type="movie" />
        <MovieRow title="Critically Acclaimed" movies={topRated} type="movie" />

        {/* Dynamic Genre Rows */}
        {genres.slice(0, visibleGenresCount).map((genre) => (
          <MovieRow 
            key={genre.id} 
            title={`${genre.name} Movies`} 
            genreId={genre.id} 
            type="movie" 
          />
        ))}

        {/* Bottom Sentinel for Vertical Infinite Scroll */}
        <div ref={bottomObserverRef} className="h-20 w-full flex items-center justify-center">
          {genres.length > visibleGenresCount && (
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Bottom Nav for Mobile */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md md:hidden">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 flex items-center justify-around shadow-2xl">
          <button className="p-3 text-red-500"><Home size={24} /></button>
          <button className="p-3 text-gray-400"><Film size={24} /></button>
          <button className="p-3 text-gray-400"><Tv size={24} /></button>
          <button className="p-3 text-gray-400"><Heart size={24} /></button>
          <button className="p-3 text-gray-400"><User size={24} /></button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-20 px-6 md:px-16 border-t border-white/5 mt-20 text-center">
        <h2 className="text-2xl font-black tracking-tighter text-red-600 italic mb-4">MFLIX</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-8">
          The ultimate cinematic experience. Built for the future of entertainment.
        </p>
        <div className="flex justify-center gap-8 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Help</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </main>
  );
}
