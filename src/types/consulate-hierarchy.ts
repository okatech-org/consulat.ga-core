import { EntityType } from './entity';

export enum EmploymentStatus {
    FONCTIONNAIRE = 'FONCTIONNAIRE',
    CONTRACTUEL = 'CONTRACTUEL',
    CITOYEN = 'CITOYEN'
}

export enum ConsularRole {
    // CONSULAT_GENERAL uniquement
    CONSUL_GENERAL = 'CONSUL_GENERAL',

    // CONSULAT_GENERAL, CONSULAT, AMBASSADE
    CONSUL = 'CONSUL',

    // CONSULAT_GENERAL, CONSULAT uniquement (PAS AMBASSADE)
    VICE_CONSUL = 'VICE_CONSUL',

    // CONSULAT_GENERAL, CONSULAT, AMBASSADE
    CHARGE_AFFAIRES_CONSULAIRES = 'CHARGE_AFFAIRES_CONSULAIRES',

    // CONSULAT_GENERAL, CONSULAT, AMBASSADE
    AGENT_CONSULAIRE = 'AGENT_CONSULAIRE',

    // CONSULAT_GENERAL, CONSULAT, AMBASSADE
    STAGIAIRE = 'STAGIAIRE',

    // Utilisateur standard
    CITIZEN = 'CITIZEN'
}

export interface RoleEntityMapping {
    role: ConsularRole;
    allowedEntityTypes: EntityType[];
    employmentStatus: EmploymentStatus;
    hierarchyLevel: number;
    canManageRoles: ConsularRole[];
    label: string;
    description: string;
}

export const ROLE_ENTITY_MAPPING: Record<ConsularRole, RoleEntityMapping> = {
    [ConsularRole.CONSUL_GENERAL]: {
        role: ConsularRole.CONSUL_GENERAL,
        allowedEntityTypes: ['CONSULAT_GENERAL'],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 1,
        canManageRoles: [
            ConsularRole.CONSUL,
            ConsularRole.VICE_CONSUL,
            ConsularRole.CHARGE_AFFAIRES_CONSULAIRES,
            ConsularRole.AGENT_CONSULAIRE,
            ConsularRole.STAGIAIRE
        ],
        label: 'Consul Général',
        description: 'Supervision globale, direction stratégique, administration générale',
    },

    [ConsularRole.CONSUL]: {
        role: ConsularRole.CONSUL,
        allowedEntityTypes: ['CONSULAT_GENERAL', 'CONSULAT', 'AMBASSADE'],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 2,
        canManageRoles: [
            ConsularRole.VICE_CONSUL,
            ConsularRole.CHARGE_AFFAIRES_CONSULAIRES,
            ConsularRole.AGENT_CONSULAIRE,
            ConsularRole.STAGIAIRE
        ],
        label: 'Consul',
        description: 'Direction du consulat/ambassade, adjoint du Consul Général',
    },

    [ConsularRole.VICE_CONSUL]: {
        role: ConsularRole.VICE_CONSUL,
        allowedEntityTypes: ['CONSULAT_GENERAL', 'CONSULAT'],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 3,
        canManageRoles: [
            ConsularRole.CHARGE_AFFAIRES_CONSULAIRES,
            ConsularRole.AGENT_CONSULAIRE,
            ConsularRole.STAGIAIRE
        ],
        label: 'Vice-Consul',
        description: 'Appui au Consul, supervision des opérations locales',
    },

    [ConsularRole.CHARGE_AFFAIRES_CONSULAIRES]: {
        role: ConsularRole.CHARGE_AFFAIRES_CONSULAIRES,
        allowedEntityTypes: ['CONSULAT_GENERAL', 'CONSULAT', 'AMBASSADE'],
        employmentStatus: EmploymentStatus.FONCTIONNAIRE,
        hierarchyLevel: 4,
        canManageRoles: [
            ConsularRole.AGENT_CONSULAIRE,
            ConsularRole.STAGIAIRE
        ],
        label: 'Chargé d\'Affaires Consulaires',
        description: 'Responsable de la gestion locale des demandes consulaires',
    },

    [ConsularRole.AGENT_CONSULAIRE]: {
        role: ConsularRole.AGENT_CONSULAIRE,
        allowedEntityTypes: ['CONSULAT_GENERAL', 'CONSULAT', 'AMBASSADE'],
        employmentStatus: EmploymentStatus.CONTRACTUEL,
        hierarchyLevel: 5,
        canManageRoles: [ConsularRole.STAGIAIRE],
        label: 'Agent Consulaire',
        description: 'Traitement quotidien des dossiers et assistance aux citoyens',
    },

    [ConsularRole.STAGIAIRE]: {
        role: ConsularRole.STAGIAIRE,
        allowedEntityTypes: ['CONSULAT_GENERAL', 'CONSULAT', 'AMBASSADE'],
        employmentStatus: EmploymentStatus.CONTRACTUEL,
        hierarchyLevel: 6,
        canManageRoles: [],
        label: 'Stagiaire',
        description: 'Support opérationnel, apprentissage',
    },

    [ConsularRole.CITIZEN]: {
        role: ConsularRole.CITIZEN,
        allowedEntityTypes: ['CONSULAT_GENERAL', 'CONSULAT', 'AMBASSADE'],
        employmentStatus: EmploymentStatus.CITOYEN,
        hierarchyLevel: 0,
        canManageRoles: [],
        label: 'Citoyen',
        description: 'Utilisateur standard',
    }
};

export function validateRoleForEntity(role: ConsularRole, entityType: EntityType): boolean {
    const mapping = ROLE_ENTITY_MAPPING[role];
    return mapping.allowedEntityTypes.includes(entityType);
}

export function canAssignRole(
    currentUserRole: ConsularRole,
    targetRole: ConsularRole,
    entityType: EntityType
): boolean {
    // Valider que le rôle cible est valide pour ce type d'entité
    if (!validateRoleForEntity(targetRole, entityType)) {
        // throw new Error(`Le rôle ${targetRole} n'est pas autorisé pour une ${entityType}`);
        return false;
    }

    // Vérifier que l'utilisateur actuel peut gérer ce rôle
    const currentUserMapping = ROLE_ENTITY_MAPPING[currentUserRole];
    return currentUserMapping.canManageRoles.includes(targetRole);
}

// Re-export for compatibility if needed, but prefer using ROLE_ENTITY_MAPPING
export const HIERARCHY_DEFINITIONS = ROLE_ENTITY_MAPPING;
