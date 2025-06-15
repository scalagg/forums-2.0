export interface RankModel {
    uuid: string;
    children: string[];
    color: string;
    displayName: string;
    grantable: boolean;
    name: string;
    permissions: string[];
    prefix: string;
    serverScopes: string[];
    suffix: string;
    visible: boolean;
    weight: number;
} 