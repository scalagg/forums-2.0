import HTTPClient from '@/libs/HTTPClient';
import ForumCategory from '@/libs/types/entities/ForumCategory';

type Result<T> = [T | null, { status: number; message: string } | null];

const baseEndpoint = "/forum/category";

/**
 * Get all forum categories
 */
export async function getAllCategories(
  client: HTTPClient
): Promise<Result<ForumCategory[]>> {
  try {
    const [data, status, error] = await client.GetAsync<ForumCategory[]>(baseEndpoint);
    if (error) {
      return [null, { status, message: error }];
    }
    return [data, null];
  } catch (error) {
    return [null, { status: 500, message: (error as Error).message }];
  }
}

/**
 * Create a new category
 */
export async function createCategory(
  client: HTTPClient,
  params: {
    name: string;
    weight: number;
    description: string;
    permission?: string;
  }
): Promise<Result<void>> {
  try {
    const body = {
      name: params.name.trim(),
      weight: params.weight,
      description: params.description,
      ...(params.permission && { permission: params.permission })
    };

    const [_, status, error] = await client.PostAsync(baseEndpoint, body, true);
    if (error) {
      return [null, { status, message: error }];
    }
    return [undefined, null];
  } catch (error) {
    return [null, { status: 500, message: (error as Error).message }];
  }
}

/**
 * Edit an existing category
 */
export async function editCategory(
  client: HTTPClient,
  params: {
    id: string;
    name: string;
    weight: number;
    description: string;
    permission?: string;
  }
): Promise<Result<void>> {
  try {
    const body = {
      name: params.name.trim(),
      weight: params.weight,
      description: params.description,
      ...(params.permission && { permission: params.permission })
    };

    const [_, status, error] = await client.PutAsync(`${baseEndpoint}/${params.id}`, body, true);
    if (error) {
      return [null, { status, message: error }];
    }
    return [undefined, null];
  } catch (error) {
    return [null, { status: 500, message: (error as Error).message }];
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(
  client: HTTPClient,
  id: string
): Promise<Result<void>> {
  try {
    const [_, status, error] = await client.DeleteAsync(`${baseEndpoint}/${id}`, undefined, true);
    if (error) {
      return [null, { status, message: error }];
    }
    return [undefined, null];
  } catch (error) {
    return [null, { status: 500, message: (error as Error).message }];
  }
} 