import { Entity } from "@/types/entity";
import { COUNTRY_FLAGS } from "@/types/entity";
import { SERVICE_CATALOG, ServiceType } from "@/types/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Settings, Trash2 } from "lucide-react";

interface EntityCardProps {
  entity: Entity;
  onEdit?: (entity: Entity) => void;
  onDelete?: (entity: Entity) => void;
}

export function EntityCard({ entity, onEdit, onDelete }: EntityCardProps) {
  const enabledServices = entity.enabledServices as ServiceType[];
  const disabledServices = (Object.keys(SERVICE_CATALOG) as ServiceType[]).filter(
    (service) => !enabledServices.includes(service)
  );

  return (
    <Card className="hover-scale transition-all duration-300 h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">
              {COUNTRY_FLAGS[entity.countryCode] || "🌍"}
            </div>
            <div>
              <CardTitle className="text-lg">{entity.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {entity.city}, {entity.country}
              </CardDescription>
            </div>
          </div>
          <Badge variant={entity.isActive ? "default" : "secondary"}>
            {entity.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Services activés */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-green-600">
            ✓ Services activés ({enabledServices.length})
          </h4>
          <div className="flex flex-wrap gap-1">
            {enabledServices.map((serviceId) => {
              const service = SERVICE_CATALOG[serviceId];
              return (
                <Badge key={serviceId} variant="outline" className="text-xs">
                  {service.name}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Services désactivés */}
        {disabledServices.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-red-600">
              ✗ Services désactivés ({disabledServices.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {disabledServices.map((serviceId) => {
                const service = SERVICE_CATALOG[serviceId];
                return (
                  <Badge
                    key={serviceId}
                    variant="outline"
                    className="text-xs opacity-50 line-through"
                  >
                    {service.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(entity)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Configurer
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(entity)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
