import HTTPClient from "@/libs/HTTPClient";
import { Profile, PrivacySettings } from "@/types/api";

export default class ProfileService {
  private readonly client: HTTPClient;
  private readonly baseEndpoint = "/profile";

  constructor(client: HTTPClient) {
    this.client = client;
  }

  // Profile Management
  async getProfile(uuid: string): Promise<Profile | null> {
    const [profile] = await this.client.GetAsync<Profile>(`${this.baseEndpoint}/${uuid}`);
    return profile;
  }

  // Social Media Settings
  async updateSocials(uuid: string, socials: {
    discord?: string;
    twitter?: string;
    youtube?: string;
    twitch?: string;
  }): Promise<boolean> {
    const [, status] = await this.client.PostAsync(`${this.baseEndpoint}/updateSocials`, {
      uuid,
      ...socials
    });
    return status === 200;
  }

  // Privacy Settings
  async updatePrivacySettings(uuid: string, settings: Partial<PrivacySettings>): Promise<boolean> {
    const [, status] = await this.client.PostAsync(`${this.baseEndpoint}/updatePrivacySettings`, {
      uuid,
      ...settings
    });
    return status === 200;
  }

  // Profile Comments
  async addComment(profileId: string, comment: { author: string; content: string }): Promise<boolean> {
    const [, status] = await this.client.PostAsync(`${this.baseEndpoint}/comment`, {
      profileId,
      ...comment
    });
    return status === 200;
  }

  async deleteComment(profileId: string, commentId: string): Promise<boolean> {
    const [, status] = await this.client.PostAsync(`${this.baseEndpoint}/comment/delete`, {
      profileId,
      commentId
    });
    return status === 200;
  }

  // Punishments
  async getPunishments(uuid: string): Promise<any[]> {
    const [punishments] = await this.client.GetAsync<any[]>(`/punishment/profile/${uuid}`);
    return punishments || [];
  }

  // Grants
  async getGrants(uuid: string): Promise<any[]> {
    const [grants] = await this.client.GetAsync<any[]>(`/grant/profile/${uuid}`);
    return grants || [];
  }

  // Legacy Methods (Kept for backward compatibility)
  // TODO: Remove these once we fully migrate to the new API
  /*
  async getServerProfile(uuid: string): Promise<string | null> {
    const [profile] = await this.client.GetAsync<any>(`/profile/server/${uuid}`);
    return profile?.displayName || null;
  }
  */
} 