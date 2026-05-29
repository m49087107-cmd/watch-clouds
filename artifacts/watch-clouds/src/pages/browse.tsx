import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useListMovies, useListGenres, useGetWatchlist } from "@workspace/api-client-react";
import { MovieCard } from "@/components/movie-card";
import { Loader2, Search, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ListMoviesType } from "@workspace/api-client-react";
export default function Browse() {
  const [search, setSearch] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");
  
  const handleSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout((handleSearchChange as any)._t);
    (handleSearchChange as any)._t = setTimeout(() => setDebouncedValue(val), 500);
  };

  const [type, setType] = useState<"all" | ListMoviesType>("all");
  const [genre, setGenre] = useState<string>("all");
  const [page, setPage] = useState(1);

  const { data: genresData } = useListGenres();
  
  const { data: moviesData, isLoading } = useListMovies({
    search: debouncedValue || undefined,
    type: type === "all" ? undefined : type,
    genre: genre === "all" ? undefined : genre,
    page,
    limit: 24,
  });

  const { data: watchlist } = useGetWatchlist();
  const watchlistIds = new Set(watchlist?.map(m => m.id) || []);

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedValue("");
    setType("all" as const);
    setGenre("all");
    setPage(1);
  };

  return (
    <MainLayout>
      <div className="bg-card border-b border-white/10 sticky top-16 z-30 shadow-2xl shadow-black/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                value={search}
                onChange={(e) => { handleSearchChange(e.target.value); setPage(1); }}
                placeholder="Search movies, TV series, anime..."
                className="w-full pl-12 h-14 bg-black/40 border-white/10 text-white rounded-full text-lg placeholder:text-white/30 focus-visible:ring-primary focus-visible:border-primary transition-all"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Select value={type} onValueChange={(v) => { setType(v as any); setPage(1); }}>
                <SelectTrigger className="w-[160px] h-14 bg-black/40 border-white/10 text-white rounded-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-md border-white/10">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="movie">Movies</SelectItem>
                  <SelectItem value="webseries">TV Series</SelectItem>
                  <SelectItem value="anime">Anime</SelectItem>
                  <SelectItem value="documentary">Documentaries</SelectItem>
                </SelectContent>
              </Select>

              <Select value={genre} onValueChange={(v) => { setGenre(v); setPage(1); }}>
                <SelectTrigger className="w-[160px] h-14 bg-black/40 border-white/10 text-white rounded-full">
                  <SelectValue placeholder="All Genres" />
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-md border-white/10 max-h-80">
                  <SelectItem value="all">All Genres</SelectItem>
                  {genresData?.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(search || type !== "all" || genre !== "all") && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClearFilters}
                  className="h-14 w-14 rounded-full bg-white/5 hover:bg-destructive/20 hover:text-destructive text-white/50 border border-white/10"
                  title="Clear filters"
                >
                  <FilterX className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {isLoading ? (
          <div className="py-32 flex justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : moviesData?.movies && moviesData.movies.length > 0 ? (
          <>
            <div className="mb-6 flex items-center justify-between text-white/50 text-sm">
              <p>Showing {moviesData.movies.length} of {moviesData.total} results</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {moviesData.movies.map((movie, index) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  index={index % 12}
                  inWatchlist={watchlistIds.has(movie.id)}
                />
              ))}
            </div>

            {moviesData.totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                <Button
                  variant="outline"
                  className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4 text-white/50 font-medium">
                  Page {page} of {moviesData.totalPages}
                </div>
                <Button
                  variant="outline"
                  className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                  disabled={page === moviesData.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="py-32 text-center bg-white/5 rounded-2xl border border-white/10 mt-8">
            <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-serif text-white font-semibold mb-2">No results found</h2>
            <p className="text-white/50 max-w-sm mx-auto">
              We couldn't find anything matching your current filters. Try adjusting your search or clearing filters.
            </p>
            <Button onClick={handleClearFilters} className="mt-6 bg-white/10 hover:bg-white/20 text-white rounded-full">
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
