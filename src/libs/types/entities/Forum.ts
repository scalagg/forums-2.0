import Thread from "./Thread";

export default interface Forum {
  id: string;
  name: string;
  description: string;
  weight: number;
  permission?: string;
  locked: boolean;
  category: string;
  threads: Thread[];
  lastThread?: Thread;
  threadAmount: number;
  categoryPermission?: string;

  // Helper methods
  getUrlName(): string;
  canPost(profile: any): boolean;
}
