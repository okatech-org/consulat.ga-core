import { FileText, Settings, CheckCircle2, AlertCircle } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { SERVICE_CATALOG, ServiceInfo } from "@/types/services";
import { useState } from "react";
import { ServiceDialog } from "@/components/super-admin/ServiceDialog";
import { useToast } from "@/components/ui/use-toast";

export default function SuperAdminServices() {
    const { toast } = useToast();
    const services = Object.values(SERVICE_CATALOG);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedService, setSelectedService] = useState<ServiceInfo | null>(null);

    const handleConfigure = (service: ServiceInfo) => {
        setSelectedService(service);
        setIsDialogOpen(true);
    };

    const handleSave = async (data: Partial<ServiceInfo>) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: "Service mis à jour",
            description: `La configuration de ${selectedService?.name} a été enregistrée.`,
        });
        setIsDialogOpen(false);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Services Consulaires</h1>
                        <p className="text-muted-foreground">
                            Configuration des types de demandes et des procédures
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <div key={service.id} className="neu-raised p-6 rounded-xl flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="neu-inset w-12 h-12 rounded-full flex items-center justify-center text-primary">
                                    <service.icon className="w-6 h-6" />
                                </div>
                                <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Actif
                                </span>
                            </div>

                            <h3 className="font-bold text-lg mb-2">{service.name}</h3>
                            <p className="text-sm text-muted-foreground mb-6 flex-1">
                                {service.description}
                            </p>

                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Délai moyen</span>
                                    <span className="font-bold">72h</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Documents requis</span>
                                    <span className="font-bold">{service.requiredDocuments?.length || 0}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleConfigure(service)}
                                className="mt-6 w-full neu-raised py-2 rounded-lg text-sm font-medium hover:text-primary transition-colors flex items-center justify-center gap-2"
                            >
                                <Settings className="w-4 h-4" />
                                Configurer
                            </button>
                        </div>
                    ))}
                </div>

                <ServiceDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    initialData={selectedService}
                    onSave={handleSave}
                />
            </div>
        </DashboardLayout>
    );
}
