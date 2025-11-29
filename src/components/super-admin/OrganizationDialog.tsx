import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Organization, OrganizationType, OrganizationStatus, COUNTRY_FLAGS } from "@/types/organization";

interface OrganizationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Organization | null;
    onSave: (data: Partial<Organization>) => Promise<void>;
}

export function OrganizationDialog({ open, onOpenChange, initialData, onSave }: OrganizationDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Organization>>({
        name: "",
        type: OrganizationType.EMBASSY,
        status: OrganizationStatus.ACTIVE,
        metadata: {
            jurisdiction: [],
            contact: { address: '', phone: '', email: '' },
            hours: {}
        }
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: "",
                type: OrganizationType.EMBASSY,
                status: OrganizationStatus.ACTIVE,
                metadata: {
                    jurisdiction: [],
                    contact: { address: '', phone: '', email: '' },
                    hours: {}
                }
            });
        }
    }, [initialData, open]);

    const toggleCountry = (code: string) => {
        setFormData(prev => {
            const current = prev.metadata?.jurisdiction || [];
            const newJurisdiction = current.includes(code)
                ? current.filter(c => c !== code)
                : [...current, code];

            return {
                ...prev,
                metadata: {
                    ...prev.metadata,
                    jurisdiction: newJurisdiction
                }
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Modifier l'Organisation" : "Nouvelle Organisation"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nom de l'entité</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                            placeholder="Ex: Ambassade du Gabon en France"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Type de structure</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(v) => setFormData(p => ({ ...p, type: v as OrganizationType }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(OrganizationType).map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type.replace(/_/g, ' ')}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label>Juridiction (Pays couverts)</Label>
                        <div className="border rounded-md p-3 bg-muted/20">
                            <ScrollArea className="h-[200px] pr-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(COUNTRY_FLAGS).map(([code, flag]) => (
                                        <div key={code} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 transition-colors">
                                            <Checkbox
                                                id={`country-${code}`}
                                                checked={formData.metadata?.jurisdiction?.includes(code)}
                                                onCheckedChange={() => toggleCountry(code)}
                                            />
                                            <Label htmlFor={`country-${code}`} className="flex items-center gap-2 cursor-pointer text-sm font-normal w-full">
                                                <span className="text-lg">{flag}</span>
                                                <span>{code}</span>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Sélectionnez les pays sous la responsabilité de cette entité.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                        <Button type="submit" disabled={loading} className="neu-raised">
                            {loading ? "Enregistrement..." : "Créer l'organisation"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
