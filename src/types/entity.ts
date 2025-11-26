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
  // Europe
  FR: '🇫🇷',
  GB: '🇬🇧',
  DE: '🇩🇪',
  TR: '🇹🇷',
  CH: '🇨🇭',
  IT: '🇮🇹',
  // Afrique Australe
  ZA: '🇿🇦',
  AO: '🇦🇴',
  // Afrique Centrale
  CM: '🇨🇲',
  CG: '🇨🇬',
  CD: '🇨🇩',
  GQ: '🇬🇶',
  ST: '🇸🇹',
  // Afrique de l'Ouest
  SN: '🇸🇳',
  CI: '🇨🇮',
  TG: '🇹🇬',
  BJ: '🇧🇯',
  NG: '🇳🇬',
  ML: '🇲🇱',
  // Afrique du Nord
  MA: '🇲🇦',
  DZ: '🇩🇿',
  TN: '🇹🇳',
  EG: '🇪🇬',
  ET: '🇪🇹',
  // Amériques
  US: '🇺🇸',
  CA: '🇨🇦',
  CU: '🇨🇺',
  // Asie & Moyen-Orient
  CN: '🇨🇳',
  JP: '🇯🇵',
  KR: '🇰🇷',
  IN: '🇮🇳',
  SA: '🇸🇦',
  LB: '🇱🇧',
};
