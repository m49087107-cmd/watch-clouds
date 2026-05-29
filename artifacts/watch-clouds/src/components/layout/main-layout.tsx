import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative selection:bg-primary/30">
      <Navbar />
      <main className="flex-1 pt-16 flex flex-col relative z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
