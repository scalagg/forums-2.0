
'use server';

import HTTPClient from "@/libs/HTTPClient";
import { Forum } from "@/types/api";

const baseEndpoint = "/forum/forum";

// Active API Methods
export async function getForum(client: HTTPClient, id: string): Promise<Forum | null> {
  const [forum] = await client.GetAsync<Forum>(`${baseEndpoint}/${id}`);
  return forum;
}

export async function createForum(
  client: HTTPClient,
  forumData: { id: string; name: string; description: string; category: string }
): Promise<Forum | null> {
  const [newForum] = await client.PostAsync<Forum>(`${baseEndpoint}/create/${forumData.id}`, forumData);
  return newForum;
}

export async function updateForum(
  client: HTTPClient,
  id: string,
  forum: { name?: string; description?: string; category?: string }
): Promise<Forum | null> {
  const [updatedForum] = await client.PostAsync<Forum>(`${baseEndpoint}/edit/${id}`, forum);
  return updatedForum;
}

export async function deleteForum(client: HTTPClient, id: string): Promise<boolean> {
  const [, status] = await client.PostAsync(`${baseEndpoint}/delete/${id}`);
  return status === 200;
} 