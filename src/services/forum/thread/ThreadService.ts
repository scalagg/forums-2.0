'use server';

import HTTPClient from '@/libs/HTTPClient';
import type Thread from '@/libs/types/entities/Thread';
import type { ReplyModel } from '@/libs/types/entities/ReplyModel';
import type { UUID } from '@/libs/types/UUID';

// Define Result type for consistent error handling
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

// Helper function to create a Thread instance
function createThreadInstance(data: RawThread): Thread {
    return {
        id: data._id,
        title: data.title,
        body: data.body,
        forum: data.forum,
        forumName: data.forumName,
        author: data.author as UUID,
        authorName: data.authorName,
        authorWebColor: data.authorWebColor,
        createdAt: data.createdAt,
        lastEditedBy: data.lastEditedBy as UUID | undefined,
        lastEditedAt: data.lastEditedAt,
        lastReplyAt: data.lastReplyAt,
        pinned: data.pinned,
        locked: data.locked,
        parentThreadId: data.parentThreadId,
        forumPermission: data.forumPermission,
        imageUrl: data.imageUrl,
        seenBy: data.seenBy.map(id => id as UUID),
        // Helper methods will be added by the thread utility functions
        getLastReply: () => null, // TODO: Implement
        getReplies: () => [], // TODO: Implement
        getFormattedForum: () => data.forumName,
        getLastReplyAgo: () => '', // TODO: Implement
        getLastEditedAgo: () => '', // TODO: Implement
        getPostedAgo: () => '', // TODO: Implement
        canDelete: () => false, // TODO: Implement
        canEdit: () => false, // TODO: Implement
        canLock: () => false, // TODO: Implement
        hasSeen: () => false, // TODO: Implement
        getContent: () => data.body
    };
}

// Thread Management
export async function getThreadsByForum(
    client: HTTPClient,
    params: {
        forumId: string;
        page?: number;
    }
): Promise<Result<Thread[]>> {
    try {
        const [data, status, error] = await client.GetAsync<RawThread[]>(`${baseEndpoint}/forum/${params.forumId}?page=${params.page || 1}`);
        if (error) {
            return {
                success: false,
                error: `Failed to fetch threads: ${error}`
            };
        }
        return {
            success: true,
            data: (data || []).map(createThreadInstance)
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch threads'
        };
    }
}

export async function getThread(
    client: HTTPClient,
    id: string
): Promise<Result<Thread>> {
    try {
        const [data, status, error] = await client.GetAsync<RawThread>(`${baseEndpoint}/${id}`);
        if (error) {
            return {
                success: false,
                error: `Failed to fetch thread: ${error}`
            };
        }
        if (!data) {
            return {
                success: false,
                error: 'Failed to fetch thread: No data returned'
            };
        }
        return {
            success: true,
            data: createThreadInstance(data)
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch thread'
        };
    }
}

export async function createThread(
    client: HTTPClient,
    params: {
        title: string;
        body: string;
        forum: string;
        author: string;
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
            data: createThreadInstance(data)
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create thread'
        };
    }
}

export async function updateThread(
    client: HTTPClient,
    params: {
        id: string;
        title?: string;
        body?: string;
    }
): Promise<Result<Thread>> {
    try {
        const [data, status, error] = await client.PostAsync<RawThread>(`${baseEndpoint}/edit`, params);
        if (error) {
            return {
                success: false,
                error: `Failed to update thread: ${error}`
            };
        }
        if (!data) {
            return {
                success: false,
                error: 'Failed to update thread: No data returned'
            };
        }
        return {
            success: true,
            data: createThreadInstance(data)
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update thread'
        };
    }
}

export async function deleteThread(
    client: HTTPClient,
    id: string
): Promise<Result<void>> {
    try {
        const [_, status, error] = await client.PostAsync(`${baseEndpoint}/delete`, { id });
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

export async function lockThread(
    client: HTTPClient,
    threadId: string
): Promise<Result<void>> {
    try {
        const [_, status, error] = await client.PostAsync(`${baseEndpoint}/lock/${threadId}`);
        if (error) {
            return {
                success: false,
                error: `Failed to lock thread: ${error}`
            };
        }
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to lock thread'
        };
    }
}

export async function pinThread(
    client: HTTPClient,
    threadId: string
): Promise<Result<void>> {
    try {
        const [_, status, error] = await client.PostAsync(`${baseEndpoint}/pin/${threadId}`);
        if (error) {
            return {
                success: false,
                error: `Failed to pin thread: ${error}`
            };
        }
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to pin thread'
        };
    }
}

// Reply Management
export async function createReply(
    client: HTTPClient,
    params: {
        threadId: string;
        body: string;
        author: string;
    }
): Promise<Result<ReplyModel>> {
    try {
        const [data, status, error] = await client.PostAsync<ReplyModel>(`${baseEndpoint}/${params.threadId}`, {
            body: params.body,
            author: params.author
        });
        if (error) {
            return {
                success: false,
                error: `Failed to create reply: ${error}`
            };
        }
        if (!data) {
            return {
                success: false,
                error: 'Failed to create reply: No data returned'
            };
        }
        return {
            success: true,
            data
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create reply'
        };
    }
}

export async function deleteReply(
    client: HTTPClient,
    replyId: string
): Promise<Result<void>> {
    try {
        const [_, status, error] = await client.PostAsync(`${baseEndpoint}/delete`, { id: replyId });
        if (error) {
            return {
                success: false,
                error: `Failed to delete reply: ${error}`
            };
        }
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete reply'
        };
    }
}

// Backward compatibility exports
export const GetForumThreads = async (forumId: string, page: number = 1, client: HTTPClient = new HTTPClient(process.env.API_URL!)) => {
    const result = await getThreadsByForum(client, { forumId, page });
    if (!result.success) {
        return [null, 500, result.error] as const;
    }
    return [result.data, 200, null] as const;
};

export const GetThread = async (id: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)) => {
    const result = await getThread(client, id);
    if (!result.success) {
        return [null, 500, result.error] as const;
    }
    return [result.data, 200, null] as const;
};

export const CreateThread = async (id: string, title: string, body: string, forum: string, author: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)) => {
    const result = await createThread(client, { title, body, forum, author });
    if (!result.success) {
        return [null, 500, result.error] as const;
    }
    return [result.data, 200, null] as const;
};

export const EditThread = async (thread: Thread, client: HTTPClient = new HTTPClient(process.env.API_URL!)) => {
    const result = await updateThread(client, { 
        id: thread.id, 
        title: thread.title, 
        body: thread.body 
    });
    if (!result.success) {
        return [null, 500, result.error] as const;
    }
    return [result.data, 200, null] as const;
};

export const DeleteThread = async (id: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)) => {
    const result = await deleteThread(client, id);
    if (!result.success) {
        return [null, 500, result.error] as const;
    }
    return [null, 200, null] as const;
};

export const DeleteReply = async (parentId: string, replyId: string, client: HTTPClient = new HTTPClient(process.env.API_URL!)) => {
    const result = await deleteReply(client, replyId);
    if (!result.success) {
        return [null, 500, result.error] as const;
    }
    return [null, 200, null] as const;
}; 