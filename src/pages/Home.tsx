import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BookKey, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-consulat.jpg";

export default function Home() {
  const services = [
    {
      icon: FileText,
      title: "Demande de Visa",
      description: "Soumettez votre demande de visa en ligne de manière simple et sécurisée",
      color: "text-gabon-green",
    },
    {
      icon: BookKey,
      title: "Passeport",
      description: "Demandez ou renouvelez votre passeport gabonais depuis notre plateforme",
      color: "text-gabon-blue",
    },
    {
      icon: Users,
      title: "État Civil",
      description: "Obtenez vos documents d'état civil et attestations officielles",
      color: "text-gabon-yellow",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
        <div className="absolute inset-0 opacity-20">
          <img
            src={heroImage}
            alt="Consulat du Gabon"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Bienvenue au Consulat Général
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Vos services consulaires digitalisés
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Se Connecter
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/actualites">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-background/10 hover:bg-background/20 text-primary-foreground border-primary-foreground/30">
                  Actualités
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-official">
        <div className="container">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Services Rapides</h2>
            <p className="text-muted-foreground text-lg">
              Accédez à nos services consulaires en quelques clics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className="group hover:shadow-elevation transition-all duration-300 hover:-translate-y-2 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 ${service.color}`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    En savoir plus
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/50">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Besoin d'assistance ?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Notre équipe consulaire est à votre disposition pour vous accompagner dans vos démarches administratives
          </p>
          <Button size="lg" variant="default">
            Contactez-nous
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
