import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ component: Component, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation("/login");
      } else if (requireAdmin && !isAdmin) {
        setLocation("/");
      }
    }
  }, [user, isLoading, isAdmin, requireAdmin, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (requireAdmin && !isAdmin)) {
    return null; // Will redirect in useEffect
  }

  return <Component />;
}
