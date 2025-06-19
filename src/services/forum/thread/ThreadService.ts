'use server';

import HTTPClient from "@/libs/HTTPClient";
import { Thread, ThreadReply } from "@/types/api";

interface Result<T> {
    success: boolean;
    data?: T;
    error?: string;
}

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

interface ReplyModel {
    _id: string;
    threadId: string;
    body: string;
    author: string;
    createdAt: number;
    updatedAt: number;
}

const baseEndpoint = "/forum/thread";

function createThreadInstance(data: RawThread): Thread {
    return {
        _id: data._id,
        id: data._id,
        title: data.title,
        body: data.body,
        forum: data.forum,
        author: data.author,
        createdAt: new Date(data.createdAt).toISOString(),
        updatedAt: new Date(data.lastEditedAt).toISOString(),
        pinned: data.pinned,
        locked: data.locked,
        replies: []
    };
}

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
        if (!data) {
            return {
                success: false,
                error: 'Failed to fetch threads: No data returned'
            };
        }
        return {
            success: true,
            data: data.map(createThreadInstance)
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