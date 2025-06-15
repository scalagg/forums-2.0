export interface PunishmentModel {
    uuid: string;
    addedAt: number;
    addedBy: string;
    addedOn: string;
    addedReason: string;
    category: string;
    duration: number;
    expireDate: string;
    removedAt: number;
    removedBy: string;
    removedOn: string;
    removedReason: string;
    target: string;
    targetCurrentIp: string;
} 