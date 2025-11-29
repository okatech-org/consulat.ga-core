export enum RequestType {
    PASSPORT = 'PASSPORT',
    VISA = 'VISA',
    CIVIL_REGISTRY = 'CIVIL_REGISTRY',
    LEGALIZATION = 'LEGALIZATION',
    CONSULAR_CARD = 'CONSULAR_CARD',
    ATTESTATION = 'ATTESTATION'
}

export enum RequestStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    AWAITING_DOCUMENTS = 'AWAITING_DOCUMENTS',
    VALIDATED = 'VALIDATED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED'
}

export enum RequestPriority {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export interface Request {
    id: string;
    type: RequestType;
    status: RequestStatus;
    priority: RequestPriority;

    // Citizen information
    citizenName: string;
    citizenEmail: string;
    citizenPhone?: string;

    // Request details
    subject: string;
    description: string;

    // Documents
    attachedDocuments: string[];
    requiredDocuments: string[];

    // Dates
    createdAt: Date;
    updatedAt: Date;
    expectedCompletionDate?: Date;

    // Assignment
    assignedTo?: string; // Agent ID
    assignedToName?: string;

    // Notes
    internalNotes?: string;
}
