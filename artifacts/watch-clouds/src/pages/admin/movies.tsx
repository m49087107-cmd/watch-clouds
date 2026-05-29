import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { useListMovies, useDeleteMovie } from "@workspace/api-client-react";
import { Loader2, Plus, Search, Trash2, Edit } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPosterUrl } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function MoviesContent() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useState(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  });

  const { data: moviesData, isLoading, refetch } = useListMovies({
    search: debouncedSearch || undefined,
    page,
    limit: 20
  });

  const deleteMutation = useDeleteMovie();

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ description: "Movie deleted successfully" });
            refetch();
          },
          onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
          }
        }
      );
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-wide">Manage Content</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search title..."
              className="w-64 pl-10 bg-black/40 border-white/10 text-white"
            />
          </div>
          <Link href="/admin/movies/new">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> Add Movie
            </Button>
          </Link>
          <Link href="/admin/tmdb-import">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
              TMDB Import
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40 text-white/50 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Movie</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Year</th>
                <th className="p-4 font-medium">Rating</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : moviesData?.movies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/50">
                    No movies found.
                  </td>
                </tr>
              ) : (
                moviesData?.movies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={getPosterUrl(movie.posterUrl)} 
                          alt={movie.title} 
                          className="w-10 h-14 object-cover rounded shadow-md"
                        />
                        <div>
                          <p className="text-white font-medium line-clamp-1">{movie.title}</p>
                          <p className="text-xs text-white/40">{movie.genres.join(', ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-white/10 text-white/80 px-2 py-1 rounded text-xs font-medium uppercase">
                        {movie.type}
                      </span>
                    </td>
                    <td className="p-4 text-white/80">{movie.year}</td>
                    <td className="p-4 text-white/80">{movie.rating.toFixed(1)}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                          onClick={() => handleDelete(movie.id, movie.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {moviesData && moviesData.totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-center gap-4 bg-black/20">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-white/60">Page {page} of {moviesData.totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/10 text-white"
              disabled={page === moviesData.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default function AdminMovies() {
  return <ProtectedRoute component={MoviesContent} requireAdmin />;
}
