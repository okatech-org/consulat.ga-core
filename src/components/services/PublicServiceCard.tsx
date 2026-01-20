import { ConsularService } from "@/types/services";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Info, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface PublicServiceCardProps {
    service: ConsularService;
    className?: string;
    onRegisterClick?: () => void;
}

export function PublicServiceCard({ service, className, onRegisterClick }: PublicServiceCardProps) {
    return (
        <Card className={cn(
            "group overflow-hidden border border-border/50 shadow-sm bg-card hover:shadow-elevation transition-all duration-300 hover:-translate-y-1",
            className
        )}>
            {/* Image Header */}
            <div className="relative h-48 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent z-10" />
                {service.imageUrl ? (
                    <img
                        src={service.imageUrl}
                        alt={service.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ShieldCheck className="w-16 h-16 text-muted-foreground/20" />
                    </div>
                )}
                <Badge
                    className="absolute top-4 right-4 z-20 shadow-sm backdrop-blur-md bg-background/80 hover:bg-background/90 text-foreground border-0"
                    variant="secondary"
                >
                    {service.category}
                </Badge>
            </div>

            <CardHeader className="pb-2">
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {service.name}
                </h3>
                {service.legalBasis && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground w-fit mt-1">
                        <BookOpen className="w-3 h-3 text-primary flex-shrink-0" />
                        <span className="truncate max-w-[200px]" title={service.legalBasis.title}>
                            {service.legalBasis.reference}
                        </span>
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 min-h-[4.5rem]">
                    {service.description}
                </p>

                {service.assistanceDetails && (
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-xs space-y-2">
                        <div className="flex items-center gap-2 text-primary font-medium">
                            <Info className="w-3 h-3" />
                            <span>Cadre d'assistance</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground/80 pl-1">
                            {service.assistanceDetails.situations.slice(0, 2).map((sit, i) => (
                                <li key={i} className="truncate">{sit}</li>
                            ))}
                            {service.assistanceDetails.situations.length > 2 && (
                                <li className="list-none text-[10px] italic pl-4">
                                    + {service.assistanceDetails.situations.length - 2} autres cas...
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-0">
                <Button
                    className="w-full shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300"
                    variant="secondary"
                    onClick={onRegisterClick}
                >
                    Obtenir ce service
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
            </CardFooter>
        </Card>
    );
}
