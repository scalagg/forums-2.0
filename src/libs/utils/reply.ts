import { ReplyModel } from '@/libs/types/entities/ReplyModel';
import { ProfileModel } from '@/libs/types/entities/ProfileModel';
import { formatTimeAgo } from './time';

export function getAuthorName(author: string): string {
    // TODO: Implement UUID to name cache
    return author;
}

export function getPostedAgo(createdAt: number): string {
    return formatTimeAgo(createdAt);
}

export function canDeleteReply(reply: ReplyModel, profile: ProfileModel): boolean {
    if (!profile) return false;
    return reply.author === profile.uuid || profile.hasPermission("website.reply.delete.*");
}

export function fetchSubReplies(reply: ReplyModel, step: number): Map<ReplyModel, number> {
    const replyMap = new Map<ReplyModel, number>();

    for (const subReply of getSortedReplies(reply)) {
        replyMap.set(subReply, Math.min(step * 5, 15));

        const subReplies = fetchSubReplies(subReply, step + 1);
        for (const [key, value] of subReplies.entries()) {
            replyMap.set(key, value);
        }
    }

    return replyMap;
}

export function getSortedReplies(reply: ReplyModel): ReplyModel[] {
    return [...reply.replies].sort((a, b) => a.createdAt - b.createdAt);
}

// Helper to create a ReplyModel instance with all required methods
export function createReplyInstance(data: Omit<ReplyModel, 'getAuthorName' | 'getPostedAgo' | 'canDelete' | 'fetchSubReplies' | 'getSortedReplies'>): ReplyModel {
    return {
        ...data,
        getAuthorName: () => getAuthorName(data.author),
        getPostedAgo: () => getPostedAgo(data.createdAt),
        canDelete: (profile: ProfileModel) => canDeleteReply(data, profile),
        fetchSubReplies: (step: number) => fetchSubReplies(data, step),
        getSortedReplies: () => getSortedReplies(data)
    };
} 