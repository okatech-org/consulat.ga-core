export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT' | 'CITIZEN';

export interface DemoUser {
  id: string;
  role: UserRole;
  name: string;
  entityId?: string; // null pour ADMIN système
  permissions: string[];
  badge: string; // emoji
  description: string;
}
