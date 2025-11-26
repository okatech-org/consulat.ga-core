import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RoleCard } from "@/components/RoleCard";
import { Shield, Users, UserCheck, User, TestTube2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DemoPortal() {
  const roles = [
    {
      role: "ADMIN",
      title: "Admin Système",
      description: "Super administrateur avec accès total au système",
      permissions: [
        "Accès total au système",
        "Gestion des licences",
        "Configuration IA et sécurité",
        "Consultation des logs système",
        "Gestion des utilisateurs",
      ],
      icon: Shield,
      colorClass: "border-l-4 border-l-role-admin",
      badgeColor: "bg-role-admin",
    },
    {
      role: "MANAGER",
      title: "Manager Consulaire",
      description: "Consul ou responsable avec droits de supervision",
      permissions: [
        "Supervision de l'équipe",
        "Validation finale des dossiers",
        "Statistiques et rapports",
        "Gestion des priorités",
        "Configuration des workflows",
      ],
      icon: Users,
      colorClass: "border-l-4 border-l-role-manager",
      badgeColor: "bg-role-manager",
    },
    {
      role: "AGENT",
      title: "Agent Consulaire",
      description: "Agent de traitement avec accès au guichet",
      permissions: [
        "Traitement des dossiers",
        "Gestion du guichet virtuel",
        "Chat interne avec équipe",
        "Validation des documents",
        "Suivi des demandes",
      ],
      icon: UserCheck,
      colorClass: "border-l-4 border-l-role-agent",
      badgeColor: "bg-role-agent",
    },
    {
      role: "CITIZEN",
      title: "Citoyen",
      description: "Utilisateur standard avec accès aux services",
      permissions: [
        "Mes demandes en cours",
        "Mon profil personnel",
        "Mes rendez-vous",
        "Mes documents",
        "Messagerie consulaire",
      ],
      icon: User,
      colorClass: "border-l-4 border-l-role-citizen",
      badgeColor: "bg-role-citizen",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 bg-gradient-official">
        <div className="container">
          <div className="mb-8 animate-fade-in">
            <Alert className="bg-accent/10 border-accent max-w-3xl mx-auto">
              <TestTube2 className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">
                Portail de Démonstration
              </AlertTitle>
              <AlertDescription>
                Sélectionnez un rôle pour simuler l'expérience utilisateur correspondante. 
                Ce mode permet de tester toutes les fonctionnalités sans affecter les données réelles.
              </AlertDescription>
            </Alert>
          </div>

          <div className="text-center mb-12 animate-slide-up">
            <h1 className="text-4xl font-bold mb-4">Centre de Commande Démo</h1>
            <p className="text-muted-foreground text-lg">
              Visualisez les modifications instantanément selon le rôle sélectionné
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {roles.map((role, index) => (
              <div
                key={role.role}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <RoleCard {...role} />
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Les simulations n'affectent pas les données de production et sont réinitialisées à chaque session
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
