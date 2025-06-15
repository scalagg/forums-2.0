export interface ForumThread {
    id: string;
    title: string;
    body: string;
    forum: string;
    author: string;
    createdAt: number;
    lastEditedBy: string;
    lastEditedAt: number;
    lastReplyAt: number;
    pinned: boolean;
    locked: boolean;
    parentThreadId: string;
    imageUrl: string;
    authorName: string;
    authorColor: string;
    forumName: string;
    lastEditedByName: string;
    lastEditedByColor: string;
} 