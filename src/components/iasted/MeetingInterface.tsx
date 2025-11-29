import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Users, Video, Plus } from 'lucide-react';

export function MeetingInterface() {
    const upcomingMeetings = [
        {
            id: 1,
            title: "Audition Consulaire - Renouvellement",
            date: "Aujourd'hui",
            time: "14:30",
            host: "Consulat Paris",
            status: "upcoming"
        },
        {
            id: 2,
            title: "Assemblée Générale - Assoc. Gabonais",
            date: "15 Déc",
            time: "18:00",
            host: "AGF",
            status: "scheduled"
        }
    ];

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-sm">Mes Réunions</h3>
                <Button size="sm" variant="outline" className="gap-1 h-8 text-xs">
                    <Plus className="w-3 h-3" /> Planifier
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
                {upcomingMeetings.map((meeting) => (
                    <Card key={meeting.id} className="p-3 flex flex-col gap-3 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-medium text-sm">{meeting.title}</h4>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <Users className="w-3 h-3" /> Organisé par {meeting.host}
                                </p>
                            </div>
                            <div className={`px-2 py-0.5 rounded text-[10px] font-medium ${meeting.status === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {meeting.status === 'upcoming' ? 'Bientôt' : 'Prévu'}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-2">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {meeting.date}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {meeting.time}
                            </span>
                        </div>

                        {meeting.status === 'upcoming' && (
                            <Button size="sm" className="w-full mt-1 gap-2 bg-primary/90 hover:bg-primary">
                                <Video className="w-3 h-3" /> Rejoindre la salle
                            </Button>
                        )}
                    </Card>
                ))}

                <div className="p-4 rounded-lg border border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground mt-4">
                    <Calendar className="w-8 h-8 opacity-20" />
                    <p className="text-xs text-center">Aucune autre réunion prévue pour le moment.</p>
                </div>
            </div>
        </div>
    );
}
