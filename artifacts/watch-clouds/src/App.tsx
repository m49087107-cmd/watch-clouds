import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";

import Home from "@/pages/home";
import Browse from "@/pages/browse";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Watchlist from "@/pages/watchlist";
import MovieDetail from "@/pages/movie-detail";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminMovies from "@/pages/admin/movies";
import AdminMoviesNew from "@/pages/admin/movies-new";
import AdminUsers from "@/pages/admin/users";
import AdminTmdbImport from "@/pages/admin/tmdb-import";

import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 mins
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/browse" component={Browse} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/watchlist" component={Watchlist} />
      <Route path="/movie/:id" component={MovieDetail} />
      
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/movies" component={AdminMovies} />
      <Route path="/admin/movies/new" component={AdminMoviesNew} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/tmdb-import" component={AdminTmdbImport} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
