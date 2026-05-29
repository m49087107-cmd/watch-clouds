import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import logoUrl from "@assets/IMG-20260522-WA0002_1780067697586.jpg";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [_, setLocation] = useLocation();
  const { login: authLogin } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(
      { data },
      {
        onSuccess: (res) => {
          authLogin(res.token);
          toast({ description: "Successfully logged in!" });
          if (res.user.role === "admin") {
            setLocation("/admin");
          } else {
            setLocation("/");
          }
        },
        onError: (err: any) => {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: err.message || "Please check your credentials.",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070')] bg-cover bg-center opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />
      
      <div className="w-full max-w-md p-8 md:p-10 rounded-2xl bg-card/40 backdrop-blur-xl border border-white/10 relative z-10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-xl overflow-hidden mb-4 shadow-lg shadow-primary/20">
            <img src={logoUrl} alt="Watch Clouds" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-wide">Welcome Back</h1>
          <p className="text-white/50 text-sm mt-2">Sign in to your private cinema</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="name@example.com" 
                      className="bg-black/50 border-white/10 text-white placeholder:text-white/30 h-12 focus-visible:ring-primary focus-visible:border-primary" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-destructive/80" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      className="bg-black/50 border-white/10 text-white placeholder:text-white/30 h-12 focus-visible:ring-primary focus-visible:border-primary" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-destructive/80" />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 text-base"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center">
          <p className="text-white/50 text-sm">
            New to Watch Clouds?{" "}
            <Link href="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Join now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
