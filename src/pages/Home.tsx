import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BookKey, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { InteractiveWorldMap } from "@/components/InteractiveWorldMap";

export default function Home() {
  const { t } = useTranslation();
  
  const services = [
    {
      icon: FileText,
      title: t('home.services.visa.title'),
      description: t('home.services.visa.description'),
      color: "text-gabon-green",
    },
    {
      icon: BookKey,
      title: t('home.services.passport.title'),
      description: t('home.services.passport.description'),
      color: "text-gabon-blue",
    },
    {
      icon: Users,
      title: t('home.services.civilRegistry.title'),
      description: t('home.services.civilRegistry.description'),
      color: "text-gabon-yellow",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" variant="default" className="w-full sm:w-auto">
                  {t('common.login')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/actualites">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  {t('header.news')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Carte Interactive */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <InteractiveWorldMap />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-official">
        <div className="container">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('home.services.title')}</h2>
            <p className="text-muted-foreground text-lg">
              {t('home.hero.description')}
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
                    {t('home.features.online.description')}
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
          <h2 className="text-3xl font-bold mb-4">{t('home.features.title')}</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('home.hero.description')}
          </p>
          <Button size="lg" variant="default">
            {t('header.messaging')}
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
