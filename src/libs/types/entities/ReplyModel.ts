import { UUID } from '@/libs/types/UUID';
import { ProfileModel } from './ProfileModel';

export interface ReplyModel {
  uuid: UUID;
  author: UUID;
  authorWebColor: string;
  thread: string;
  comment: string;
  createdAt: number;
  lastEditedAt: number;
  parentReply?: UUID;
  replies: ReplyModel[];
  allSubReplies: Map<ReplyModel, number>;

  // Helper methods
  getAuthorName(): string;
  getPostedAgo(): string;
  canDelete(profile: ProfileModel): boolean;
  fetchSubReplies(step: number): Map<ReplyModel, number>;
  getSortedReplies(): ReplyModel[];
} 