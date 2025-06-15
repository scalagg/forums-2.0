import HTTPClient from '@/libs/HTTPClient';
import ReplyModel from '@/libs/types/entities/ReplyModel';
import { createReplyInstance } from '@/libs/utils/reply';

// Define Result type since it's not available
interface Result<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Raw API response types with MongoDB fields
interface RawReply {
    _id: string;
    uuid: string;
    author: string;
    authorName: string;
    authorWebColor: string;
    thread: string;
    comment: string;
    createdAt: number;
    lastEditedAt: number;
    parentReply?: string;
    replies: string[];
}

const baseEndpoint = "/forum/reply";

/**
 * Get replies for a thread
 */
export async function getThreadReplies(client: HTTPClient, threadId: string, page: number = 1): Promise<Result<ReplyModel[]>> {
    try {
        const [data, status, error] = await client.GetAsync<RawReply[]>(`${baseEndpoint}/thread/${threadId}?page=${page}`);
        if (error) {
            return {
                success: false,
                error: `Failed to fetch thread replies: ${error}`
            };
        }
        if (!data) {
            return {
                success: false,
                error: 'Failed to fetch thread replies: No data returned'
            };
        }
        return {
            success: true,
            data: data.map(reply => createReplyInstance({
                uuid: reply.uuid,
                author: reply.author,
                authorName: reply.authorName,
                authorWebColor: reply.authorWebColor,
                thread: reply.thread,
                comment: reply.comment,
                createdAt: reply.createdAt,
                lastEditedAt: reply.lastEditedAt,
                parentReply: reply.parentReply,
                replies: reply.replies
            }))
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch thread replies'
        };
    }
}

/**
 * Create a new reply
 */
export async function createReply(
    client: HTTPClient,
    params: {
        thread: string;
        comment: string;
        parentReply?: string;
    }
): Promise<Result<ReplyModel>> {
    try {
        const [data, status, error] = await client.PostAsync<RawReply>(baseEndpoint, params);
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
            data: createReplyInstance({
                uuid: data.uuid,
                author: data.author,
                authorName: data.authorName,
                authorWebColor: data.authorWebColor,
                thread: data.thread,
                comment: data.comment,
                createdAt: data.createdAt,
                lastEditedAt: data.lastEditedAt,
                parentReply: data.parentReply,
                replies: data.replies
            })
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create reply'
        };
    }
}

/**
 * Edit an existing reply
 */
export async function editReply(
    client: HTTPClient,
    params: {
        id: string;
        comment: string;
    }
): Promise<Result<ReplyModel>> {
    try {
        const [data, status, error] = await client.PutAsync<RawReply>(`${baseEndpoint}/${params.id}`, params);
        if (error) {
            return {
                success: false,
                error: `Failed to edit reply: ${error}`
            };
        }
        if (!data) {
            return {
                success: false,
                error: 'Failed to edit reply: No data returned'
            };
        }
        return {
            success: true,
            data: createReplyInstance({
                uuid: data.uuid,
                author: data.author,
                authorName: data.authorName,
                authorWebColor: data.authorWebColor,
                thread: data.thread,
                comment: data.comment,
                createdAt: data.createdAt,
                lastEditedAt: data.lastEditedAt,
                parentReply: data.parentReply,
                replies: data.replies
            })
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to edit reply'
        };
    }
}

/**
 * Delete a reply
 */
export async function deleteReply(client: HTTPClient, id: string): Promise<Result<void>> {
    try {
        const [_, status, error] = await client.DeleteAsync(`${baseEndpoint}/${id}`, undefined, true);
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

/**
 * Like a reply
 */
export async function likeReply(
  client: HTTPClient,
  replyId: string,
  userId: string
): Promise<Result<void>> {
  try {
    const [_, status, error] = await client.PostAsync(`${baseEndpoint}/${replyId}/like/${userId}`, undefined, true);
    if (error) {
      return [null, { status, message: error }];
    }
    return [undefined, null];
  } catch (error) {
    return [null, { status: 500, message: (error as Error).message }];
  }
}

/**
 * Unlike a reply
 */
export async function unlikeReply(
  client: HTTPClient,
  replyId: string,
  userId: string
): Promise<Result<void>> {
  try {
    const [_, status, error] = await client.PostAsync(`${baseEndpoint}/${replyId}/unlike/${userId}`, undefined, true);
    if (error) {
      return [null, { status, message: error }];
    }
    return [undefined, null];
  } catch (error) {
    return [null, { status: 500, message: (error as Error).message }];
  }
}

/**
 * Get a reply by ID
 */
export async function getReply(client: HTTPClient, id: string): Promise<Result<ReplyModel>> {
    try {
        const [data, status, error] = await client.GetAsync<RawReply>(`${baseEndpoint}/${id}`);
        if (error) {
            return {
                success: false,
                error: `Failed to fetch reply: ${error}`
            };
        }
        if (!data) {
            return {
                success: false,
                error: 'Reply not found'
            };
        }
        return {
            success: true,
            data: createReplyInstance({
                uuid: data.uuid,
                author: data.author,
                authorName: data.authorName,
                authorWebColor: data.authorWebColor,
                thread: data.thread,
                comment: data.comment,
                createdAt: data.createdAt,
                lastEditedAt: data.lastEditedAt,
                parentReply: data.parentReply,
                replies: data.replies
            })
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch reply'
        };
    }
}

/**
 * Get replies for a reply
 */
export async function getReplyReplies(client: HTTPClient, replyId: string, page: number = 1): Promise<Result<ReplyModel[]>> {
    try {
        const [data, status, error] = await client.GetAsync<RawReply[]>(`${baseEndpoint}/${replyId}/replies?page=${page}`);
        if (error) {
            return {
                success: false,
                error: `Failed to fetch reply replies: ${error}`
            };
        }
        if (!data) {
            return {
                success: false,
                error: 'Failed to fetch reply replies: No data returned'
            };
        }
        return {
            success: true,
            data: data.map(reply => createReplyInstance({
                uuid: reply.uuid,
                author: reply.author,
                authorName: reply.authorName,
                authorWebColor: reply.authorWebColor,
                thread: reply.thread,
                comment: reply.comment,
                createdAt: reply.createdAt,
                lastEditedAt: reply.lastEditedAt,
                parentReply: reply.parentReply,
                replies: reply.replies
            }))
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch reply replies'
        };
    }
} 