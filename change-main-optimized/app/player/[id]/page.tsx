'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Plus, Star, ChevronLeft, Volume2, VolumeX, Info, Share2, Film } from 'lucide-react';
import { tmdb, getImageUrl, Movie } from '@/lib/tmdb';
import { AuroraBackground } from '@/components/AuroraBackground';
import { MovieRow } from '@/components/MovieRow';
import { Navbar } from '@/components/Navbar';
import Image from 'next/image';

export default function PlayerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState<any>(null);
  const [trailerId, setTrailerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovie = async () => {
      if (!id) return;
      try {
        const data = await tmdb.getMovieDetails(Number(id));
        setMovie(data);
        const trailer = data.videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
        if (trailer) setTrailerId(trailer.key);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMovie();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#03060f] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
  </div>;

  if (!movie) return <div className="min-h-screen bg-[#03060f] flex items-center justify-center text-white">Movie not found</div>;

  return (
    <main className="relative min-h-screen bg-[#03060f]">
      <AuroraBackground />
      <Navbar />

      {/* Video Player Section */}
      <section className="relative w-full aspect-video bg-black">
        {trailerId ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&controls=1&rel=0&modestbranding=1`}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Film size={64} className="mx-auto mb-4 opacity-20" />
              <p>Trailer not available</p>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => router.back()}
          className="absolute top-24 left-6 md:left-16 z-50 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
      </section>

      {/* Content Section */}
      <section className="relative z-10 px-6 md:px-16 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left: Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-red-600 text-white text-xs font-black px-2 py-1 rounded">PREMIUM</span>
              <div className="flex items-center gap-1 text-yellow-400 font-bold">
                <Star size={16} fill="currentColor" />
                {movie.vote_average.toFixed(1)}
              </div>
              <span className="text-gray-400 font-bold">{new Date(movie.release_date).getFullYear()}</span>
              <span className="text-gray-400 font-bold border border-white/20 px-2 rounded">4K</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase italic">
              {movie.title}
            </h1>

            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              {movie.overview}
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <button className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all transform hover:scale-105 active:scale-95 shadow-xl">
                <Play className="fill-current" size={20} />
                Watch Now
              </button>
              <button className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-8 py-3 rounded-xl font-bold hover:bg-white/20 transition-all border border-white/10">
                <Plus size={20} />
                Watchlist
              </button>
              <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
                <Share2 size={20} />
              </button>
            </div>

            {/* Cast */}
            <div className="mb-12">
              <h3 className="text-xl font-bold mb-6 text-white">Top Cast</h3>
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                {movie.credits.cast.slice(0, 10).map((person: any) => (
                  <div key={person.id} className="min-w-[100px] text-center group">
                    <div className="relative w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-red-600 transition-colors">
                      <Image
                        src={getImageUrl(person.profile_path, 'profile')}
                        alt={person.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-xs font-bold text-white line-clamp-1">{person.name}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-1">{person.character}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((g: any) => (
                      <span key={g.id} className="text-xs font-bold text-white bg-white/10 px-3 py-1 rounded-full">
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Director</h4>
                  <p className="text-sm font-bold text-white">
                    {movie.credits.crew.find((c: any) => c.job === 'Director')?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Runtime</h4>
                  <p className="text-sm font-bold text-white">{movie.runtime} minutes</p>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Status</h4>
                  <p className="text-sm font-bold text-green-500">{movie.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Movies */}
        <div className="mt-20">
          <MovieRow title="More Like This" movies={movie.similar.results} />
        </div>
      </section>
    </main>
  );
}
