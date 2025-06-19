'use server';

import HTTPClient from "@/libs/HTTPClient";
import { ForumCategory } from "@/types/api";

const baseEndpoint = "/forum/category";

// Active API Methods
export async function getAllCategories(client: HTTPClient): Promise<ForumCategory[]> {
  const [categories] = await client.GetAsync<ForumCategory[]>(baseEndpoint);
  return categories || [];
}

export async function createCategory(
  client: HTTPClient,
  category: { name: string; weight: number }
): Promise<ForumCategory | null> {
  const [newCategory] = await client.PostAsync<ForumCategory>(`${baseEndpoint}/create`, category);
  return newCategory;
}

export async function updateCategory(
  client: HTTPClient,
  id: string,
  category: { name: string; weight: number }
): Promise<ForumCategory | null> {
  const [updatedCategory] = await client.PostAsync<ForumCategory>(`${baseEndpoint}/edit/${id}`, category);
  return updatedCategory;
}

export async function deleteCategory(client: HTTPClient, id: string): Promise<boolean> {
  const [, status] = await client.PostAsync(`${baseEndpoint}/delete/${id}`);
  return status === 200;
}

// Aliases for backward compatibility
export const GetForumCategories = getAllCategories;
export const CreateForumCategory = createCategory;
export const EditForumCategory = updateCategory;
export const DeleteForumCategory = deleteCategory; 