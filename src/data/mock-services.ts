export interface Service {
    id: string;
    name: string;
    type: 'ADMINISTRATIVE' | 'CIVIL' | 'VISA' | 'PASSPORT';
    description: string;
    defaultDelay: number; // in days
    requiredDocuments: string[];
    icon?: string;
}

export const MOCK_SERVICES: Service[] = [
    {
        id: 'passport-ordinary',
        name: 'Passeport Ordinaire',
        type: 'PASSPORT',
        description: 'Délivrance et renouvellement de passeports biométriques pour les citoyens.',
        defaultDelay: 15,
        requiredDocuments: ['Acte de naissance', 'Ancien passeport', 'Photo d\'identité', 'Justificatif de domicile']
    },
    {
        id: 'visa-tourist',
        name: 'Visa Tourisme',
        type: 'VISA',
        description: 'Visa court séjour pour les visiteurs étrangers.',
        defaultDelay: 7,
        requiredDocuments: ['Passeport valide', 'Photo', 'Réservation d\'hôtel', 'Billet d\'avion']
    },
    {
        id: 'visa-business',
        name: 'Visa Affaires',
        type: 'VISA',
        description: 'Visa pour les voyages d\'affaires et missions professionnelles.',
        defaultDelay: 5,
        requiredDocuments: ['Lettre d\'invitation', 'Ordre de mission', 'Passeport', 'Photo']
    },
    {
        id: 'civil-birth',
        name: 'Transcription Naissance',
        type: 'CIVIL',
        description: 'Enregistrement des naissances survenues à l\'étranger.',
        defaultDelay: 3,
        requiredDocuments: ['Acte de naissance local', 'Pièces d\'identité des parents']
    },
    {
        id: 'civil-marriage',
        name: 'Transcription Mariage',
        type: 'CIVIL',
        description: 'Enregistrement des mariages célébrés à l\'étranger.',
        defaultDelay: 10,
        requiredDocuments: ['Acte de mariage local', 'Certificats de capacité']
    },
    {
        id: 'legalization',
        name: 'Légalisation de Documents',
        type: 'ADMINISTRATIVE',
        description: 'Certification de l\'authenticité de documents officiels.',
        defaultDelay: 1,
        requiredDocuments: ['Document original', 'Copie']
    },
    {
        id: 'consular-card',
        name: 'Carte Consulaire',
        type: 'ADMINISTRATIVE',
        description: 'Immatriculation des citoyens résidant dans la juridiction.',
        defaultDelay: 1,
        requiredDocuments: ['Passeport', 'Justificatif de domicile', 'Photo']
    }
];
