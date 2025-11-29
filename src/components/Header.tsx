import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, Globe, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/contexts/DemoContext";
import { COUNTRY_FLAGS } from "@/types/entity";
import { GlobalSettings } from "@/components/GlobalSettings";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, currentEntity, isSimulating } = useDemo();

  return (
    <header className={`sticky z - 50 w - full border - b border - border / 40 bg - background / 95 backdrop - blur supports - [backdrop - filter]: bg - background / 60 ${isSimulating ? 'top-[60px]' : 'top-0'} `}>
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-hero">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight">Consulat.ga</span>
            <span className="text-xs text-muted-foreground">
              {isSimulating && currentEntity ? (
                <span className="flex items-center gap-1">
                  {COUNTRY_FLAGS[currentEntity.countryCode]} {currentEntity.city}
                </span>
              ) : (
                'République Gabonaise'
              )}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            <Globe className="h-4 w-4" />
            Réseau Mondial
          </Link>
          <Link to="/actualites" className="text-sm font-medium hover:text-primary transition-colors">
            Actualités
          </Link>
          <Link to="/demo-portal" className="text-sm font-medium hover:text-primary transition-colors">
            Portail Démo
          </Link>
          <Link to="/iboite" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            Messagerie
          </Link>
          {isSimulating && currentUser?.role === "ADMIN" && (
            <Link to="/iboite">
              <Button variant="ghost" size="icon" className="relative">
                <MessageSquare className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              </Button>
            </Link>
          )}
          {isSimulating && currentUser && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-sm">
              <span>{currentUser.badge}</span>
              <span className="font-medium">{currentUser.role}</span>
            </div>
          )}
          <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
            <Button variant="outline">Se Connecter</Button>
          </Link>
          <GlobalSettings />
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
            {isSimulating && currentUser && (
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg text-sm">
                <span>{currentUser.badge}</span>
                <span className="font-medium">{currentUser.role}</span>
                {currentEntity && (
                  <span className="text-xs text-muted-foreground">
                    - {COUNTRY_FLAGS[currentEntity.countryCode]} {currentEntity.city}
                  </span>
                )}
              </div>
            )}
            <Link
              to="/"
              className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Globe className="h-4 w-4" />
              Réseau Mondial
            </Link>
            <Link
              to="/actualites"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Actualités
            </Link>
            <Link
              to="/demo-portal"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Portail Démo
            </Link>
            {isSimulating && currentUser?.role === "ADMIN" && (
              <Link
                to="/admin"
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield className="h-4 w-4" />
                Dashboard Admin
              </Link>
            )}
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">
                Se Connecter
              </Button>
            </Link>
            <div className="flex justify-center pt-4 border-t border-border/40">
              <GlobalSettings />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
