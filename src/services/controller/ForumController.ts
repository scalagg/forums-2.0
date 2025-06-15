import HTTPClient from '@/libs/HTTPClient';
import Forum from '@/libs/types/entities/Forum';
import ForumCategory from '@/libs/types/entities/ForumCategory';
import { createForumInstance, createCategoryInstance } from '@/libs/utils/forum';

// Define Result type since it's not available
interface Result<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Raw API response types with MongoDB fields
interface RawForum {
    _id: string;
    name: string;
    description: string;
    weight: number;
    permission?: string;
    locked: boolean;
    categoryId: string;
    threads: any[];
    lastThread?: any;
    threadAmount: number;
    categoryPermission?: string;
}

interface RawForumCategory {
    _id: string;
    name: string;
    weight: number;
    permission: string;
    forums?: RawForum[];
}

const baseEndpoint = "/forums";

/**
 * Get all forum categories
 */
export async function getAllCategories(client: HTTPClient): Promise<Result<ForumCategory[]>> {
    try {
        const [data, status, error] = await client.GetAsync<RawForumCategory[]>(`${baseEndpoint}/categories`);
        if (error) {
            return {
                success: false,
                error: `Failed to fetch categories: ${error}`
            };
        }
        return {
            success: true,
            data: data?.map((category) => createCategoryInstance({
                id: category._id,
                name: category.name,
                weight: category.weight,
                permission: category.permission,
                forums: category.forums?.map((forum) => createForumInstance({
                    id: forum._id,
                    name: forum.name,
                    description: forum.description,
                    weight: forum.weight,
                    permission: forum.permission,
                    locked: forum.locked,
                    category: category._id,
                    threads: forum.threads || [],
                    threadAmount: forum.threadAmount || 0,
                    lastThread: forum.lastThread,
                    categoryPermission: category.permission
                })) || []
            })) || []
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch categories'
        };
    }
}

/**
 * Get a forum by ID
 */
export async function getForum(client: HTTPClient, id: string, page: number = 1): Promise<Result<Forum>> {
    try {
        const [data, status, error] = await client.GetAsync<RawForum>(`${baseEndpoint}/${id}?page=${page}`);
        if (error) {
            return {
                success: false,
                error: `Failed to fetch forum: ${error}`
            };
        }
        if (!data) {
            return {
                success: false,
                error: 'Forum not found'
            };
        }
        return {
            success: true,
            data: createForumInstance({
                id: data._id,
                name: data.name,
                description: data.description,
                weight: data.weight,
                permission: data.permission,
                locked: data.locked,
                category: data.categoryId,
                threads: data.threads || [],
                threadAmount: data.threadAmount || 0,
                lastThread: data.lastThread,
                categoryPermission: data.categoryPermission
            })
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch forum'
        };
    }
}

/**
 * Create a new forum
 */
export async function createForum(
    client: HTTPClient,
    params: {
        categoryId: string;
        name: string;
        weight: number;
        description: string;
        permission?: string;
        locked?: boolean;
    }
): Promise<Result<void>> {
    try {
        const [_, status, error] = await client.PostAsync(`${baseEndpoint}`, params, true);
        if (error) {
            return {
                success: false,
                error: `Failed to create forum: ${error}`
            };
        }
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create forum'
        };
    }
}

/**
 * Edit an existing forum
 */
export async function editForum(
    client: HTTPClient,
    params: {
        id: string;
        name: string;
        weight: number;
        description: string;
        permission?: string;
        locked?: boolean;
    }
): Promise<Result<void>> {
    try {
        const [_, status, error] = await client.PutAsync(`${baseEndpoint}/${params.id}`, params, true);
        if (error) {
            return {
                success: false,
                error: `Failed to edit forum: ${error}`
            };
        }
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to edit forum'
        };
    }
}

/**
 * Delete a forum
 */
export async function deleteForum(client: HTTPClient, id: string): Promise<Result<void>> {
    try {
        const [_, status, error] = await client.DeleteAsync(`${baseEndpoint}/${id}`, undefined, true);
        if (error) {
            return {
                success: false,
                error: `Failed to delete forum: ${error}`
            };
        }
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete forum'
        };
    }
}

// Additional helper functions
export async function lockForum(client: HTTPClient, id: string): Promise<Result<void>> {
    return editForum(client, { id, name: '', weight: 0, description: '', locked: true });
}

export async function unlockForum(client: HTTPClient, id: string): Promise<Result<void>> {
    return editForum(client, { id, name: '', weight: 0, description: '', locked: false });
}

export async function updateForumPermission(
    client: HTTPClient,
    id: string,
    permission: string
): Promise<Result<void>> {
    return editForum(client, { id, name: '', weight: 0, description: '', permission });
} 