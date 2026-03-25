import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Apple, TreePine, Palette, Trophy, Rocket, Music, Globe, FlaskConical, Sword, Cpu, Waves, BookOpen, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'random',     name: 'Random',       description: 'Mix of everything!',      icon: Sparkles,     gradient: 'from-violet-500 to-indigo-600', bgGradient: 'from-violet-50 to-indigo-50' },
  { id: 'animals',   name: 'Animals',      description: 'Wildlife & creatures',     icon: Sparkles,     gradient: 'from-orange-500 to-red-600',    bgGradient: 'from-orange-50 to-red-50' },
  { id: 'food',      name: 'Food',         description: 'Delicious treats',         icon: Apple,        gradient: 'from-pink-500 to-rose-600',     bgGradient: 'from-pink-50 to-rose-50' },
  { id: 'nature',    name: 'Nature',       description: 'Natural wonders',          icon: TreePine,     gradient: 'from-green-500 to-emerald-600', bgGradient: 'from-green-50 to-emerald-50' },
  { id: 'colors',    name: 'Colors',       description: 'Shades & hues',            icon: Palette,      gradient: 'from-purple-500 to-violet-600', bgGradient: 'from-purple-50 to-violet-50' },
  { id: 'sports',    name: 'Sports',       description: 'Games & activities',       icon: Trophy,       gradient: 'from-blue-500 to-cyan-600',     bgGradient: 'from-blue-50 to-cyan-50' },
  { id: 'space',     name: 'Space',        description: 'Stars & cosmos',           icon: Rocket,       gradient: 'from-slate-600 to-indigo-800',  bgGradient: 'from-slate-50 to-indigo-50' },
  { id: 'music',     name: 'Music',        description: 'Instruments & genres',     icon: Music,        gradient: 'from-fuchsia-500 to-pink-600',  bgGradient: 'from-fuchsia-50 to-pink-50' },
  { id: 'countries', name: 'Countries',    description: 'Nations of the world',     icon: Globe,        gradient: 'from-teal-500 to-cyan-600',     bgGradient: 'from-teal-50 to-cyan-50' },
  { id: 'science',   name: 'Science',      description: 'Physics, biology & more',  icon: FlaskConical, gradient: 'from-lime-500 to-green-600',    bgGradient: 'from-lime-50 to-green-50' },
  { id: 'mythology', name: 'Mythology',    description: 'Gods & legends',           icon: Sword,        gradient: 'from-amber-500 to-yellow-600',  bgGradient: 'from-amber-50 to-yellow-50' },
  { id: 'technology',name: 'Technology',   description: 'Gadgets & computing',      icon: Cpu,          gradient: 'from-sky-500 to-blue-600',      bgGradient: 'from-sky-50 to-blue-50' },
  { id: 'ocean',     name: 'Ocean',        description: 'Sea life & waters',        icon: Waves,        gradient: 'from-blue-400 to-teal-600',     bgGradient: 'from-blue-50 to-teal-50' },
  { id: 'history',   name: 'History',      description: 'Ancient & medieval',       icon: BookOpen,     gradient: 'from-stone-500 to-amber-700',   bgGradient: 'from-stone-50 to-amber-50' },
  { id: 'emotions',  name: 'Emotions',     description: 'Feelings & moods',         icon: Heart,        gradient: 'from-rose-500 to-red-600',      bgGradient: 'from-rose-50 to-red-50' },
];

export default function CategorySelector({ onSelectCategory }) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 text-center">Choose a Category</h3>
      <div className="grid grid-cols-2 gap-2">
         {categories.map((category, index) => {
           const Icon = category.icon;
           return (
             <motion.button
               key={category.id}
               onClick={() => onSelectCategory(category.id)}
               className={cn(
                 "p-2 rounded-2xl border-2 border-transparent transition-all text-left",
                 `bg-gradient-to-br ${category.bgGradient} hover:shadow-lg hover:border-violet-200`
               )}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: index * 0.08 }}
               whileHover={{ scale: 1.05, y: -2 }}
               whileTap={{ scale: 0.98 }}
             >
               <div className={cn(
                 "w-8 h-8 mb-0.5 rounded-lg bg-gradient-to-br shadow-sm flex items-center justify-center shrink-0",
                 category.gradient
               )}>
                 <Icon className="w-4 h-4 text-white" />
               </div>
               <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-tight line-clamp-1">{category.name}</h4>
               <p className="text-[10px] text-slate-600 dark:text-slate-400 whitespace-normal leading-none line-clamp-1">{category.description}</p>
             </motion.button>
           );
         })}
       </div>
     </div>
   );
}