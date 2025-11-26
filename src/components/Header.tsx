import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-hero">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight">Consulat.ga</span>
            <span className="text-xs text-muted-foreground">République Gabonaise</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Accueil
          </Link>
          <Link to="/actualites" className="text-sm font-medium hover:text-primary transition-colors">
            Actualités
          </Link>
          <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
            <Button variant="outline">Se Connecter</Button>
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <nav className="container py-4 flex flex-col gap-4">
            <Link
              to="/"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              to="/actualites"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Actualités
            </Link>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Se Connecter
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
