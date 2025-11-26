import { LucideIcon, FileText, BookKey, Stamp, CreditCard, FileCheck, ScrollText } from 'lucide-react';

export type ServiceType = 
  | 'VISA' 
  | 'PASSEPORT' 
  | 'LEGALISATION' 
  | 'CARTE_CONSULAIRE' 
  | 'TRANSCRIPTION_NAISSANCE' 
  | 'ACTE_CIVIL';

export interface ServiceInfo {
  id: ServiceType;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export const SERVICE_CATALOG: Record<ServiceType, ServiceInfo> = {
  VISA: {
    id: 'VISA',
    name: 'Visa',
    description: 'Demande et renouvellement de visa',
    icon: FileText,
    color: 'text-blue-600',
  },
  PASSEPORT: {
    id: 'PASSEPORT',
    name: 'Passeport',
    description: 'Demande et renouvellement de passeport',
    icon: BookKey,
    color: 'text-green-600',
  },
  LEGALISATION: {
    id: 'LEGALISATION',
    name: 'Légalisation',
    description: 'Légalisation de documents officiels',
    icon: Stamp,
    color: 'text-purple-600',
  },
  CARTE_CONSULAIRE: {
    id: 'CARTE_CONSULAIRE',
    name: 'Carte Consulaire',
    description: 'Inscription consulaire et carte',
    icon: CreditCard,
    color: 'text-yellow-600',
  },
  TRANSCRIPTION_NAISSANCE: {
    id: 'TRANSCRIPTION_NAISSANCE',
    name: 'Transcription Naissance',
    description: 'Transcription acte de naissance',
    icon: FileCheck,
    color: 'text-indigo-600',
  },
  ACTE_CIVIL: {
    id: 'ACTE_CIVIL',
    name: 'État Civil',
    description: 'Actes d\'état civil divers',
    icon: ScrollText,
    color: 'text-red-600',
  },
};
