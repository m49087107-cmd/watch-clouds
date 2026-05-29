import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Search, LogOut, User as UserIcon, LayoutDashboard, Bookmark } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import logoUrl from "@assets/IMG-20260522-WA0002_1780067697586.jpg";
import { useLocation } from "wouter";

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 rounded overflow-hidden">
              <img src={logoUrl} alt="Watch Clouds" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
            </div>
            <span className="font-serif font-bold text-xl tracking-wide text-white">Watch Clouds</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">Home</Link>
            <Link href="/browse" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">Browse</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/browse" className="text-white/70 hover:text-primary transition-colors p-2">
            <Search className="w-5 h-5" />
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-white/5 hover:bg-white/10 border border-white/10">
                  <UserIcon className="w-4 h-4 text-white/70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card/95 backdrop-blur-md border-white/10">
                <div className="px-2 py-1.5 text-sm font-medium text-white/90 truncate">
                  {user.name}
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                {isAdmin && (
                  <DropdownMenuItem onClick={() => setLocation("/admin")} className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-primary">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setLocation("/watchlist")} className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-primary">
                  <Bookmark className="mr-2 h-4 w-4" />
                  <span>Watchlist</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-white/70 hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm h-9 px-4 rounded-full font-medium shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5">
                  Join Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
