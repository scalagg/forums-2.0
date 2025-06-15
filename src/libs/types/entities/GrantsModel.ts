export interface GrantsModel {
    uuid: string;
    addedAt: number;
    addedBy: string;
    addedOn: string;
    addedReason: string;
    duration: number;
    expireDate: string;
    rankId: string;
    removedAt: number;
    removedBy: string;
    removedOn: string;
    removedReason: string;
    scopes: string[];
    target: string;
} 