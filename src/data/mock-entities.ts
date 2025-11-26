import { Entity } from '@/types/entity';

export const MOCK_ENTITIES: Entity[] = [
  {
    id: 'usa-embassy-washington',
    type: 'AMBASSADE',
    countryCode: 'US',
    country: 'États-Unis',
    city: 'Washington D.C.',
    name: 'Ambassade du Gabon aux États-Unis',
    isActive: true,
    enabledServices: [
      'VISA',
      'PASSEPORT',
      'LEGALISATION',
      'CARTE_CONSULAIRE',
      'TRANSCRIPTION_NAISSANCE',
      'ACTE_CIVIL',
    ],
  },
  {
    id: 'fr-consulat-paris',
    type: 'CONSULAT',
    countryCode: 'FR',
    country: 'France',
    city: 'Paris',
    name: 'Consulat Général du Gabon à Paris',
    isActive: true,
    enabledServices: [
      'VISA',
      // 'PASSEPORT', // DÉSACTIVÉ pour démontrer la modularité
      'LEGALISATION',
      'CARTE_CONSULAIRE',
      'TRANSCRIPTION_NAISSANCE',
      'ACTE_CIVIL',
    ],
  },
  {
    id: 'cn-consulat-beijing',
    type: 'CONSULAT',
    countryCode: 'CN',
    country: 'Chine',
    city: 'Pékin',
    name: 'Consulat du Gabon à Pékin',
    isActive: true,
    enabledServices: [
      'VISA',
      'CARTE_CONSULAIRE',
      'LEGALISATION',
    ],
  },
  {
    id: 'sn-embassy-dakar',
    type: 'AMBASSADE',
    countryCode: 'SN',
    country: 'Sénégal',
    city: 'Dakar',
    name: 'Ambassade du Gabon au Sénégal',
    isActive: true,
    enabledServices: [
      'VISA',
      'PASSEPORT',
      'LEGALISATION',
      'CARTE_CONSULAIRE',
      'TRANSCRIPTION_NAISSANCE',
      'ACTE_CIVIL',
    ],
  },
];

export const getEntityById = (id: string): Entity | undefined => {
  return MOCK_ENTITIES.find(entity => entity.id === id);
};

export const getEntitiesByCountry = (countryCode: string): Entity[] => {
  return MOCK_ENTITIES.filter(entity => entity.countryCode === countryCode);
};
