export enum OrganizationType {
    CONSULAT_GENERAL = 'CONSULAT_GENERAL',
    CONSULAT = 'CONSULAT',
    AMBASSADE = 'AMBASSADE',
    HAUT_COMMISSARIAT = 'HAUT_COMMISSARIAT',
    MISSION_PERMANENTE = 'MISSION_PERMANENTE'
}

export interface CountrySettings {
    contact: {
        address: string;
        phone: string;
        email: string;
        website?: string;
    };
    hours: {
        [day: string]: { open: string; close: string; isOpen: boolean };
    };
    resources: {
        consularCardTemplateId?: string;
        visaTemplateId?: string;
    };
}

export interface Organization {
    id: string;
    name: string;
    type: OrganizationType;
    jurisdiction: string[]; // Array of Country Codes (e.g., ['FR', 'MC', 'PT'])
    settings: Record<string, CountrySettings>; // Keyed by Country Code

    // Legacy support (optional, for transition)
    city?: string;
    country?: string;
    countryCode?: string;
    enabledServices?: string[]; // Legacy support for service IDs
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

// Re-export for compatibility with existing code that expects EntityType
export { OrganizationType as EntityType };
export type { Organization as Entity };
