import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SimulationBanner } from "@/components/SimulationBanner";
import { EntityWizard } from "@/components/admin/EntityWizard";
import { EntityCard } from "@/components/admin/EntityCard";
import { WorldMapDashboard } from "@/components/admin/WorldMapDashboard";
import { useDemo } from "@/contexts/DemoContext";
import { MOCK_ENTITIES } from "@/data/mock-entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Shield, AlertTriangle, Globe } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { currentUser } = useDemo();
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(false);

  // Protection : seuls les admins système peuvent accéder
  if (currentUser?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex flex-col">
        <SimulationBanner />
        <Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <Alert className="max-w-md border-destructive">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertTitle>Accès Refusé</AlertTitle>
            <AlertDescription>
              Cette section est réservée aux Administrateurs Système.
              <div className="mt-4">
                <Button onClick={() => navigate("/")} variant="outline">
                  Retour à l'accueil
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  const handleCreateEntity = (data: any) => {
    console.log("Nouvelle entité créée:", data);
    toast.success(
      `Entité "${data.name}" créée avec succès ! Manager: ${data.managerEmail}`
    );
    setShowWizard(false);
  };

  const handleEditEntity = (entity: any) => {
    toast.info(`Configuration de ${entity.name} (fonctionnalité à venir)`);
  };

  const handleDeleteEntity = (entity: any) => {
    toast.error(`Suppression de ${entity.name} (fonctionnalité à venir)`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SimulationBanner />
      <Header />

      <main className="flex-1 py-12 bg-gradient-official">
        <div className="container max-w-7xl">
          {/* Header Section */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-600 rounded-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Dashboard Admin Système</h1>
                  <p className="text-muted-foreground">
                    Gestion du réseau mondial - Vue Dieu
                  </p>
                </div>
              </div>
              <Button onClick={() => setShowWizard(true)} size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Créer une Entité
              </Button>
            </div>

            <Alert className="bg-accent/10 border-accent">
              <Globe className="h-5 w-5" />
              <AlertTitle>Mode Administrateur Actif</AlertTitle>
              <AlertDescription>
                Vous avez accès total au système : création d'entités, configuration des
                services modulaires, gestion des licences et des utilisateurs.
              </AlertDescription>
            </Alert>
          </div>

          {/* Wizard Modal */}
          {showWizard && (
            <div className="mb-12">
              <EntityWizard
                onComplete={handleCreateEntity}
                onCancel={() => setShowWizard(false)}
              />
            </div>
          )}

          {/* World Map Dashboard */}
          {!showWizard && (
            <div className="mb-12 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Réseau Mondial - Vue Cartographique
                  </CardTitle>
                  <CardDescription>
                    {MOCK_ENTITIES.length} représentations consulaires déployées
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WorldMapDashboard />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Entities Grid */}
          {!showWizard && (
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Toutes les Entités</h2>
                <p className="text-sm text-muted-foreground">
                  {MOCK_ENTITIES.length} entité{MOCK_ENTITIES.length > 1 ? "s" : ""}{" "}
                  configurée{MOCK_ENTITIES.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_ENTITIES.map((entity, index) => (
                  <div
                    key={entity.id}
                    className="animate-scale-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <EntityCard
                      entity={entity}
                      onEdit={handleEditEntity}
                      onDelete={handleDeleteEntity}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
