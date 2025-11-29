import { Organization, OrganizationType } from '@/types/organization';

export const MOCK_ORGANIZATIONS: Organization[] = [
    {
        id: 'fr-consulat-paris',
        name: 'Consulat Général du Gabon en France',
        type: OrganizationType.CONSULAT_GENERAL,
        jurisdiction: ['FR', 'MC', 'PT'],
        city: 'Paris',
        country: 'France',
        country_code: 'FR',
        enabled_services: ['passport-ordinary', 'visa-tourist', 'civil-birth', 'legalization', 'consular-card'],
        settings: {
            'FR': {
                contact: {
                    address: '26 bis Avenue Raphaël, 75016 Paris, France',
                    phone: '+33 1 42 99 68 68',
                    email: 'cs@consulat-gabon-france.com',
                    website: 'https://consulat-gabon-france.com'
                },
                hours: {
                    'Lundi': { open: '09:00', close: '15:00', isOpen: true },
                    'Mardi': { open: '09:00', close: '15:00', isOpen: true },
                    'Mercredi': { open: '09:00', close: '15:00', isOpen: true },
                    'Jeudi': { open: '09:00', close: '15:00', isOpen: true },
                    'Vendredi': { open: '09:00', close: '15:00', isOpen: true },
                    'Samedi': { open: '00:00', close: '00:00', isOpen: false },
                    'Dimanche': { open: '00:00', close: '00:00', isOpen: false }
                },
                resources: {
                    consularCardTemplateId: 'template-fr-2024'
                }
            },
            'MC': {
                contact: {
                    address: 'Représentation à Monaco',
                    phone: '+377 99 99 99 99',
                    email: 'monaco@consulat-gabon-france.com'
                },
                hours: {
                    'Lundi': { open: '10:00', close: '12:00', isOpen: true },
                    'Mardi': { open: '10:00', close: '12:00', isOpen: true },
                    'Mercredi': { open: '10:00', close: '12:00', isOpen: true },
                    'Jeudi': { open: '10:00', close: '12:00', isOpen: true },
                    'Vendredi': { open: '10:00', close: '12:00', isOpen: true },
                    'Samedi': { open: '00:00', close: '00:00', isOpen: false },
                    'Dimanche': { open: '00:00', close: '00:00', isOpen: false }
                },
                resources: {}
            },
            'PT': {
                contact: {
                    address: 'Représentation au Portugal',
                    phone: '+351 21 000 0000',
                    email: 'portugal@consulat-gabon-france.com'
                },
                hours: {
                    'Lundi': { open: '09:00', close: '13:00', isOpen: true },
                    'Mardi': { open: '09:00', close: '13:00', isOpen: true },
                    'Mercredi': { open: '09:00', close: '13:00', isOpen: true },
                    'Jeudi': { open: '09:00', close: '13:00', isOpen: true },
                    'Vendredi': { open: '09:00', close: '13:00', isOpen: true },
                    'Samedi': { open: '00:00', close: '00:00', isOpen: false },
                    'Dimanche': { open: '00:00', close: '00:00', isOpen: false }
                },
                resources: {}
            }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Legacy compatibility
        countryCode: 'FR',
        enabledServices: ['passport-ordinary', 'visa-tourist', 'civil-birth', 'legalization', 'consular-card'],
        isActive: true
    },
    {
        id: 'us-ambassade-washington',
        name: 'Ambassade du Gabon aux États-Unis',
        type: OrganizationType.AMBASSADE,
        jurisdiction: ['US', 'CA', 'MX'],
        city: 'Washington',
        country: 'États-Unis',
        country_code: 'US',
        enabled_services: ['passport-ordinary', 'visa-tourist', 'visa-business', 'legalization'],
        settings: {
            'US': {
                contact: {
                    address: '2034 20th St NW, Washington, DC 20009, USA',
                    phone: '+1 202-797-1000',
                    email: 'info@gabonembassyusa.org'
                },
                hours: {
                    'Lundi': { open: '09:00', close: '16:00', isOpen: true },
                    'Mardi': { open: '09:00', close: '16:00', isOpen: true },
                    'Mercredi': { open: '09:00', close: '16:00', isOpen: true },
                    'Jeudi': { open: '09:00', close: '16:00', isOpen: true },
                    'Vendredi': { open: '09:00', close: '15:00', isOpen: true },
                    'Samedi': { open: '00:00', close: '00:00', isOpen: false },
                    'Dimanche': { open: '00:00', close: '00:00', isOpen: false }
                },
                resources: {}
            }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        countryCode: 'US',
        enabledServices: ['passport-ordinary', 'visa-tourist', 'visa-business', 'legalization'],
        isActive: true
    }
];

// Re-export for compatibility
export const MOCK_ENTITIES = MOCK_ORGANIZATIONS;

// Helper function to get an organization by ID
export function getEntityById(id: string): Organization | undefined {
    return MOCK_ORGANIZATIONS.find(org => org.id === id);
}
