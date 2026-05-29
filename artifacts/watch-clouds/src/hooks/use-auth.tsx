import { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, setAuthTokenGetter } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("wc_token");
  });
  const [isInitializing, setIsInitializing] = useState(true);

  // Configure custom-fetch to use our token
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem("wc_token"));
  }, []);

  const { data: user, isLoading: isUserLoading, refetch } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: ["me", token],
    },
  });

  useEffect(() => {
    if (!token) {
      setIsInitializing(false);
    } else if (!isUserLoading) {
      setIsInitializing(false);
    }
  }, [token, isUserLoading]);

  const login = (newToken: string) => {
    localStorage.setItem("wc_token", newToken);
    setToken(newToken);
    refetch();
  };

  const logout = () => {
    localStorage.removeItem("wc_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        token,
        isLoading: isInitializing,
        isAdmin: user?.role === "admin",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
