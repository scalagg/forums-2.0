import Forum from "./Forum";

export default interface ForumCategory {
  id: string;
  name: string;
  weight: number;
  permission: string;
  forums: Forum[];

  // Helper methods
  getUrlName(): string;
  getFormattedForums(profile: any): Forum[];
  canPost(profile: any): boolean;
  hasPermission(profile: any): boolean;
}