import { DemoUser } from '@/types/roles';

export const MOCK_USERS: DemoUser[] = [
  {
    id: 'admin-system',
    role: 'ADMIN',
    name: 'Admin Système',
    entityId: undefined,
    permissions: [
      'Accès total au système',
      'Gestion des licences',
      'Création d\'entités',
      'Configuration IA et sécurité',
      'Consultation des logs système',
      'Gestion des utilisateurs globale',
    ],
    badge: '🔴',
    description: 'Super administrateur avec accès au réseau mondial complet',
  },
  {
    id: 'manager-france',
    role: 'MANAGER',
    name: 'Manager - Consulat France',
    entityId: 'fr-consulat-paris',
    permissions: [
      'Supervision de l\'équipe France',
      'Validation finale des dossiers',
      'Statistiques consulaires',
      'Gestion des priorités',
      'Configuration des workflows',
    ],
    badge: '🔵',
    description: 'Consul responsable du Consulat de Paris (Passeport désactivé)',
  },
  {
    id: 'manager-usa',
    role: 'MANAGER',
    name: 'Manager - Ambassade USA',
    entityId: 'usa-embassy-washington',
    permissions: [
      'Supervision de l\'équipe USA',
      'Validation finale des dossiers',
      'Statistiques consulaires',
      'Gestion des priorités',
      'Tous les services activés',
    ],
    badge: '🔵',
    description: 'Ambassadeur avec accès complet aux services (Tous services)',
  },
  {
    id: 'agent-france',
    role: 'AGENT',
    name: 'Agent Consulaire',
    entityId: 'fr-consulat-paris',
    permissions: [
      'Traitement des dossiers',
      'Gestion du guichet virtuel',
      'Chat interne avec équipe',
      'Validation des documents',
      'Suivi des demandes',
    ],
    badge: '🟢',
    description: 'Agent de traitement rattaché au Consulat de Paris',
  },
  {
    id: 'citizen-france',
    role: 'CITIZEN',
    name: 'Citoyen',
    entityId: 'fr-consulat-paris',
    permissions: [
      'Mes demandes en cours',
      'Mon profil personnel',
      'Mes rendez-vous',
      'Mes documents',
      'Messagerie consulaire',
    ],
    badge: '⚪',
    description: 'Utilisateur standard rattaché au Consulat de Paris',
  },
];

export const getUserById = (id: string): DemoUser | undefined => {
  return MOCK_USERS.find(user => user.id === id);
};

export const getUsersByEntity = (entityId: string): DemoUser[] => {
  return MOCK_USERS.filter(user => user.entityId === entityId);
};
