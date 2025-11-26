export type EntityType = 'AMBASSADE' | 'CONSULAT';

export interface Entity {
  id: string;
  type: EntityType;
  countryCode: string; // ISO 3166-1 alpha-2
  country: string;
  city: string;
  name: string;
  isActive: boolean;
  enabledServices: string[];
}

export const COUNTRY_FLAGS: Record<string, string> = {
  US: '🇺🇸',
  FR: '🇫🇷',
  CN: '🇨🇳',
  SN: '🇸🇳',
  GB: '🇬🇧',
  DE: '🇩🇪',
  ES: '🇪🇸',
  IT: '🇮🇹',
  BR: '🇧🇷',
  MA: '🇲🇦',
};
