import Thread from '@/libs/types/entities/Thread';
import { ProfileModel } from '@/libs/types/entities/ProfileModel';
import { ReplyModel } from '@/libs/types/entities/ReplyModel';
import { formatTimeAgo } from './time';

export function getThreadUrlName(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function getFormattedForum(forumName: string): string {
    return forumName.replace(" ", "-").toLowerCase();
}

export function getLastReplyAgo(lastReplyAt: number): string {
    if (lastReplyAt === -1) return "Never";
    return formatTimeAgo(lastReplyAt);
}

export function getLastEditedAgo(lastEditedAt: number): string {
    if (lastEditedAt === -1) return "Never";
    return formatTimeAgo(lastEditedAt);
}

export function getPostedAgo(createdAt: number): string {
    return formatTimeAgo(createdAt);
}

export function canDeleteThread(thread: Thread, profile: ProfileModel): boolean {
    if (!profile) return false;
    return thread.author === profile.uuid || profile.hasPermission("website.thread.delete.*");
}

export function canEditThread(thread: Thread, profile: ProfileModel): boolean {
    if (!profile) return false;
    return thread.author === profile.uuid 
        || profile.hasPermission("website.thread.edit.*")
        || profile.hasPermission(`website.thread.edit.${thread.id}`);
}

export function canLockThread(thread: Thread, profile: ProfileModel): boolean {
    return profile != null && profile.hasPermission("website.thread.lock");
}

export function hasSeenThread(thread: Thread, profile: ProfileModel): boolean {
    return thread.seenBy.includes(profile.uuid);
}

// Helper to create a Thread instance with all required methods
export function createThreadInstance(data: Omit<Thread, 'getLastReply' | 'getReplies' | 'getFormattedForum' | 'getLastReplyAgo' | 'getLastEditedAgo' | 'getPostedAgo' | 'canDelete' | 'canEdit' | 'canLock' | 'hasSeen' | 'getContent'>): Thread {
    return {
        ...data,
        getLastReply: () => {
            const replies = data.replies || [];
            return replies.length > 0 ? replies[0] : null;
        },
        getReplies: () => data.replies || [],
        getFormattedForum: () => getFormattedForum(data.forumName),
        getLastReplyAgo: () => getLastReplyAgo(data.lastReplyAt),
        getLastEditedAgo: () => getLastEditedAgo(data.lastEditedAt),
        getPostedAgo: () => getPostedAgo(data.createdAt),
        canDelete: (profile: ProfileModel) => canDeleteThread(data, profile),
        canEdit: (profile: ProfileModel) => canEditThread(data, profile),
        canLock: (profile: ProfileModel) => canLockThread(data, profile),
        hasSeen: (profile: ProfileModel) => hasSeenThread(data, profile),
        getContent: () => {
            // TODO: Implement markdown rendering and sanitization
            return data.body;
        }
    };
} 