import HTTPClient from "@/libs/HTTPClient";
import { Badge } from "@/types/api";

export default class BadgeService {
  private readonly client: HTTPClient;
  private readonly baseEndpoint = "/forum/account/badge";

  constructor(client: HTTPClient) {
    this.client = client;
  }

  // Badge Management
  async getBadges(uuid: string): Promise<Badge[]> {
    const [badges] = await this.client.GetAsync<Badge[]>(`${this.baseEndpoint}/${uuid}`);
    return badges || [];
  }

  async giveBadge(uuid: string, badgeId: string, reason: string): Promise<boolean> {
    const [, status] = await this.client.PostAsync(`${this.baseEndpoint}/give`, {
      uuid,
      badgeId,
      reason
    });
    return status === 200;
  }

  async removeBadge(uuid: string, badgeId: string, reason: string): Promise<boolean> {
    const [, status] = await this.client.PostAsync(`${this.baseEndpoint}/remove`, {
      uuid,
      badgeId,
      reason
    });
    return status === 200;
  }

  async getAllAvailableBadges(): Promise<Badge[]> {
    const [badges] = await this.client.GetAsync<Badge[]>(`${this.baseEndpoint}/list`);
    return badges || [];
  }
} 