import { Link } from "wouter";
import logoUrl from "@assets/IMG-20260522-WA0002_1780067697586.jpg";
import { Github, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background pt-16 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <div className="relative w-8 h-8 rounded overflow-hidden">
                <img src={logoUrl} alt="Watch Clouds" className="object-cover w-full h-full" />
              </div>
              <span className="font-serif font-bold text-xl tracking-wide text-white">Watch Clouds</span>
            </Link>
            <p className="text-white/50 text-sm max-w-sm leading-relaxed">
              Your private cinema lobby. Discover, track, and immerse yourself in the world of movies, web series, and anime.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-primary/20 hover:text-primary transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-primary/20 hover:text-primary transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-primary/20 hover:text-primary transition-all duration-300">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Discover</h4>
            <ul className="space-y-2">
              <li><Link href="/browse" className="text-sm text-white/50 hover:text-primary transition-colors">Browse Library</Link></li>
              <li><Link href="/browse?type=movie" className="text-sm text-white/50 hover:text-primary transition-colors">Movies</Link></li>
              <li><Link href="/browse?type=webseries" className="text-sm text-white/50 hover:text-primary transition-colors">TV Series</Link></li>
              <li><Link href="/browse?type=anime" className="text-sm text-white/50 hover:text-primary transition-colors">Anime</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Account</h4>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-sm text-white/50 hover:text-primary transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="text-sm text-white/50 hover:text-primary transition-colors">Create Account</Link></li>
              <li><Link href="/watchlist" className="text-sm text-white/50 hover:text-primary transition-colors">Watchlist</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Watch Clouds. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-white/30 hover:text-white/70 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-white/30 hover:text-white/70 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
