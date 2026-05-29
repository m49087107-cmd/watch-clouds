import { useState } from "react";
import { Link, useRoute } from "wouter";
import { MainLayout } from "@/components/layout/main-layout";
import { useGetMovie, useGetMovieReviews, useCreateReview, useGetWatchlist, useAddToWatchlist, useRemoveFromWatchlist } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { getBackdropUrl, getPosterUrl, formatRuntime } from "@/lib/utils";
import { Loader2, Star, Clock, Globe, Play, BookmarkPlus, BookmarkCheck, Calendar, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function MovieDetail() {
  const [, params] = useRoute("/movie/:id");
  const id = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: movie, isLoading } = useGetMovie(id || "", {
    query: { enabled: !!id, queryKey: ["movie", id] }
  });

  const { data: reviews, refetch: refetchReviews } = useGetMovieReviews(id || "", {
    query: { enabled: !!id, queryKey: ["reviews", id] }
  });

  const { data: watchlist, refetch: refetchWatchlist } = useGetWatchlist({
    query: { enabled: !!user, queryKey: ["watchlist"] }
  });

  const addMutation = useAddToWatchlist();
  const removeMutation = useRemoveFromWatchlist();
  const reviewMutation = useCreateReview();

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(10);

  if (isLoading || !movie) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const inWatchlist = watchlist?.some(m => m.id === movie.id) || false;

  const handleWatchlist = () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Sign in to manage watchlist.", variant: "destructive" });
      return;
    }
    if (inWatchlist) {
      removeMutation.mutate({ movieId: movie.id }, {
        onSuccess: () => { toast({ description: "Removed from watchlist" }); refetchWatchlist(); }
      });
    } else {
      addMutation.mutate({ movieId: movie.id }, {
        onSuccess: () => { toast({ description: "Added to watchlist" }); refetchWatchlist(); }
      });
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    reviewMutation.mutate({ id: movie.id, data: { rating: reviewRating, comment: reviewText } }, {
      onSuccess: () => {
        toast({ description: "Review submitted successfully!" });
        setReviewText("");
        setReviewRating(10);
        refetchReviews();
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <MainLayout>
      {/* Hero Backdrop Section */}
      <div className="relative w-full min-h-[85vh] bg-black pt-16">
        <div className="absolute inset-0">
          <img 
            src={getBackdropUrl(movie.backdropUrl || movie.posterUrl)} 
            alt={movie.title}
            className="w-full h-full object-cover object-top opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-16 md:pt-32 pb-20">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-start">
            {/* Poster */}
            <div className="w-48 md:w-80 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 self-center md:self-start">
              <img src={getPosterUrl(movie.posterUrl)} alt={movie.title} className="w-full h-auto object-cover" />
            </div>

            {/* Details */}
            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-primary/20 text-primary border border-primary/50 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {movie.type}
                </span>
                <span className="flex items-center gap-1.5 text-white/80 text-sm font-medium">
                  <Calendar className="w-4 h-4" /> {movie.year}
                </span>
                {movie.runtime && (
                  <span className="flex items-center gap-1.5 text-white/80 text-sm font-medium">
                    <Clock className="w-4 h-4" /> {formatRuntime(movie.runtime)}
                  </span>
                )}
                {movie.language && (
                  <span className="flex items-center gap-1.5 text-white/80 text-sm font-medium uppercase">
                    <Globe className="w-4 h-4" /> {movie.language}
                  </span>
                )}
                <div className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 text-xs font-bold px-3 py-1 rounded-full">
                  <Star className="w-3.5 h-3.5 fill-current" /> {movie.rating.toFixed(1)}
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
                {movie.title}
              </h1>

              <div className="flex flex-wrap gap-2">
                {movie.genres.map(g => (
                  <span key={g} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium">
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-lg text-white/70 leading-relaxed max-w-3xl font-light">
                {movie.overview}
              </p>

              <div className="flex flex-wrap gap-4 pt-6">
                <Button size="lg" className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_0_30px_rgba(0,188,212,0.3)] transition-all hover:scale-105">
                  <Play className="w-5 h-5 mr-2 fill-current" /> Play Trailer
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleWatchlist}
                  disabled={addMutation.isPending || removeMutation.isPending}
                  className="h-14 px-8 rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all"
                >
                  {inWatchlist ? (
                    <><BookmarkCheck className="w-5 h-5 mr-2 text-primary" /> In Watchlist</>
                  ) : (
                    <><BookmarkPlus className="w-5 h-5 mr-2" /> Add to Watchlist</>
                  )}
                </Button>
              </div>

              {/* Cast */}
              {movie.cast && movie.cast.length > 0 && (
                <div className="pt-10">
                  <h3 className="text-xl font-serif font-bold text-white mb-6 border-b border-white/10 pb-2 inline-block">Top Cast</h3>
                  <div className="flex flex-wrap gap-6">
                    {movie.cast.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 w-48">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex-shrink-0 border border-white/10">
                          {c.profileUrl ? (
                            <img src={getPosterUrl(c.profileUrl)} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><UserIcon className="w-5 h-5 text-white/30" /></div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-white truncate">{c.name}</p>
                          <p className="text-xs text-white/50 truncate">{c.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <h2 className="text-3xl font-serif font-bold text-white mb-10 flex items-center gap-3">
          <Star className="w-8 h-8 text-primary fill-primary/20" /> Reviews
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-6">
            {!reviews || reviews.length === 0 ? (
              <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
                <p className="text-white/50">No reviews yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="p-6 bg-card rounded-2xl border border-white/10 space-y-4 shadow-xl">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {review.userName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-white">{review.userName || 'Anonymous'}</p>
                        <p className="text-xs text-white/40">{format(new Date(review.createdAt), 'MMM d, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded text-yellow-400 font-bold text-sm">
                      <Star className="w-3.5 h-3.5 fill-current" /> {review.rating}/10
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-white/70 text-sm leading-relaxed">{review.comment}</p>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="md:col-span-1">
            {user ? (
              <div className="p-6 bg-card/50 rounded-2xl border border-white/10 sticky top-24">
                <h3 className="text-lg font-serif font-bold text-white mb-4">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Rating ({reviewRating}/10)</label>
                    <input 
                      type="range" 
                      min="1" max="10" 
                      value={reviewRating} 
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Review</label>
                    <Textarea 
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="What did you think of the movie?"
                      className="bg-black/50 border-white/10 text-white min-h-[120px] resize-none focus-visible:ring-primary"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={reviewMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg"
                  >
                    {reviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Submit Review
                  </Button>
                </form>
              </div>
            ) : (
              <div className="p-6 bg-card/50 rounded-2xl border border-white/10 text-center">
                <h3 className="text-lg font-serif font-bold text-white mb-2">Join the Discussion</h3>
                <p className="text-white/50 text-sm mb-6">Sign in to leave a review and rate this movie.</p>
                <Link href="/login">
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white">Sign In</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
