import { Switch, Route } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { Home } from "@/pages/Home";
import { Toaster } from "@/components/ui/toaster";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-bold">QuantumFlip</span>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-2">
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>
      <main className="container py-6">
        <Switch>
          <Route path="/" component={Home} />
        </Switch>
      </main>
      <Toaster />
    </div>
  );
} 