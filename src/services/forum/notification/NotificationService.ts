import HTTPClient from "@/libs/HTTPClient";
import { Notification } from "@/types/api";

export default class NotificationService {
  private readonly client: HTTPClient;
  private readonly baseEndpoint = "/forum/notifications";

  constructor(client: HTTPClient) {
    this.client = client;
  }

  // Notification Management
  async getNotifications(page: number = 1): Promise<Notification[]> {
    const [notifications] = await this.client.GetAsync<Notification[]>(`${this.baseEndpoint}?page=${page}`);
    return notifications || [];
  }

  async markAsRead(notificationIds: string[]): Promise<boolean> {
    const [, status] = await this.client.PostAsync(`${this.baseEndpoint}/read`, {
      notifications: notificationIds
    });
    return status === 200;
  }

  async markAllAsRead(): Promise<boolean> {
    const [, status] = await this.client.PostAsync(`${this.baseEndpoint}/read/all`);
    return status === 200;
  }

  async getUnreadCount(): Promise<number> {
    const [count] = await this.client.GetAsync<{ count: number }>(`${this.baseEndpoint}/unread/count`);
    return count?.count || 0;
  }
} 