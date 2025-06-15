import { UUID } from '@/libs/types/UUID';
import { RankModel } from './RankModel';
import { PunishmentModel } from './PunishmentModel';
import { ForumThread } from './Thread';
import { BadgeModel } from './BadgeModel';
import { NotificationModel } from './NotificationModel';
import { FriendModel } from './FriendModel';
import { CommentModel } from './CommentModel';
import { StatsModel } from './StatsModel';
import { LogModel } from './LogModel';
import { GrantsModel } from './GrantsModel';
import { Note } from './Note';
import { SocialModel } from './SocialModel';
import { PrivacyModel } from './PrivacyModel';

export interface ProfileModel {
    uuid: UUID;
    name: string;
    email: string;
    firstJoin: number;
    lastSeen: number;
    playTime: number;
    lastServer: string;
    currentServer: string | null;
    rank: RankModel;
    activeBan: PunishmentModel | null;
    activeMute: PunishmentModel | null;
    stats: StatsModel[];
    threads: ForumThread[];
    friends: FriendModel[];
    comments: CommentModel[];
    notifications: NotificationModel[];
    permissions: Map<string, boolean>;
    logs: LogModel[];
    punishments: PunishmentModel[];
    grants: GrantsModel[];
    notes: Note[];
    badges: BadgeModel[];
    settings: Map<string, string>;
    trusted: boolean;

    // Helper methods
    getSocial(social: SocialModel): string;
    formatSeenAgo(): string;
    formatFirstJoin(): string;
    formatPlaytime(): string;
    isOnline(): boolean;
    hasPermission(permission: string): boolean;
    hasSuperPerm(): boolean;
    hasBadge(id: string): boolean;
    getActiveSocials(): SocialModel[];
    getStaffPageStatus(): PrivacyModel;
    getCommentStatus(): PrivacyModel;
    getOnlineStatus(): PrivacyModel;
    hasFriend(profile: ProfileModel): boolean;
    getNotification(uuid: UUID): NotificationModel | null;
    countUnreadNotifications(): number;
} 