import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Calendar as CalendarIcon,
    Clock,
    Search,
    Filter,
    MoreVertical,
    CheckCircle2,
    XCircle,
    AlertCircle,
    User,
    MapPin
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock Data
const MOCK_APPOINTMENTS = [
    {
        id: '1',
        citizenName: 'Jean Dupont',
        citizenId: 'GAB-123456',
        type: 'Renouvellement Passeport',
        date: '2023-11-28',
        time: '09:00',
        status: 'CONFIRMED', // CONFIRMED, PENDING, CANCELLED, COMPLETED
        location: 'Guichet 3',
        notes: 'Documents complets vérifiés en ligne.'
    },
    {
        id: '2',
        citizenName: 'Marie Nguema',
        citizenId: 'GAB-789012',
        type: 'Légalisation de Documents',
        date: '2023-11-28',
        time: '10:30',
        status: 'COMPLETED',
        location: 'Bureau 12',
        notes: ''
    },
    {
        id: '3',
        citizenName: 'Paul Bongo',
        citizenId: 'GAB-345678',
        type: 'Demande de Visa',
        date: '2023-11-28',
        time: '14:00',
        status: 'PENDING',
        location: 'Guichet 1',
        notes: 'En attente de confirmation du paiement.'
    },
    {
        id: '4',
        citizenName: 'Sophie Mba',
        citizenId: 'GAB-901234',
        type: 'Immatriculation Consulaire',
        date: '2023-11-29',
        time: '09:30',
        status: 'CONFIRMED',
        location: 'Guichet 2',
        notes: ''
    },
    {
        id: '5',
        citizenName: 'Pierre Owona',
        citizenId: 'GAB-567890',
        type: 'État Civil',
        date: '2023-11-29',
        time: '11:00',
        status: 'CANCELLED',
        location: 'Bureau 5',
        notes: 'Annulé par le citoyen.'
    }
];

const STATUS_STYLES = {
    CONFIRMED: { label: 'Confirmé', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
    PENDING: { label: 'En Attente', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    COMPLETED: { label: 'Terminé', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
    CANCELLED: { label: 'Annulé', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

export default function AgentAppointmentsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const filteredAppointments = MOCK_APPOINTMENTS.filter(app => {
        const matchesSearch = app.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.citizenId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter ? app.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Gestion des Rendez-vous</h1>
                        <p className="text-muted-foreground">
                            Visualisez et gérez les rendez-vous consulaires.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button className="neu-raised gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            Vue Calendrier
                        </Button>
                        <Button className="neu-raised bg-primary text-primary-foreground hover:shadow-neo-md border-none gap-2">
                            <Clock className="w-4 h-4" />
                            Nouveau RDV
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="neu-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Rechercher un citoyen (Nom, ID)..."
                            className="pl-9 bg-transparent border-none shadow-none focus-visible:ring-0"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`rounded-full ${statusFilter === null ? 'bg-primary/10 text-primary font-bold' : ''}`}
                            onClick={() => setStatusFilter(null)}
                        >
                            Tous
                        </Button>
                        {Object.entries(STATUS_STYLES).map(([key, style]) => (
                            <Button
                                key={key}
                                variant="ghost"
                                size="sm"
                                className={`rounded-full gap-2 ${statusFilter === key ? 'bg-muted font-bold' : ''}`}
                                onClick={() => setStatusFilter(key)}
                            >
                                <div className={`w-2 h-2 rounded-full ${style.color.split(' ')[0].replace('bg-', 'bg-')}`} />
                                {style.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Appointments List */}
                <div className="grid gap-4">
                    {filteredAppointments.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Aucun rendez-vous trouvé.
                        </div>
                    ) : (
                        filteredAppointments.map((app) => {
                            const StatusIcon = STATUS_STYLES[app.status as keyof typeof STATUS_STYLES].icon;
                            return (
                                <div key={app.id} className="neu-raised p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group hover:shadow-neo-lg transition-all">
                                    {/* Time & Date */}
                                    <div className="flex md:flex-col items-center md:items-start gap-2 md:gap-0 min-w-[100px] border-r md:border-r-0 border-border pr-4 md:pr-0">
                                        <span className="text-xl font-bold text-primary">{app.time}</span>
                                        <span className="text-sm text-muted-foreground font-medium">{new Date(app.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                    </div>

                                    {/* Citizen Info */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {app.citizenName.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-bold text-lg leading-none mb-1">{app.citizenName}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span className="bg-muted px-1.5 py-0.5 rounded text-xs font-medium">{app.citizenId}</span>
                                                <span>•</span>
                                                <span>{app.type}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location & Status */}
                                    <div className="flex flex-col md:items-end gap-1 min-w-[150px]">
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {app.location}
                                        </div>
                                        <Badge variant="outline" className={`${STATUS_STYLES[app.status as keyof typeof STATUS_STYLES].color} gap-1`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {STATUS_STYLES[app.status as keyof typeof STATUS_STYLES].label}
                                        </Badge>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0">
                                        <Button variant="ghost" size="sm" className="hidden md:flex">Détails</Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>Voir le dossier</DropdownMenuItem>
                                                <DropdownMenuItem>Modifier le statut</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Annuler le RDV</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
