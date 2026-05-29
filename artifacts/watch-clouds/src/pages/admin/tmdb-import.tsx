import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { useTmdbSearch, useTmdbImport } from "@workspace/api-client-react";
import { Loader2, Search, Download, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPosterUrl } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function TmdbImportContent() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [type, setType] = useState<"movie" | "tv">("movie");
  const { toast } = useToast();

  useState(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 700);
    return () => clearTimeout(handler);
  });

  const { data: results, isLoading } = useTmdbSearch({
    query: debouncedSearch,
    type
  }, {
    query: { enabled: debouncedSearch.length > 2, queryKey: ["tmdb-search", debouncedSearch, type] }
  });

  const importMutation = useTmdbImport();
  const [importingId, setImportingId] = useState<number | null>(null);

  const handleImport = (tmdbId: number, mediaType: "movie" | "tv") => {
    setImportingId(tmdbId);
    importMutation.mutate(
      { data: { tmdbId, mediaType } },
      {
        onSuccess: (movie) => {
          toast({ description: `Successfully imported "${movie.title}"!` });
          setImportingId(null);
        },
        onError: (err: any) => {
          toast({ title: "Import Failed", description: err.message, variant: "destructive" });
          setImportingId(null);
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white tracking-wide">TMDB Import</h1>
        <p className="text-white/50 mt-2 max-w-2xl">Search for movies or TV shows on TMDB to instantly import them with all details, genres, and cast.</p>
      </div>

      <div className="flex gap-4 mb-8 bg-card/50 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-10 bg-black/50 border-white/10 text-white h-12"
          />
        </div>
        <Select value={type} onValueChange={(v: any) => setType(v)}>
          <SelectTrigger className="w-[180px] h-12 bg-black/50 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card/95 border-white/10">
            <SelectItem value="movie">Movies</SelectItem>
            <SelectItem value="tv">TV Shows</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : results && results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item) => (
            <div key={item.tmdbId} className="flex gap-4 p-4 rounded-xl bg-card border border-white/10 hover:border-primary/30 transition-colors shadow-lg group">
              <img 
                src={getPosterUrl(item.posterUrl)} 
                alt={item.title} 
                className="w-24 h-36 object-cover rounded-md shadow-md"
              />
              <div className="flex-1 min-w-0 flex flex-col">
                <h3 className="text-white font-bold line-clamp-2 leading-tight mb-1">{item.title}</h3>
                <div className="flex items-center gap-3 text-xs text-white/60 mb-2">
                  <span>{item.year || 'Unknown Year'}</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-current" /> {item.rating.toFixed(1)}</span>
                </div>
                <p className="text-xs text-white/40 line-clamp-3 mb-3">{item.overview}</p>
                <div className="mt-auto">
                  <Button 
                    size="sm" 
                    className="w-full bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/30"
                    onClick={() => handleImport(item.tmdbId, item.type as "movie" | "tv")}
                    disabled={importMutation.isPending && importingId === item.tmdbId}
                  >
                    {importMutation.isPending && importingId === item.tmdbId ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Import Data
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : debouncedSearch.length > 2 ? (
        <div className="text-center py-20 text-white/50 bg-card/20 rounded-xl border border-white/5">
          No results found on TMDB.
        </div>
      ) : null}
    </AdminLayout>
  );
}

export default function AdminTmdbImport() {
  return <ProtectedRoute component={TmdbImportContent} requireAdmin />;
}
