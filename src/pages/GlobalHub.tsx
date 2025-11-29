import { JurisdictionSelector } from "@/components/JurisdictionSelector";
import { WorldMapVisual } from "@/components/WorldMapVisual";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Globe, Newspaper, Shield } from "lucide-react";
import heroImage from "@/assets/hero-consulat.jpg";

export default function GlobalHub() {
  const articles = [
    {
      title: "Nouvelles mesures douanières pour la diaspora",
      category: "Administratif",
      region: "Global",
      date: "15 Nov 2025",
    },
    {
      title: "Événement culturel - Fête Nationale",
      category: "Communauté",
      region: "France",
      date: "12 Nov 2025",
    },
    {
      title: "Mise à jour des procédures consulaires",
      category: "Diplomatie",
      region: "USA",
      date: "10 Nov 2025",
    },
  ];

  return (
    <>
      {/* Hero Section - Hub Global */}
      <section className="relative py-24 bg-gradient-official overflow-hidden">
        <WorldMapVisual />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="flex justify-center mb-4">
              <Globe className="h-16 w-16 text-primary animate-pulse" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              CONSULAT.GA
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground">
              Le portail des Gabonais de l'étranger
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Accédez aux services de votre consulat où que vous soyez dans le monde.
              Une plateforme unique, des services adaptés à votre localisation.
            </p>

            <div className="pt-8">
              <JurisdictionSelector />
            </div>

            <div className="flex gap-4 justify-center pt-4">
              <Button asChild size="lg" variant="outline">
                <Link to="/actualites">
                  <Newspaper className="mr-2 h-5 w-5" />
                  Actualités Diaspora
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/demo-portal">
                  <Shield className="mr-2 h-5 w-5" />
                  Portail Démo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Actualités */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl font-bold mb-4">L'actualité de la communauté</h2>
            <p className="text-muted-foreground">
              Restez informés des dernières nouvelles consulaires et événements
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {articles.map((article, index) => (
              <Card
                key={index}
                className="hover-scale animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                      {article.category}
                    </span>
                    <span className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded">
                      {article.region}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                  <CardDescription>{article.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/actualites">Lire la suite →</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link to="/actualites">Voir toutes les actualités</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section Réseau Mondial */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h2 className="text-3xl font-bold mb-4">Un réseau mondial à votre service</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Ambassades et consulats du Gabon présents sur tous les continents,
              pour accompagner la diaspora gabonaise dans toutes ses démarches administratives.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['🇺🇸 USA', '🇫🇷 France', '🇨🇳 Chine', '🇸🇳 Sénégal'].map((country, i) => (
                <div
                  key={i}
                  className="p-4 bg-background rounded-lg shadow-sm hover-scale"
                >
                  <div className="text-3xl mb-2">{country.split(' ')[0]}</div>
                  <div className="text-sm font-medium">{country.split(' ')[1]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
