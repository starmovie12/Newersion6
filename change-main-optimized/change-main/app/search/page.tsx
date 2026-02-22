'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, X, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { tmdb, Movie } from '@/lib/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { AuroraBackground } from '@/components/AuroraBackground';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions] = useState([
    "Cyberpunk vibes",
    "90s Action",
    "Mind-bending sci-fi",
    "Epic Fantasy",
    "Dark Thriller",
    "Heartwarming Anime"
  ]);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await tmdb.search(searchQuery);
      setResults(res.results.filter((m: any) => m.poster_path));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [query, handleSearch]);

  return (
    <main className="relative min-h-screen bg-[#03060f] text-white overflow-x-hidden">
      <AuroraBackground />
      <Navbar />

      <div className="relative z-10 pt-24 md:pt-32 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        {/* Search Header */}
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl relative group"
          >
            <div className="absolute inset-0 bg-red-600/20 blur-3xl group-focus-within:bg-red-600/40 transition-all duration-500 rounded-full" />
            <div className="relative flex items-center bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 md:p-4 shadow-2xl group-focus-within:border-white/20 transition-all">
              <SearchIcon className="text-gray-400 ml-2" size={24} />
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, TV shows, or vibes..."
                className="w-full bg-transparent border-none focus:ring-0 text-lg md:text-xl font-medium placeholder:text-gray-500 px-4 outline-none"
                autoFocus
              />
              {query && (
                <button 
                  onClick={() => setQuery('')}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </motion.div>

          {/* AI Suggestions */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex flex-wrap justify-center gap-2 md:gap-3"
          >
            <div className="flex items-center gap-2 text-red-500 text-xs font-black uppercase tracking-widest mr-2">
              <Sparkles size={14} />
              AI Suggestions:
            </div>
            {suggestions.map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs font-bold text-gray-400 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all focus-visible:ring-2 focus-visible:ring-red-500 outline-none"
              >
                {tag}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Results Grid */}
        <div className="pb-24">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20"
              >
                <Loader2 className="text-red-600 animate-spin mb-4" size={48} />
                <p className="text-gray-400 font-bold animate-pulse">Scanning the multiverse...</p>
              </motion.div>
            ) : results.length > 0 ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6"
              >
                {results.map((movie, i) => (
                  <MovieCard key={movie.id} movie={movie} index={i} />
                ))}
              </motion.div>
            ) : query && !loading ? (
              <motion.div 
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🛸</div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">No results found</h3>
                <p className="text-gray-500">Maybe try a different vibe?</p>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 opacity-20"
              >
                <SearchIcon size={120} className="mx-auto mb-6" />
                <p className="text-2xl font-black uppercase italic tracking-widest">Start typing to discover</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
