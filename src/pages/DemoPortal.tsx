import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SimulationBanner } from "@/components/SimulationBanner";
import { DemoUserCard } from "@/components/DemoUserCard";
import { MOCK_USERS } from "@/data/mock-users";
import { TestTube2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DemoPortal() {

  return (
    <div className="min-h-screen flex flex-col">
      <SimulationBanner />
      <Header />

      <main className="flex-1 py-12 bg-gradient-official">
        <div className="container">
          <div className="mb-8 animate-fade-in">
            <Alert className="bg-accent/10 border-accent max-w-3xl mx-auto">
              <TestTube2 className="h-5 w-5" />
              <AlertTitle className="text-lg font-semibold">
                Portail de Démonstration Multi-Entités
              </AlertTitle>
              <AlertDescription>
                Sélectionnez un persona pour simuler l'expérience utilisateur selon le rôle ET l'entité consulaire. 
                Observez comment les services disponibles varient selon la juridiction (France sans Passeport, USA complet, etc.).
              </AlertDescription>
            </Alert>
          </div>

          <div className="text-center mb-12 animate-slide-up">
            <h1 className="text-4xl font-bold mb-4">Centre de Commande Démo</h1>
            <p className="text-muted-foreground text-lg">
              Visualisez la logique multi-tenants et les services modulaires par entité
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {MOCK_USERS.map((user, index) => (
              <div
                key={user.id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <DemoUserCard user={user} />
              </div>
            ))}
          </div>

          <div className="mt-12 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Les simulations n'affectent pas les données de production et sont réinitialisées à chaque session
            </p>
            <p className="text-xs text-muted-foreground">
              💡 Astuce : Comparez "Manager France" (sans Passeport) vs "Manager USA" (service complet) pour voir la modularité
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
