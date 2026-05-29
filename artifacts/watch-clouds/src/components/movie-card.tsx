import { Link } from "wouter";
import { motion } from "framer-motion";
import { Star, PlayCircle, Plus } from "lucide-react";
import type { Movie } from "@workspace/api-client-react";
import { getPosterUrl } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useAddToWatchlist, useRemoveFromWatchlist } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

interface MovieCardProps {
  movie: Movie;
  inWatchlist?: boolean;
  onWatchlistChange?: () => void;
  index?: number;
}

export function MovieCard({ movie, inWatchlist = false, onWatchlistChange, index = 0 }: MovieCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const addMutation = useAddToWatchlist();
  const removeMutation = useRemoveFromWatchlist();

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage your watchlist.",
        variant: "destructive"
      });
      return;
    }

    if (inWatchlist) {
      removeMutation.mutate({ movieId: movie.id }, {
        onSuccess: () => {
          toast({ description: "Removed from watchlist" });
          onWatchlistChange?.();
        }
      });
    } else {
      addMutation.mutate({ movieId: movie.id }, {
        onSuccess: () => {
          toast({ description: "Added to watchlist" });
          onWatchlistChange?.();
        }
      });
    }
  };

  const typeDisplay = movie.type === "movie" ? "MOVIE" : 
                      movie.type === "webseries" ? "TV SERIES" : 
                      movie.type === "anime" ? "ANIME" : "DOCUMENTARY";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link href={`/movie/${movie.id}`} className="group block relative rounded-lg overflow-hidden aspect-[2/3] bg-card border border-white/5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 hover:z-10">
        
        {/* Poster */}
        <img 
          src={getPosterUrl(movie.posterUrl)} 
          alt={movie.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="flex flex-col gap-1.5">
            <span className="bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm shadow-lg w-fit">
              {typeDisplay}
            </span>
            <div className="flex items-center gap-1 bg-black/60 text-white text-[11px] font-medium px-2 py-0.5 rounded backdrop-blur-sm w-fit">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          </div>
          
          <button 
            onClick={handleWatchlist}
            disabled={addMutation.isPending || removeMutation.isPending}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-primary/80 transition-all border border-white/10"
          >
            {inWatchlist ? <Star className="w-4 h-4 fill-white text-white" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {/* Hover Action Center */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-90 group-hover:scale-100 transform pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-[0_0_30px_rgba(0,188,212,0.5)]">
            <PlayCircle className="w-7 h-7 text-white ml-0.5" />
          </div>
        </div>

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-bold text-sm line-clamp-1 mb-1 shadow-sm">{movie.title}</h3>
          <div className="flex items-center justify-between text-white/60 text-xs">
            <span>{movie.year}</span>
            <span className="truncate ml-2">{movie.genres.slice(0,2).join(', ')}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
