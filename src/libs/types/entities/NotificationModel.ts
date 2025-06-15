import { UUID } from '@/libs/types/UUID';

export interface NotificationModel {
    uuid: string;
    target: string;
    createdAt: number;
    text: string;
    placeholders: Record<string, string>;
    read: boolean;

    // Helper methods
    getReplacedText(): string;
    getTimeAgo(): string;
}

// Comparator for sorting notifications
export const NotificationComparator = (a: NotificationModel, b: NotificationModel): number => {
    // First sort by read status (unread first)
    if (a.read !== b.read) {
        return a.read ? 1 : -1;
    }
    // Then sort by creation date (newest first)
    return b.createdAt - a.createdAt;
}; 