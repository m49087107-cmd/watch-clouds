import { useEffect, useState, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, Star } from "lucide-react";
import type { Movie } from "@workspace/api-client-react";
import { getBackdropUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  movies: Movie[];
}

export function HeroBanner({ movies }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<number | null>(null);

  const startTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (movies.length || 1));
    }, 8000);
  };

  useEffect(() => {
    if (movies.length > 0) {
      startTimer();
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [movies.length]);

  if (!movies.length) return null;

  const currentMovie = movies[currentIndex];

  return (
    <div className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-black">
      {/* Background Images with Crossfade */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={getBackdropUrl(currentMovie.backdropUrl || currentMovie.posterUrl)}
            alt={currentMovie.title}
            className="w-full h-full object-cover object-top opacity-60"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-2xl mt-16 md:mt-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMovie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="bg-primary/90 text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-sm shadow-lg tracking-wider">
                    {currentMovie.type === "movie" ? "MOVIE" : 
                     currentMovie.type === "webseries" ? "TV SERIES" : 
                     currentMovie.type === "anime" ? "ANIME" : "DOCUMENTARY"}
                  </span>
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-sm border border-white/10">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span>{currentMovie.rating.toFixed(1)} / 10</span>
                  </div>
                  <span className="text-white/60 text-sm font-medium">{currentMovie.year}</span>
                </div>

                {/* Title */}
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-[1.1] tracking-tight text-shadow-xl">
                  {currentMovie.title}
                </h1>

                {/* Genres */}
                <div className="flex flex-wrap items-center gap-2">
                  {currentMovie.genres.map(genre => (
                    <span key={genre} className="text-sm font-medium text-white/70 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                      {genre}
                    </span>
                  ))}
                </div>

                {/* Overview */}
                <p className="text-lg text-white/70 line-clamp-3 leading-relaxed max-w-xl text-shadow-sm font-light">
                  {currentMovie.overview}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Link href={`/movie/${currentMovie.id}`}>
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 rounded-full font-semibold text-base shadow-[0_0_40px_rgba(0,188,212,0.4)] transition-all hover:shadow-[0_0_60px_rgba(0,188,212,0.6)] hover:-translate-y-1">
                      <Play className="mr-2 h-5 w-5 fill-current" />
                      Play Now
                    </Button>
                  </Link>
                  <Link href={`/movie/${currentMovie.id}`}>
                    <Button size="lg" variant="outline" className="h-14 px-8 rounded-full font-medium text-base border-white/20 bg-black/40 backdrop-blur-md text-white hover:bg-white/10 hover:text-white transition-all">
                      <Info className="mr-2 h-5 w-5" />
                      More Info
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Pagination Indicators */}
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 flex gap-3">
        {movies.map((m, i) => (
          <button
            key={m.id}
            onClick={() => {
              setCurrentIndex(i);
              startTimer();
            }}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === currentIndex ? "w-8 bg-primary shadow-[0_0_10px_rgba(0,188,212,0.8)]" : "w-2 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
