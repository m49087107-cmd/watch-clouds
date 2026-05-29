import { AdminLayout } from "@/components/layout/admin-layout";
import { ProtectedRoute } from "@/components/protected-route";
import { useGetAdminStats } from "@workspace/api-client-react";
import { Loader2, Film, Users, Bookmark, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { getPosterUrl } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function DashboardContent() {
  const { data: stats, isLoading } = useGetAdminStats();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!stats) return null;

  const statCards = [
    { title: "Total Movies", value: stats.totalMovies, icon: Film, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Watchlist Entries", value: stats.totalWatchlistEntries, icon: Bookmark, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Active Types", value: Object.keys(stats.moviesByType).length, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-wide">Dashboard Overview</h1>
          <p className="text-white/50 mt-1">Welcome to the Watch Clouds admin panel.</p>
        </div>
        <Link href="/admin/movies/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            Add New Movie
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Card key={i} className="bg-card/50 border-white/10 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-white/70">{card.title}</CardTitle>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1 lg:col-span-2 bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-serif text-white">Recent Additions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentMovies.map((movie) => (
                <div key={movie.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <img 
                    src={getPosterUrl(movie.posterUrl)} 
                    alt={movie.title} 
                    className="w-12 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">{movie.title}</h4>
                    <p className="text-white/50 text-sm">{movie.year} • {movie.type.toUpperCase()}</p>
                  </div>
                  <Link href={`/movie/${movie.id}`}>
                    <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-serif text-white">Content by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.moviesByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <span className="text-white/80 capitalize font-medium">{type}</span>
                  <span className="text-white bg-primary/20 px-3 py-1 rounded-full text-sm font-bold border border-primary/30">
                    {count as number}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default function AdminDashboard() {
  return <ProtectedRoute component={DashboardContent} requireAdmin />;
}
