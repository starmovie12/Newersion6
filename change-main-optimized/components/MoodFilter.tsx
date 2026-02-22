'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Zap, Moon, Heart, Flame, Ghost, Coffee } from 'lucide-react';

const MOODS = [
  { id: 'action', label: 'Adrenaline Rush', icon: Zap, color: 'from-orange-500 to-red-600', genres: '28,12' },
  { id: 'horror', label: 'Late Night Chills', icon: Moon, color: 'from-indigo-900 to-purple-900', genres: '27,53' },
  { id: 'romance', label: 'Tearjerkers', icon: Heart, color: 'from-pink-500 to-rose-600', genres: '10749,18' },
  { id: 'comedy', label: 'Good Vibes', icon: Coffee, color: 'from-yellow-400 to-orange-500', genres: '35' },
  { id: 'trending', label: 'Hottest Now', icon: Flame, color: 'from-red-500 to-orange-600', genres: '' },
  { id: 'sci-fi', label: 'Future Shock', icon: Ghost, color: 'from-cyan-500 to-blue-600', genres: '878' },
];

interface MoodFilterProps {
  activeMood: string;
  onMoodChange: (mood: any) => void;
}

export const MoodFilter = ({ activeMood, onMoodChange }: MoodFilterProps) => {
  return (
    <div className="w-full py-8 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-4 px-6 md:px-16 min-w-max">
        <h2 className="text-xl font-bold text-white mr-4">What&apos;s your mood?</h2>
        {MOODS.map((mood) => {
          const Icon = mood.icon;
          const isActive = activeMood === mood.id;

          return (
            <motion.button
              key={mood.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onMoodChange(mood)}
              className={`
                relative flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300
                ${isActive 
                  ? `bg-gradient-to-r ${mood.color} text-white shadow-lg shadow-black/40 border-transparent` 
                  : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <Icon size={18} className={isActive ? 'animate-pulse' : ''} />
              <span className="font-bold text-sm tracking-tight">{mood.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="mood-glow"
                  className="absolute inset-0 rounded-2xl bg-white/20 blur-md -z-10"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
