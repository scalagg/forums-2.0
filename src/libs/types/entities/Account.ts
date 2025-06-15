import { UUID } from '../UUID';

export interface AccountSettings {
    theme: string;
    notifications: boolean;
    emailNotifications: boolean;
    privacy: {
        showEmail: boolean;
        showLocation: boolean;
        showWebsite: boolean;
        showSocial: boolean;
    };
}

export interface AccountProfile {
    avatar: string;
    banner: string;
    bio: string;
    location: string;
    website: string;
    social: {
        discord: string;
        twitter: string;
        github: string;
    };
}

export interface AccountStats {
    posts: number;
    threads: number;
    reputation: number;
    thanks: number;
}

export interface Account {
    id: string;
    uuid: UUID;
    username: string;
    email: string;
    createdAt: number;
    lastLoginAt: number;
    lastSeenAt: number;
    role: string;
    permissions: string[];
    settings: AccountSettings;
    profile: AccountProfile;
    stats: AccountStats;
    getRoleColor(): string;
    hasPermission(permission: string): boolean;
    getReputationColor(): string;
}