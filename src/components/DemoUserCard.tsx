import { useNavigate } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import { DemoUser } from "@/types/roles";
import { getEntityById } from "@/data/mock-entities";
import { SERVICE_CATALOG, ServiceType } from "@/types/services";
import { COUNTRY_FLAGS } from "@/types/entity";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface DemoUserCardProps {
  user: DemoUser;
}

export function DemoUserCard({ user }: DemoUserCardProps) {
  const navigate = useNavigate();
  const { simulateUser } = useDemo();
  const entity = user.entityId ? getEntityById(user.entityId) : null;

  const handleSimulate = () => {
    simulateUser(user.id);
    navigate("/");
  };

  const getRoleColor = () => {
    switch (user.role) {
      case 'ADMIN': return 'bg-red-600';
      case 'MANAGER': return 'bg-blue-600';
      case 'AGENT': return 'bg-green-600';
      case 'CITIZEN': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const allServices = Object.keys(SERVICE_CATALOG) as ServiceType[];
  const enabledServices = entity?.enabledServices || allServices;

  return (
    <Card className="hover-scale transition-all duration-300 border-l-4" style={{ borderLeftColor: getRoleColor().replace('bg-', '') }}>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge className={getRoleColor()}>
            <span className="mr-1">{user.badge}</span>
            {user.role}
          </Badge>
          {entity && (
            <span className="text-2xl">
              {COUNTRY_FLAGS[entity.countryCode] || '🌍'}
            </span>
          )}
        </div>
        <CardTitle className="text-xl">{user.name}</CardTitle>
        <CardDescription>{user.description}</CardDescription>
        {entity && (
          <p className="text-xs text-muted-foreground mt-1">
            📍 {entity.city}, {entity.country}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-2">Permissions :</h4>
          <ul className="space-y-1">
            {user.permissions.slice(0, 3).map((permission, index) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{permission}</span>
              </li>
            ))}
          </ul>
        </div>

        {entity && user.role !== 'CITIZEN' && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Services disponibles :</h4>
            <div className="grid grid-cols-2 gap-2">
              {allServices.map((serviceType) => {
                const isEnabled = enabledServices.includes(serviceType);
                const service = SERVICE_CATALOG[serviceType];
                return (
                  <div
                    key={serviceType}
                    className={`flex items-center gap-1 text-xs p-1.5 rounded ${
                      isEnabled ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500 line-through'
                    }`}
                  >
                    {isEnabled ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    <span>{service.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          onClick={handleSimulate} 
          className="w-full"
          variant="default"
        >
          Simuler cet utilisateur
        </Button>
      </CardFooter>
    </Card>
  );
}
