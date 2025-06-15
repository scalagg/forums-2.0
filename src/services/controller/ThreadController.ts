import HTTPClient from '@/libs/HTTPClient';
import Thread from '@/libs/types/entities/Thread';
import { createThreadInstance } from '@/libs/utils/thread';

// Define Result type since it's not available
interface Result<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Raw API response types with MongoDB fields
interface RawThread {
    _id: string;
    title: string;
    body: string;
    forum: string;
    forumName: string;
    author: string;
    authorName: string;
    authorWebColor: string;
    createdAt: number;
    lastEditedBy?: string;
    lastEditedAt: number;
    lastReplyAt: number;
    pinned: boolean;
    locked: boolean;
    parentThreadId?: string;
    forumPermission?: string;
    imageUrl: string;
    seenBy: string[];
}

const baseEndpoint = "/forum/thread";

/**
 * Get a thread by ID
 */
export async function getThread(client: HTTPClient, id: string, page: number = 1): Promise<Result<Thread>> {
    try {
        const [data, status, error] = await client.GetAsync<RawThread>(`${baseEndpoint}/${id}?page=${page}`);
        if (error) {
            return {
                success: false,
                error: `Failed to fetch thread: ${error}`
            };
        }
        if (!data) {
            return {
                success: false,
                error: 'Thread not found'
            };
        }
        return {
            success: true,
            data: createThreadInstance({
                id: data._id,
                title: data.title,
                body: data.body,
                forum: data.forum,
                forumName: data.forumName,
                author: data.author,
                authorName: data.authorName,
                authorWebColor: data.authorWebColor,
                createdAt: data.createdAt,
                lastEditedBy: data.lastEditedBy,
                lastEditedAt: data.lastEditedAt,
                lastReplyAt: data.lastReplyAt,
                pinned: data.pinned,
                locked: data.locked,
                parentThreadId: data.parentThreadId,
                forumPermission: data.forumPermission,
                imageUrl: data.imageUrl,
                seenBy: data.seenBy
            })
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch thread'
        };
    }
}

/**
 * Create a new thread
 */
export async function createThread(
    client: HTTPClient,
    params: {
        forum: string;
        title: string;
        body: string;
        parentThreadId?: string;
        imageUrl?: string;
    }
): Promise<Result<Thread>> {
    try {
        const [data, status, error] = await client.PostAsync<RawThread>(baseEndpoint, params);
        if (error) {
            return {
                success: false,
                error: `Failed to create thread: ${error}`
            };
        }
        if (!data) {
            return {
                success: false,
                error: 'Failed to create thread: No data returned'
            };
        }
        return {
            success: true,
            data: createThreadInstance({
                id: data._id,
                title: data.title,
                body: data.body,
                forum: data.forum,
                forumName: data.forumName,
                author: data.author,
                authorName: data.authorName,
                authorWebColor: data.authorWebColor,
                createdAt: data.createdAt,
                lastEditedBy: data.lastEditedBy,
                lastEditedAt: data.lastEditedAt,
                lastReplyAt: data.lastReplyAt,
                pinned: data.pinned,
                locked: data.locked,
                parentThreadId: data.parentThreadId,
                forumPermission: data.forumPermission,
                imageUrl: data.imageUrl,
                seenBy: data.seenBy
            })
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create thread'
        };
    }
}

/**
 * Edit an existing thread
 */
export async function editThread(
    client: HTTPClient,
    params: {
        id: string;
        title?: string;
        body?: string;
        imageUrl?: string;
    }
): Promise<Result<Thread>> {
    try {
        const [data, status, error] = await client.PutAsync<RawThread>(`${baseEndpoint}/${params.id}`, params);
        if (error) {
            return {
                success: false,
                error: `Failed to edit thread: ${error}`
            };
        }
        if (!data) {
            return {
                success: false,
                error: 'Failed to edit thread: No data returned'
            };
        }
        return {
            success: true,
            data: createThreadInstance({
                id: data._id,
                title: data.title,
                body: data.body,
                forum: data.forum,
                forumName: data.forumName,
                author: data.author,
                authorName: data.authorName,
                authorWebColor: data.authorWebColor,
                createdAt: data.createdAt,
                lastEditedBy: data.lastEditedBy,
                lastEditedAt: data.lastEditedAt,
                lastReplyAt: data.lastReplyAt,
                pinned: data.pinned,
                locked: data.locked,
                parentThreadId: data.parentThreadId,
                forumPermission: data.forumPermission,
                imageUrl: data.imageUrl,
                seenBy: data.seenBy
            })
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to edit thread'
        };
    }
}

/**
 * Delete a thread
 */
export async function deleteThread(client: HTTPClient, id: string): Promise<Result<void>> {
    try {
        const [_, status, error] = await client.DeleteAsync(`${baseEndpoint}/${id}`, undefined, true);
        if (error) {
            return {
                success: false,
                error: `Failed to delete thread: ${error}`
            };
        }
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete thread'
        };
    }
}

/**
 * Lock a thread
 */
export async function lockThread(client: HTTPClient, id: string): Promise<Result<Thread>> {
    return editThread(client, { id, locked: true });
}

/**
 * Unlock a thread
 */
export async function unlockThread(client: HTTPClient, id: string): Promise<Result<Thread>> {
    return editThread(client, { id, locked: false });
}

/**
 * Pin a thread
 */
export async function pinThread(client: HTTPClient, id: string): Promise<Result<Thread>> {
    return editThread(client, { id, pinned: true });
}

/**
 * Unpin a thread
 */
export async function unpinThread(client: HTTPClient, id: string): Promise<Result<Thread>> {
    return editThread(client, { id, pinned: false });
}

/**
 * Mark a thread as seen by a user
 */
export async function markThreadAsSeen(client: HTTPClient, id: string): Promise<Result<void>> {
    try {
        const [_, status, error] = await client.PostAsync(`${baseEndpoint}/${id}/seen`, undefined, true);
        if (error) {
            return {
                success: false,
                error: `Failed to mark thread as seen: ${error}`
            };
        }
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to mark thread as seen'
        };
    }
} 