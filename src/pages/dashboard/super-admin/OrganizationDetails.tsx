import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Building2, MapPin, Globe, Phone, Mail, ArrowLeft,
    Save, Users, CreditCard, FileText, Settings, Activity
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { MOCK_ENTITIES } from "@/data/mock-entities";
import { COUNTRY_FLAGS, Entity } from "@/types/entity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "lucide-react";

export default function OrganizationDetails() {
    const { entityId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [entity, setEntity] = useState<Entity | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch
        const found = MOCK_ENTITIES.find(e => e.id === entityId);
        if (found) {
            // Enrich with mock details if missing
            const enriched: Entity = {
                ...found,
                address: found.address || "123 Avenue Diplomatique",
                coordinates: found.coordinates || { lat: 48.8566, lng: 2.3522 },
                contact: found.contact || {
                    phone: "+33 1 23 45 67 89",
                    email: `contact@${found.id.toLowerCase()}.ga`,
                    website: `www.ambassade-gabon-${found.countryCode.toLowerCase()}.ga`
                },
                bankDetails: found.bankDetails || {
                    bankName: "Banque Centrale",
                    accountNumber: "GA76 1234 5678 9012",
                    iban: "GA76 1234 5678 9012 3456 78",
                    swift: "GABOGALB",
                    currency: "XAF"
                },
                openingHours: found.openingHours || {
                    mon: { start: "09:00", end: "17:00", isClosed: false },
                    tue: { start: "09:00", end: "17:00", isClosed: false },
                    wed: { start: "09:00", end: "17:00", isClosed: false },
                    thu: { start: "09:00", end: "17:00", isClosed: false },
                    fri: { start: "09:00", end: "16:00", isClosed: false },
                    sat: { start: "00:00", end: "00:00", isClosed: true },
                    sun: { start: "00:00", end: "00:00", isClosed: true },
                }
            };
            setEntity(enriched);
        }
        setLoading(false);
    }, [entityId]);

    const handleSave = () => {
        toast({
            title: "Modifications enregistrées",
            description: "Les informations de l'organisation ont été mises à jour.",
        });
    };

    if (loading) return <DashboardLayout><div>Chargement...</div></DashboardLayout>;
    if (!entity) return <DashboardLayout><div>Organisation introuvable</div></DashboardLayout>;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/super-admin/organizations')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">{COUNTRY_FLAGS[entity.countryCode]}</span>
                            <h1 className="text-2xl font-bold text-foreground">{entity.name}</h1>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${entity.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'
                                }`}>
                                {entity.isActive ? 'Actif' : 'Inactif'}
                            </span>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4" /> {entity.city}, {entity.country}
                        </p>
                    </div>
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="w-4 h-4" />
                        Enregistrer
                    </Button>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl mb-6 overflow-x-auto">
                        <TabsTrigger value="general" className="gap-2 px-4 py-2">
                            <Building2 className="w-4 h-4" /> Général
                        </TabsTrigger>
                        <TabsTrigger value="services" className="gap-2 px-4 py-2">
                            <FileText className="w-4 h-4" /> Services
                        </TabsTrigger>
                        <TabsTrigger value="users" className="gap-2 px-4 py-2">
                            <Users className="w-4 h-4" /> Personnel
                        </TabsTrigger>
                        <TabsTrigger value="finance" className="gap-2 px-4 py-2">
                            <CreditCard className="w-4 h-4" /> Finances
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="gap-2 px-4 py-2">
                            <Activity className="w-4 h-4" /> Activité
                        </TabsTrigger>
                    </TabsList>

                    {/* GENERAL TAB */}
                    <TabsContent value="general" className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Identity Card */}
                            <div className="neu-raised p-6 rounded-xl space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    Identité
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Nom de l'entité</Label>
                                        <Input defaultValue={entity.name} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Type</Label>
                                            <Input defaultValue={entity.type} disabled />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Code Pays</Label>
                                            <Input defaultValue={entity.countryCode} disabled />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Card */}
                            <div className="neu-raised p-6 rounded-xl space-y-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-primary" />
                                    Contact
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Téléphone</Label>
                                        <Input defaultValue={entity.contact?.phone} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email Officiel</Label>
                                        <Input defaultValue={entity.contact?.email} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Site Web</Label>
                                        <Input defaultValue={entity.contact?.website} />
                                    </div>
                                </div>
                            </div>

                            {/* Location Card */}
                            <div className="neu-raised p-6 rounded-xl space-y-4 md:col-span-2">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    Localisation
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Adresse Physique</Label>
                                            <Input defaultValue={entity.address} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Ville</Label>
                                                <Input defaultValue={entity.city} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Pays</Label>
                                                <Input defaultValue={entity.country} />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Mock Map Placeholder */}
                                    <div className="bg-muted/30 rounded-lg border-2 border-dashed border-muted flex items-center justify-center min-h-[150px]">
                                        <div className="text-center text-muted-foreground">
                                            <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">Carte Interactive</p>
                                            <p className="text-xs">Lat: {entity.coordinates?.lat}, Lng: {entity.coordinates?.lng}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Opening Hours Card */}
                            <div className="neu-raised p-6 rounded-xl space-y-4 md:col-span-2">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />
                                    Horaires d'Ouverture
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day, index) => {
                                        const dayKey = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][index];
                                        const schedule = entity.openingHours?.[dayKey] || { start: "09:00", end: "17:00", isClosed: index > 4 };

                                        return (
                                            <div key={day} className="p-3 rounded-lg border border-border bg-card/50 flex flex-col gap-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-sm">{day}</span>
                                                    <Switch defaultChecked={!schedule.isClosed} />
                                                </div>
                                                <div className={`grid grid-cols-2 gap-2 ${schedule.isClosed ? 'opacity-50 pointer-events-none' : ''}`}>
                                                    <Input type="time" defaultValue={schedule.start} className="h-8 text-xs" />
                                                    <Input type="time" defaultValue={schedule.end} className="h-8 text-xs" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* SERVICES TAB */}
                    <TabsContent value="services">
                        <div className="neu-raised p-6 rounded-xl">
                            <h3 className="font-bold text-lg mb-6">Configuration des Services</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {['PASSPORT', 'VISA', 'ETAT_CIVIL', 'LEGALISATION'].map((service) => (
                                    <div key={service} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-primary/10 text-primary">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{service}</p>
                                                <p className="text-xs text-muted-foreground">Service consulaire standard</p>
                                            </div>
                                        </div>
                                        <Switch defaultChecked={entity.enabledServices.includes(service)} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* USERS TAB */}
                    <TabsContent value="users">
                        <div className="neu-raised p-6 rounded-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg">Personnel Rattaché</h3>
                                <Button size="sm" variant="outline"><Settings className="w-4 h-4 mr-2" /> Gérer les Rôles</Button>
                            </div>
                            <div className="space-y-4">
                                {/* Mock User List */}
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border-b border-border last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold">
                                                {['JD', 'AB', 'CM'][i - 1]}
                                            </div>
                                            <div>
                                                <p className="font-medium">{['Jean Dupont', 'Alice Bernard', 'Charles Martin'][i - 1]}</p>
                                                <p className="text-xs text-muted-foreground">{['Consul Général', 'Agent Consulaire', 'Secrétaire'][i - 1]}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Actif</span>

                                            {/* Planning Dialog */}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        Planning
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-3xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Planning Hebdomadaire - {['Jean Dupont', 'Alice Bernard', 'Charles Martin'][i - 1]}</DialogTitle>
                                                        <DialogDescription>Gérez les horaires de travail et les congés de cet agent.</DialogDescription>
                                                    </DialogHeader>

                                                    <div className="grid grid-cols-7 gap-2 mt-4">
                                                        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, dIndex) => (
                                                            <div key={day} className={`p-2 rounded-lg border text-center ${dIndex > 4 ? 'bg-muted/50' : 'bg-card'}`}>
                                                                <p className="font-bold text-sm mb-2">{day}</p>
                                                                <div className="space-y-2">
                                                                    {dIndex > 4 ? (
                                                                        <span className="text-xs text-muted-foreground italic">Repos</span>
                                                                    ) : (
                                                                        <>
                                                                            <div className="bg-primary/10 text-primary text-xs p-1 rounded">
                                                                                09:00 - 12:00
                                                                            </div>
                                                                            <div className="bg-primary/10 text-primary text-xs p-1 rounded">
                                                                                14:00 - 17:00
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-end mt-4">
                                                        <Button>Sauvegarder le Planning</Button>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>

                                            <Button variant="ghost" size="sm">Éditer</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* FINANCE TAB */}
                    <TabsContent value="finance">
                        <div className="neu-raised p-6 rounded-xl space-y-6">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary" />
                                Informations Bancaires
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Nom de la Banque</Label>
                                    <Input defaultValue={entity.bankDetails?.bankName} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Devise</Label>
                                    <Input defaultValue={entity.bankDetails?.currency} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>IBAN</Label>
                                    <Input defaultValue={entity.bankDetails?.iban} className="font-mono" />
                                </div>
                                <div className="space-y-2">
                                    <Label>BIC/SWIFT</Label>
                                    <Input defaultValue={entity.bankDetails?.swift} className="font-mono" />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* ACTIVITY TAB */}
                    <TabsContent value="activity">
                        <div className="neu-raised p-6 rounded-xl">
                            <h3 className="font-bold text-lg mb-4">Journal d'Activité</h3>
                            <div className="space-y-6">
                                {[
                                    { action: "Mise à jour des horaires", user: "Jean Dupont", time: "Il y a 2h" },
                                    { action: "Activation service Visa", user: "Admin Système", time: "Il y a 1j" },
                                    { action: "Modification adresse", user: "Alice Bernard", time: "Il y a 3j" },
                                ].map((log, i) => (
                                    <div key={i} className="flex gap-4 relative pl-6 border-l border-border pb-6 last:pb-0">
                                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-primary" />
                                        <div>
                                            <p className="font-medium text-sm">{log.action}</p>
                                            <p className="text-xs text-muted-foreground">{log.user} • {log.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
