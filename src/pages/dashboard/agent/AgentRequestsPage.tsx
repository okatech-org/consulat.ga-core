import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    FileText, Search, Clock, CheckCircle2, XCircle,
    AlertCircle, Eye, Play, CheckCheck, Filter,
    Calendar, User, Phone, Mail, Paperclip
} from "lucide-react";
import { MOCK_REQUESTS } from "@/data/mock-requests";
import { Request, RequestStatus, RequestType, RequestPriority } from "@/types/request";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function AgentRequestsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [activeTab, setActiveTab] = useState<string>("all");

    const getStatusBadge = (status: RequestStatus) => {
        const config = {
            [RequestStatus.PENDING]: { variant: "outline" as const, className: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
            [RequestStatus.IN_PROGRESS]: { variant: "outline" as const, className: "bg-blue-50 text-blue-700 border-blue-200", icon: Play },
            [RequestStatus.AWAITING_DOCUMENTS]: { variant: "outline" as const, className: "bg-orange-50 text-orange-700 border-orange-200", icon: AlertCircle },
            [RequestStatus.VALIDATED]: { variant: "outline" as const, className: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle2 },
            [RequestStatus.REJECTED]: { variant: "outline" as const, className: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
            [RequestStatus.COMPLETED]: { variant: "outline" as const, className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCheck }
        };

        const { className, icon: Icon } = config[status];
        return (
            <Badge className={`${className} gap-1 font-medium`}>
                <Icon className="w-3 h-3" />
                {status.replace(/_/g, ' ')}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: RequestPriority) => {
        const colors = {
            [RequestPriority.LOW]: "bg-gray-100 text-gray-600",
            [RequestPriority.NORMAL]: "bg-blue-100 text-blue-600",
            [RequestPriority.HIGH]: "bg-orange-100 text-orange-600",
            [RequestPriority.URGENT]: "bg-red-100 text-red-600"
        };
        return <Badge variant="secondary" className={colors[priority]}>{priority}</Badge>;
    };

    const getTypeBadge = (type: RequestType) => {
        return <Badge variant="outline" className="text-xs">{type.replace(/_/g, ' ')}</Badge>;
    };

    const filteredRequests = MOCK_REQUESTS.filter(request => {
        // Search filter
        const matchesSearch = request.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.subject.toLowerCase().includes(searchTerm.toLowerCase());

        // Type filter
        const matchesType = filterType === "all" || request.type === filterType;

        // Status filter
        const matchesStatus = filterStatus === "all" || request.status === filterStatus;

        // Tab filter
        const matchesTab = activeTab === "all" ||
            (activeTab === "pending" && request.status === RequestStatus.PENDING) ||
            (activeTab === "in-progress" && request.status === RequestStatus.IN_PROGRESS) ||
            (activeTab === "completed" && (request.status === RequestStatus.COMPLETED || request.status === RequestStatus.VALIDATED));

        return matchesSearch && matchesType && matchesStatus && matchesTab;
    });

    const stats = {
        total: MOCK_REQUESTS.length,
        pending: MOCK_REQUESTS.filter(r => r.status === RequestStatus.PENDING).length,
        inProgress: MOCK_REQUESTS.filter(r => r.status === RequestStatus.IN_PROGRESS).length,
        completed: MOCK_REQUESTS.filter(r => r.status === RequestStatus.COMPLETED || r.status === RequestStatus.VALIDATED).length
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Demandes de Services</h1>
                    <p className="text-muted-foreground">Gérez les demandes des citoyens et suivez leur progression</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="neu-raised">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <FileText className="w-8 h-8 text-primary opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="neu-raised">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">En attente</p>
                                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                </div>
                                <Clock className="w-8 h-8 text-yellow-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="neu-raised">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">En cours</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                                </div>
                                <Play className="w-8 h-8 text-blue-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="neu-raised">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Terminées</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                                </div>
                                <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="neu-raised">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Search className="w-3 h-3" />
                                    Recherche
                                </Label>
                                <Input
                                    placeholder="Nom, ID, sujet..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="neu-inset"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Filter className="w-3 h-3" />
                                    Type de service
                                </Label>
                                <Select value={filterType} onValueChange={setFilterType}>
                                    <SelectTrigger className="neu-inset">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les types</SelectItem>
                                        {Object.values(RequestType).map(type => (
                                            <SelectItem key={type} value={type}>{type.replace(/_/g, ' ')}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Filter className="w-3 h-3" />
                                    Statut
                                </Label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="neu-inset">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les statuts</SelectItem>
                                        {Object.values(RequestStatus).map(status => (
                                            <SelectItem key={status} value={status}>{status.replace(/_/g, ' ')}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    className="w-full neu-raised"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setFilterType("all");
                                        setFilterStatus("all");
                                    }}
                                >
                                    Réinitialiser
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs and Request List */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="neu-inset mb-4">
                        <TabsTrigger value="all">Toutes ({MOCK_REQUESTS.length})</TabsTrigger>
                        <TabsTrigger value="pending">En attente ({stats.pending})</TabsTrigger>
                        <TabsTrigger value="in-progress">En cours ({stats.inProgress})</TabsTrigger>
                        <TabsTrigger value="completed">Terminées ({stats.completed})</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="space-y-4">
                        {filteredRequests.length === 0 ? (
                            <Card className="neu-raised">
                                <CardContent className="p-12 text-center">
                                    <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                    <h3 className="text-lg font-semibold mb-2">Aucune demande trouvée</h3>
                                    <p className="text-sm text-muted-foreground">Essayez de modifier vos filtres de recherche</p>
                                </CardContent>
                            </Card>
                        ) : (
                            filteredRequests.map((request) => (
                                <Card key={request.id} className="neu-raised hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                            <div className="flex-1 space-y-3">
                                                {/* Header */}
                                                <div className="flex items-start gap-3">
                                                    <div className="neu-inset w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <FileText className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <span className="font-mono text-xs text-muted-foreground">{request.id}</span>
                                                            {getStatusBadge(request.status)}
                                                            {getPriorityBadge(request.priority)}
                                                            {getTypeBadge(request.type)}
                                                        </div>
                                                        <h3 className="font-semibold text-lg">{request.subject}</h3>
                                                        <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <User className="w-4 h-4 text-muted-foreground" />
                                                        <span className="font-medium">{request.citizenName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="w-4 h-4" />
                                                        <span className="truncate">{request.citizenEmail}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{formatDistanceToNow(request.createdAt, { addSuffix: true, locale: fr })}</span>
                                                    </div>
                                                </div>

                                                {request.assignedToName && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Badge variant="secondary" className="gap-1">
                                                            <User className="w-3 h-3" />
                                                            Assigné à: {request.assignedToName}
                                                        </Badge>
                                                    </div>
                                                )}

                                                {request.attachedDocuments.length > 0 && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Paperclip className="w-4 h-4" />
                                                        <span>{request.attachedDocuments.length} document(s) joint(s)</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex md:flex-col gap-2">
                                                <Button variant="outline" size="sm" className="neu-raised flex-1 md:flex-none">
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Voir
                                                </Button>
                                                {request.status === RequestStatus.PENDING && (
                                                    <Button size="sm" className="neu-raised flex-1 md:flex-none">
                                                        <Play className="w-4 h-4 mr-2" />
                                                        Traiter
                                                    </Button>
                                                )}
                                                {request.status === RequestStatus.IN_PROGRESS && (
                                                    <Button size="sm" className="neu-raised flex-1 md:flex-none">
                                                        <CheckCheck className="w-4 h-4 mr-2" />
                                                        Valider
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
