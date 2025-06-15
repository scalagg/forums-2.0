'use server';

import HTTPClient from "@/libs/HTTPClient";
import { Forum } from "@/types/api";

export default class ForumService {
  private readonly client: HTTPClient;
  private readonly baseEndpoint = "/forum/forum";

  constructor(client: HTTPClient) {
    this.client = client;
  }

  // Active API Methods
  async getForum(id: string): Promise<Forum | null> {
    const [forum] = await this.client.GetAsync<Forum>(`${this.baseEndpoint}/${id}`);
    return forum;
  }

  async createForum(forumData: { id: string; name: string; description: string; category: string }): Promise<Forum | null> {
    const [newForum] = await this.client.PostAsync<Forum>(`${this.baseEndpoint}/create/${forumData.id}`, forumData);
    return newForum;
  }

  async updateForum(id: string, forum: { name?: string; description?: string; category?: string }): Promise<Forum | null> {
    const [updatedForum] = await this.client.PostAsync<Forum>(`${this.baseEndpoint}/edit/${id}`, forum);
    return updatedForum;
  }

  async deleteForum(id: string): Promise<boolean> {
    const [, status] = await this.client.PostAsync(`${this.baseEndpoint}/delete/${id}`);
    return status === 200;
  }

  // Legacy Methods (Kept for backward compatibility)
  // TODO: Remove these once we fully migrate to the new API
  /*
  async getForum(id: string): Promise<Forum | null> {
    const [forum] = await this.client.GetAsync<Forum>(`/forum/forum/${id}`);
    return forum;
  }

  async createForum(forumData: Partial<Forum>): Promise<Forum | null> {
    const [newForum] = await this.client.PostAsync<Forum>(`/forum/forum`, forumData);
    return newForum;
  }

  async updateForum(id: string, forum: Partial<Forum>): Promise<Forum | null> {
    const [updatedForum] = await this.client.PutAsync<Forum>(`/forum/forum/${id}`, forum);
    return updatedForum;
  }

  async deleteForum(id: string): Promise<boolean> {
    const [, status] = await this.client.DeleteAsync(`/forum/forum/${id}`);
    return status === 200;
  }
  */
}
