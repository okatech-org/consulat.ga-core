import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ServiceInfo } from "@/types/services";

interface ServiceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: ServiceInfo | null;
    onSave: (data: Partial<ServiceInfo>) => Promise<void>;
}

export function ServiceDialog({ open, onOpenChange, initialData, onSave }: ServiceDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<ServiceInfo>>({
        name: "",
        description: "",
        requiredDocuments: [],
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData, open]);

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
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Configurer le Service: {initialData?.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                            rows={3}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Documents Requis (séparés par des virgules)</Label>
                        <Textarea
                            value={formData.requiredDocuments?.join(", ")}
                            onChange={(e) => setFormData(p => ({ ...p, requiredDocuments: e.target.value.split(",").map(s => s.trim()) }))}
                            rows={3}
                            placeholder="Passeport, Photo, Formulaire..."
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
