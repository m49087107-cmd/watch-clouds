import { useState } from "react";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { HeroBanner } from "@/components/hero-banner";
import { MovieCard } from "@/components/movie-card";
import { useGetFeaturedMovies, useGetTrendingMovies, useListMovies, useGetWatchlist } from "@workspace/api-client-react";
import { Loader2, Flame, PlayCircle, Library } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ListMoviesType } from "@workspace/api-client-react";

export default function Home() {
  const { data: featured, isLoading: featuredLoading } = useGetFeaturedMovies();
  const { data: trending, isLoading: trendingLoading } = useGetTrendingMovies();
  
  const [activeTab, setActiveTab] = useState<"all" | ListMoviesType>("all");
  
  const { data: moviesData, isLoading: moviesLoading } = useListMovies({
    type: activeTab === "all" ? undefined : activeTab,
    limit: 12,
  });

  const { data: watchlist } = useGetWatchlist();
  const watchlistIds = new Set(watchlist?.map(m => m.id) || []);

  const isLoading = featuredLoading || trendingLoading || moviesLoading;

  return (
    <MainLayout>
      {featuredLoading ? (
        <div className="h-[85vh] min-h-[600px] flex items-center justify-center bg-black">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <HeroBanner movies={featured || []} />
      )}

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Trending Section */}
        {trending && trending.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Flame className="w-6 h-6 text-primary fill-primary/20" />
              <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Trending Now</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {trending.map((movie, index) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  index={index}
                  inWatchlist={watchlistIds.has(movie.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Browse by Category Section */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <Library className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Explore Library</h2>
            </div>
            
            <Tabs defaultValue="all" onValueChange={(val) => setActiveTab(val as any)} className="w-full md:w-auto">
              <TabsList className="bg-white/5 border border-white/10 h-12 w-full md:w-auto overflow-x-auto flex flex-nowrap hide-scrollbar justify-start">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-6">All</TabsTrigger>
                <TabsTrigger value="movie" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-6">Movies</TabsTrigger>
                <TabsTrigger value="webseries" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-6">TV Series</TabsTrigger>
                <TabsTrigger value="anime" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-6">Anime</TabsTrigger>
                <TabsTrigger value="documentary" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-6">Documentaries</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {moviesLoading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : moviesData?.movies && moviesData.movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {moviesData.movies.map((movie, index) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  index={index}
                  inWatchlist={watchlistIds.has(movie.id)}
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-white/50 bg-white/5 rounded-xl border border-white/10">
              <p>No content found for this category.</p>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link href="/browse">
              <button className="px-8 py-3 rounded-full border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 transition-all font-medium text-sm inline-flex items-center gap-2 group">
                View All Content
                <PlayCircle className="w-4 h-4 group-hover:text-primary transition-colors" />
              </button>
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
