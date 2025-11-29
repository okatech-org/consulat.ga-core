export enum OrganizationType {
    EMBASSY = 'EMBASSY',
    CONSULATE = 'CONSULATE',
    GENERAL_CONSULATE = 'GENERAL_CONSULATE',
    HONORARY_CONSULATE = 'HONORARY_CONSULATE',
    OTHER = 'OTHER'
}

export enum OrganizationStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED'
}

export interface OrganizationMetadata {
    jurisdiction?: string[]; // Array of Country Codes
    contact?: {
        address: string;
        phone: string;
        email: string;
        website?: string;
    };
    hours?: {
        [day: string]: { open: string; close: string; isOpen: boolean };
    };
    city?: string;
    country?: string;
    countryCode?: string;
}

export interface Organization {
    id: string;
    name: string;
    logo?: string;
    type: OrganizationType;
    status: OrganizationStatus;
    metadata?: OrganizationMetadata;
    created_at?: string;
    updated_at?: string;
}

export const COUNTRY_FLAGS: Record<string, string> = {
    'FR': '🇫🇷',
    'GA': '🇬🇦',
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'CN': '🇨🇳',
    'DE': '🇩🇪',
    'ES': '🇪🇸',
    'IT': '🇮🇹',
    'MA': '🇲🇦',
    'SN': '🇸🇳',
    'MC': '🇲🇨',
    'PT': '🇵🇹',
    'CA': '🇨🇦',
    'MX': '🇲🇽'
};

// Compatibility exports
export { OrganizationType as EntityType };
export type { Organization as Entity };
