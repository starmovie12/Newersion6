'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Home, Film, Tv, Heart, User } from 'lucide-react';
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
  const [visibleGenresCount, setVisibleGenresCount] = useState(2); // start with 2 instead of 3
  const [activeMood, setActiveMood] = useState('trending');
  const [moodLoading, setMoodLoading] = useState(false);
  
  const bottomObserverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load critical data first
        const [trendingRes, genresRes] = await Promise.all([
          tmdb.getTrending('all', 'week'),
          tmdb.getGenres('movie'),
        ]);

        setTrending(trendingRes.results);
        setMoodMovies(trendingRes.results);
        setGenres(genresRes.genres);

        // Load secondary data without blocking render
        const [topRatedRes, popularRes] = await Promise.all([
          tmdb.getTopRated('movie'),
          tmdb.getPopular('movie'),
        ]);

        setTopRated(topRatedRes.results);
        setPopular(popularRes.results);
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
      { threshold: 0.1, rootMargin: '0px 0px 600px 0px' }
    );

    if (bottomObserverRef.current) observer.observe(bottomObserverRef.current);
    return () => observer.disconnect();
  }, [genres, visibleGenresCount]);

  const handleMoodChange = useCallback(async (mood: any) => {
    if (mood.id === activeMood) return; // Prevent same mood re-fetch
    setActiveMood(mood.id);
    setMoodLoading(true);
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
      setMoodLoading(false);
    }
  }, [activeMood, trending]);

  const trendingTop10 = useMemo(() => trending.slice(0, 10), [trending]);
  const visibleGenres = useMemo(() => genres.slice(0, visibleGenresCount), [genres, visibleGenresCount]);

  return (
    <main className="relative min-h-screen pb-24 md:pb-0">
      <AuroraBackground />
      <Navbar />
      <HeroBanner />

      <div className="relative z-10 -mt-20">
        <MoodFilter activeMood={activeMood} onMoodChange={handleMoodChange} />

        <div className={`transition-opacity duration-300 ${moodLoading ? 'opacity-50' : 'opacity-100'}`}>
          <MovieRow title={`For Your Mood: ${activeMood.toUpperCase()}`} movies={moodMovies} />
        </div>

        <MovieRow title="Top 10 Movies Today" movies={trendingTop10} isTop10 type="trending" />
        <MovieRow title="Popular on MFLIX" movies={popular} type="movie" />
        <MovieRow title="Critically Acclaimed" movies={topRated} type="movie" />

        {/* Genre rows - lazy loaded */}
        {visibleGenres.map((genre) => (
          <MovieRow
            key={genre.id}
            title={`${genre.name} Movies`}
            genreId={genre.id}
            type="movie"
          />
        ))}

        {/* Bottom sentinel */}
        <div ref={bottomObserverRef} className="h-20 w-full flex items-center justify-center">
          {genres.length > visibleGenresCount && (
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md md:hidden">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 flex items-center justify-around shadow-2xl">
          <button className="p-3 text-red-500" aria-label="Home"><Home size={24} /></button>
          <button className="p-3 text-gray-400" aria-label="Films"><Film size={24} /></button>
          <button className="p-3 text-gray-400" aria-label="TV"><Tv size={24} /></button>
          <button className="p-3 text-gray-400" aria-label="Favorites"><Heart size={24} /></button>
          <button className="p-3 text-gray-400" aria-label="Profile"><User size={24} /></button>
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
