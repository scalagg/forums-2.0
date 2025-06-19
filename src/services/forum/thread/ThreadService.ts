import HTTPClient from "@/libs/HTTPClient";
import { Thread, ThreadReply } from "@/types/api";

interface Result<T> {
    success: boolean;
    data?: T;
    error?: string;
}

interface RawThread {
    _id?: string;
    id: string;
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
    console.log("Creating thread instance with raw data:", {
        _id: data._id,
        id: data.id,
        title: data.title,
        forum: data.forum,
        author: data.author,
        createdAt: data.createdAt,
        lastEditedAt: data.lastEditedAt
    });
    
    console.log("Creating thread instance with timestamps:", {
        createdAt: data.createdAt,
        lastEditedAt: data.lastEditedAt,
        createdAtType: typeof data.createdAt,
        lastEditedAtType: typeof data.lastEditedAt
    });
    
    // Handle timestamp conversion - check if it's a valid timestamp
    // If createdAt is 0, null, or invalid, use current time
    const createdAtTimestamp = data.createdAt && data.createdAt > 0 ? data.createdAt : Date.now();
    const lastEditedTimestamp = data.lastEditedAt && data.lastEditedAt > 0 ? data.lastEditedAt : createdAtTimestamp;
    
    const createdAt = new Date(createdAtTimestamp).toISOString();
    const updatedAt = new Date(lastEditedTimestamp).toISOString();
    
    console.log("Converted timestamps:", { createdAt, updatedAt });
    
    // Use the 'id' field as the thread ID since that's what the API returns
    const threadId = data.id || data._id;
    if (!threadId) {
        console.error("No thread ID found in data:", data);
        throw new Error("Thread data missing ID");
    }
    
    return {
        _id: threadId,
        id: threadId,
        title: data.title,
        body: data.body,
        forum: data.forum,
        author: data.author,
        createdAt: createdAt,
        updatedAt: updatedAt,
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
        console.log("Fetching threads for forum:", params.forumId, "page:", params.page || 1);
        // According to ForumController.java, threads are fetched via the forum endpoint
        const [response, status, error] = await client.GetAsync<{ forum: { threads: RawThread[] } } | { threads: RawThread[] }>(`/forum/forum/${params.forumId}?page=${params.page || 1}`);
        console.log("Forum API response:", { response, status, error });
        
        if (error) {
            console.error("Error fetching threads for forum:", error);
            return {
                success: false,
                error: `Failed to fetch threads: ${error}`
            };
        }
        
        if (!response) {
            console.error("No response data returned for forum:", params.forumId);
            return {
                success: false,
                error: 'Failed to fetch threads: No response data'
            };
        }
        
        // Handle both response formats: direct { threads: ... } or wrapped in { forum: { threads: ... } }
        const data = 'forum' in response ? response.forum : response;
        
        if (!data || !data.threads) {
            console.error("No threads data returned for forum:", params.forumId);
            return {
                success: false,
                error: 'Failed to fetch threads: No data returned'
            };
        }
        console.log("Successfully fetched threads:", data.threads.length);
        console.log("Raw thread data:", JSON.stringify(data.threads, null, 2));
        
        // Log each thread's ID structure
        data.threads.forEach((thread, index) => {
            console.log(`Thread ${index} ID analysis:`, {
                _id: thread._id,
                _idType: typeof thread._id,
                _idLength: thread._id?.length,
                title: thread.title,
                createdAt: thread.createdAt,
                createdAtType: typeof thread.createdAt
            });
        });
        
        return {
            success: true,
            data: data.threads.map(createThreadInstance)
        };
    } catch (error) {
        console.error("Exception fetching threads for forum:", error);
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
            console.error("Error fetching thread:", error);
            return {
                success: false,
                error: `Failed to fetch thread: ${error}`
            };
        }
        if (!data) {
            console.error("No thread data returned for ID:", id);
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
        console.error("Exception fetching thread:", error);
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
            console.error("Error creating thread:", error);
            return {
                success: false,
                error: `Failed to create thread: ${error}`
            };
        }
        if (!data) {
            console.error("No thread data returned after creation");
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
        console.error("Exception creating thread:", error);
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
        locked?: boolean;
    }
): Promise<Result<Thread>> {
    try {
        const [data, status, error] = await client.PutAsync<RawThread>(`${baseEndpoint}/${params.id}`, params);
        if (error) {
            console.error("Error updating thread:", error);
            return {
                success: false,
                error: `Failed to update thread: ${error}`
            };
        }
        if (!data) {
            console.error("No thread data returned after update");
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
        console.error("Exception updating thread:", error);
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
        const [_, status, error] = await client.DeleteAsync(`${baseEndpoint}/${id}`);
        if (error) {
            console.error("Error deleting thread:", error);
            return {
                success: false,
                error: `Failed to delete thread: ${error}`
            };
        }
        return { success: true };
    } catch (error) {
        console.error("Exception deleting thread:", error);
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