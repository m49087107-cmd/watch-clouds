import { AdminLayout } from "@/components/layout/admin-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { useCreateMovie } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { MovieInputType } from "@workspace/api-client-react";

const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.nativeEnum(MovieInputType),
  posterUrl: z.string().min(1, "Poster URL is required"),
  backdropUrl: z.string().optional(),
  year: z.coerce.number().min(1800).max(2100),
  rating: z.coerce.number().min(0).max(10),
  genres: z.string().min(1, "At least one genre is required"), // we will split by comma
  overview: z.string().optional(),
  streamUrl: z.string().optional(),
  trailerUrl: z.string().optional(),
  runtime: z.coerce.number().optional(),
  language: z.string().optional(),
  isFeatured: z.boolean().default(false),
});

type MovieFormValues = z.infer<typeof movieSchema>;

function MoviesNewContent() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createMutation = useCreateMovie();

  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: "",
      type: "movie",
      posterUrl: "",
      backdropUrl: "",
      year: new Date().getFullYear(),
      rating: 0,
      genres: "",
      overview: "",
      streamUrl: "",
      trailerUrl: "",
      language: "en",
      isFeatured: false,
    },
  });

  const onSubmit = (data: MovieFormValues) => {
    // Process genres
    const processedGenres = data.genres.split(',').map(g => g.trim()).filter(Boolean);
    
    if (processedGenres.length === 0) {
      form.setError("genres", { message: "Please provide valid genres" });
      return;
    }

    const payload = {
      ...data,
      genres: processedGenres,
      backdropUrl: data.backdropUrl || undefined,
      overview: data.overview || undefined,
      streamUrl: data.streamUrl || undefined,
      trailerUrl: data.trailerUrl || undefined,
      runtime: data.runtime || undefined,
      language: data.language || undefined,
    };

    createMutation.mutate(
      { data: payload as any },
      {
        onSuccess: () => {
          toast({ description: "Movie created successfully!" });
          setLocation("/admin/movies");
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-white tracking-wide mb-8">Add New Content</h1>
        
        <div className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Movie Title" className="bg-black/50 border-white/10 text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Content Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-black/50 border-white/10 text-white">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-card/95 border-white/10">
                          <SelectItem value="movie">Movie</SelectItem>
                          <SelectItem value="webseries">Web Series</SelectItem>
                          <SelectItem value="anime">Anime</SelectItem>
                          <SelectItem value="documentary">Documentary</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Release Year</FormLabel>
                      <FormControl>
                        <Input type="number" className="bg-black/50 border-white/10 text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="posterUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Poster URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." className="bg-black/50 border-white/10 text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="backdropUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Backdrop URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." className="bg-black/50 border-white/10 text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Rating (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" className="bg-black/50 border-white/10 text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Genres</FormLabel>
                      <FormControl>
                        <Input placeholder="Action, Drama, Sci-Fi" className="bg-black/50 border-white/10 text-white" {...field} />
                      </FormControl>
                      <FormDescription className="text-white/40">Comma separated</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="overview"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Overview</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Plot summary..." 
                        className="bg-black/50 border-white/10 text-white resize-none min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="streamUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Stream URL (Optional)</FormLabel>
                      <FormControl>
                        <Input className="bg-black/50 border-white/10 text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="trailerUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Trailer URL (Optional)</FormLabel>
                      <FormControl>
                        <Input className="bg-black/50 border-white/10 text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
                >
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Movie
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation("/admin/movies")}
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>

            </form>
          </Form>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminMoviesNew() {
  return <ProtectedRoute component={MoviesNewContent} requireAdmin />;
}
