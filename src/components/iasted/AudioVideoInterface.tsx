import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MoreVertical, UserPlus } from 'lucide-react';

interface AudioVideoInterfaceProps {
    mode: 'audio' | 'video';
}

export function AudioVideoInterface({ mode }: AudioVideoInterfaceProps) {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected'>('idle');

    if (callStatus === 'idle') {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-6 bg-muted/10">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <Avatar className="w-20 h-20">
                            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">A</AvatarFallback>
                        </Avatar>
                    </div>
                    <span className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-background rounded-full"></span>
                </div>
                <div className="text-center">
                    <h3 className="font-semibold text-lg">Agent Consulaire</h3>
                    <p className="text-sm text-muted-foreground">Disponible pour un appel {mode === 'video' ? 'vidéo' : 'audio'}</p>
                </div>
                <Button
                    size="lg"
                    className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600 shadow-lg"
                    onClick={() => setCallStatus('calling')}
                >
                    {mode === 'video' ? <Video className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-black/90 relative overflow-hidden rounded-lg">
            {/* Remote Video / Avatar */}
            <div className="flex-1 flex items-center justify-center relative">
                {mode === 'video' && !isVideoOff ? (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <span className="text-white/50">Flux Vidéo Distant (Simulation)</span>
                    </div>
                ) : (
                    <Avatar className="w-32 h-32 border-4 border-white/10">
                        <AvatarFallback className="bg-primary text-primary-foreground text-4xl">A</AvatarFallback>
                    </Avatar>
                )}

                {/* Call Status Overlay */}
                {callStatus === 'calling' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                        <span className="text-white font-medium animate-pulse">Appel en cours...</span>
                    </div>
                )}
            </div>

            {/* Local Video (PIP) */}
            {mode === 'video' && (
                <div className="absolute top-4 right-4 w-24 h-32 bg-slate-700 rounded-lg border border-white/20 overflow-hidden shadow-xl">
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <span className="text-[10px] text-white/50">Moi</span>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="p-6 flex justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent">
                <Button
                    variant={isMuted ? "destructive" : "secondary"}
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={() => setIsMuted(!isMuted)}
                >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>

                {mode === 'video' && (
                    <Button
                        variant={isVideoOff ? "destructive" : "secondary"}
                        size="icon"
                        className="rounded-full w-12 h-12"
                        onClick={() => setIsVideoOff(!isVideoOff)}
                    >
                        {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </Button>
                )}

                <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full w-12 h-12"
                    onClick={() => setCallStatus('idle')}
                >
                    <PhoneOff className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
