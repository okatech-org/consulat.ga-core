import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Mock Data
const MOCK_REQUESTS = [
    {
        id: 'REQ-2024-001',
        type: 'Renouvellement Passeport',
        date: '2024-01-15',
        status: 'IN_PROGRESS',
        updatedAt: '2024-01-20'
    },
    {
        id: 'REQ-2023-089',
        type: 'Légalisation Acte de Naissance',
        date: '2023-11-10',
        status: 'COMPLETED',
        updatedAt: '2023-11-12'
    },
    {
        id: 'REQ-2023-050',
        type: 'Visa Long Séjour',
        date: '2023-06-01',
        status: 'REJECTED',
        updatedAt: '2023-06-05'
    }
];

export default function CitizenRequestsPage() {
    const [requests] = useState(MOCK_REQUESTS);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge className="bg-green-500 hover:bg-green-600 gap-1"><CheckCircle className="w-3 h-3" /> Terminé</Badge>;
            case 'IN_PROGRESS':
                return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 gap-1"><Clock className="w-3 h-3" /> En cours</Badge>;
            case 'REJECTED':
                return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Rejeté</Badge>;
            default:
                return <Badge variant="outline" className="gap-1"><AlertCircle className="w-3 h-3" /> Inconnu</Badge>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Mes Demandes</h1>
                    <p className="text-muted-foreground">Suivez l'état de vos démarches administratives.</p>
                </div>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nouvelle Demande
                </Button>
            </div>

            <div className="grid gap-4">
                {requests.map((req) => (
                    <div key={req.id} className="neu-card p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/20 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg text-primary mt-1 md:mt-0">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{req.type}</h3>
                                <div className="text-sm text-muted-foreground flex flex-col md:flex-row gap-1 md:gap-4">
                                    <span>N° {req.id}</span>
                                    <span className="hidden md:inline">•</span>
                                    <span>Déposée le {req.date}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                            {getStatusBadge(req.status)}
                            <span className="text-xs text-muted-foreground">Mis à jour le {req.updatedAt}</span>
                        </div>
                    </div>
                ))}

                {requests.length === 0 && (
                    <div className="text-center py-12 neu-inset rounded-xl">
                        <p className="text-muted-foreground mb-4">Aucune demande en cours.</p>
                        <Button>Créer ma première demande</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
