import { Link, useLocation } from "wouter";
import { LayoutDashboard, Film, Users, Search, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import logoUrl from "@assets/IMG-20260522-WA0002_1780067697586.jpg";

export function AdminSidebar() {
  const [location] = useLocation();
  const { logout } = useAuth();

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/movies", label: "Movies", icon: Film },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/tmdb-import", label: "TMDB Import", icon: Search },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-background flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded overflow-hidden">
            <img src={logoUrl} alt="Watch Clouds" className="object-cover w-full h-full" />
          </div>
          <span className="font-serif font-bold text-lg tracking-wide text-white">Admin Panel</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => {
          const isActive = location === link.href || (link.href !== "/admin" && location.startsWith(link.href));
          const Icon = link.icon;
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-white/60 hover:text-destructive hover:bg-destructive/10 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
