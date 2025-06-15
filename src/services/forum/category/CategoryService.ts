'use server';

import HTTPClient from "@/libs/HTTPClient";
import { ForumCategory } from "@/types/api";

export default class CategoryService {
  private readonly client: HTTPClient;
  private readonly baseEndpoint = "/forum/category";

  constructor(client: HTTPClient) {
    this.client = client;
  }

  // Active API Methods
  async getAllCategories(): Promise<ForumCategory[]> {
    const [categories] = await this.client.GetAsync<ForumCategory[]>(this.baseEndpoint);
    return categories || [];
  }

  async createCategory(category: { name: string; weight: number }): Promise<ForumCategory | null> {
    const [newCategory] = await this.client.PostAsync<ForumCategory>(`${this.baseEndpoint}/create`, category);
    return newCategory;
  }

  async updateCategory(id: string, category: { name: string; weight: number }): Promise<ForumCategory | null> {
    const [updatedCategory] = await this.client.PostAsync<ForumCategory>(`${this.baseEndpoint}/edit/${id}`, category);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const [, status] = await this.client.PostAsync(`${this.baseEndpoint}/delete/${id}`);
    return status === 200;
  }

  // Legacy Methods (Kept for backward compatibility)
  // TODO: Remove these once we fully migrate to the new API
  /*
  async getCategories(): Promise<ForumCategory[]> {
    const [categories] = await this.client.GetAsync<ForumCategory[]>(`/forum/category`);
    return categories || [];
  }

  async createCategory(category: { id: string; name: string; weight: number }): Promise<ForumCategory | null> {
    const [newCategory] = await this.client.PostAsync<ForumCategory>(`/forum/category`, category);
    return newCategory;
  }

  async updateCategory(id: string, category: { name: string; weight: number }): Promise<ForumCategory | null> {
    const [updatedCategory] = await this.client.PostAsync<ForumCategory>(`/forum/category/${id}`, category);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const [, status] = await this.client.DeleteAsync(`/forum/category/${id}`);
    return status === 200;
  }
  */
}