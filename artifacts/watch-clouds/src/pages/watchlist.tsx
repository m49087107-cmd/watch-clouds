import { MainLayout } from "@/components/layout/main-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { useGetWatchlist } from "@workspace/api-client-react";
import { MovieCard } from "@/components/movie-card";
import { Loader2, Bookmark, BookmarkPlus } from "lucide-react";
import { Link } from "wouter";

function WatchlistContent() {
  const { data: watchlist, isLoading, refetch } = useGetWatchlist();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/10">
          <Bookmark className="w-8 h-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-wide">My Watchlist</h1>
          {watchlist && (
            <span className="ml-auto bg-white/10 text-white/80 px-3 py-1 rounded-full text-sm font-medium">
              {watchlist.length} {watchlist.length === 1 ? 'Item' : 'Items'}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="py-32 flex justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : watchlist && watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {watchlist.map((movie, index) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                index={index}
                inWatchlist={true}
                onWatchlistChange={refetch}
              />
            ))}
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center bg-white/5 rounded-2xl border border-white/10">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <BookmarkPlus className="w-10 h-10 text-white/40" />
            </div>
            <h2 className="text-2xl font-serif text-white font-semibold mb-2">Your watchlist is empty</h2>
            <p className="text-white/50 max-w-md mb-8">
              Save movies and shows you want to watch later. They will appear here for easy access.
            </p>
            <Link href="/browse">
              <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-full transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
                Explore Content
              </button>
            </Link>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default function Watchlist() {
  return <ProtectedRoute component={WatchlistContent} />;
}
