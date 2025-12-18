import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HubHero } from "@/components/hub/HubHero";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileCheck, ArrowRight, CheckCircle2, Users, Globe } from "lucide-react";

import iconPassport from "@/assets/icons/icon-passport.png";
import iconVisa from "@/assets/icons/icon-visa.png";
import iconConsularCard from "@/assets/icons/icon-consular-card.png";
import iconLegalization from "@/assets/icons/icon-legalization.png";
import heroConsulat from "@/assets/hero-consulat.jpg";

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

interface ConsularService {
  id: string;
  title: string;
  description: string;
  icon: string;
  price: string;
  processingTime: string;
  requirements: string[];
  path: string;
  category: "gabonais" | "visiteur" | "tous";
  popular?: boolean;
}

const consularServices: ConsularService[] = [
  {
    id: "passport",
    title: "Passeport Biométrique",
    description: "Demande de passeport biométrique gabonais pour les citoyens résidant à l'étranger. Validité de 5 ou 10 ans selon l'âge.",
    icon: iconPassport,
    price: "75 000 FCFA",
    processingTime: "4-6 semaines",
    requirements: [
      "Carte d'identité gabonaise ou acte de naissance",
      "Justificatif de domicile",
      "2 photos d'identité biométriques",
      "Ancien passeport (si renouvellement)"
    ],
    path: "/services/passeport",
    category: "gabonais",
    popular: true
  },
  {
    id: "visa",
    title: "Visa pour le Gabon",
    description: "Visa d'entrée au Gabon pour les ressortissants étrangers. Plusieurs types disponibles : tourisme, affaires, travail.",
    icon: iconVisa,
    price: "À partir de 70 €",
    processingTime: "5-10 jours",
    requirements: [
      "Passeport valide 6 mois minimum",
      "Formulaire de demande complété",
      "Photo d'identité récente",
      "Justificatif d'hébergement",
      "Billet d'avion aller-retour"
    ],
    path: "/services/visa",
    category: "visiteur",
    popular: true
  },
  {
    id: "consular-card",
    title: "Carte Consulaire",
    description: "Inscription au registre des Gabonais de l'étranger et obtention de la carte consulaire. Obligatoire pour tous les ressortissants.",
    icon: iconConsularCard,
    price: "25 000 FCFA",
    processingTime: "2-3 semaines",
    requirements: [
      "Pièce d'identité gabonaise",
      "Justificatif de domicile à l'étranger",
      "2 photos d'identité",
      "Formulaire d'inscription"
    ],
    path: "/services/carte-consulaire",
    category: "gabonais"
  },
  {
    id: "legalization",
    title: "Légalisation de Documents",
    description: "Authentification et légalisation de documents officiels pour usage au Gabon ou à l'étranger.",
    icon: iconLegalization,
    price: "15 000 FCFA / document",
    processingTime: "3-5 jours",
    requirements: [
      "Document original à légaliser",
      "Copie du document",
      "Pièce d'identité du demandeur"
    ],
    path: "/services/legalisation",
    category: "tous"
  }
];

export default function ServicesConsulaires() {
  const navigate = useNavigate();

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "gabonais":
        return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">Gabonais</Badge>;
      case "visiteur":
        return <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20">Visiteurs</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">Tous</Badge>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <HubHero
          title="Services Consulaires"
          subtitle="Découvrez l'ensemble des services proposés par les représentations diplomatiques du Gabon à l'étranger."
          backgroundImage={heroConsulat}
          ctaText="Prendre rendez-vous"
          onCtaClick={() => navigate('/login')}
        />

        {/* Stats Section */}
        <section className="py-12 bg-muted/30 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: FileCheck, value: "4", label: "Services principaux" },
                { icon: Clock, value: "24/7", label: "Disponibilité en ligne" },
                { icon: Users, value: "150k+", label: "Citoyens servis" },
                { icon: Globe, value: "30+", label: "Représentations" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sélectionnez un service pour découvrir les détails, les documents requis et commencer votre démarche.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {consularServices.map((service) => (
              <motion.div key={service.id} variants={itemVariants}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 hover:border-primary/50 group overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300">
                        <img src={service.icon} alt={service.title} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getCategoryBadge(service.category)}
                        {service.popular && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            Populaire
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Pricing & Time */}
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-primary">{service.price}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {service.processingTime}
                      </div>
                    </div>

                    {/* Requirements */}
                    <div>
                      <p className="text-sm font-medium mb-2">Documents requis :</p>
                      <ul className="space-y-1.5">
                        {service.requirements.slice(0, 3).map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                        {service.requirements.length > 3 && (
                          <li className="text-sm text-muted-foreground pl-6">
                            + {service.requirements.length - 3} autres documents
                          </li>
                        )}
                      </ul>
                    </div>

                    <Button
                      className="w-full group/btn"
                      onClick={() => navigate(service.path)}
                    >
                      Commencer la démarche
                      <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Besoin d'aide pour vos démarches ?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Notre assistant virtuel IASTED est disponible 24h/24 pour répondre à toutes vos questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate('/login')}>
                  Créer un compte
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/hub/information')}>
                  Guide des démarches
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
