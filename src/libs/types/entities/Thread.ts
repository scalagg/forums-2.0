import { UUID } from '@/libs/types/UUID';
import { ProfileModel } from './ProfileModel';
import { ReplyModel } from './ReplyModel';

export default interface Thread {
  id: string;
  title: string;
  body: string;
  forum: string;
  forumName: string;
  author: UUID;
  authorName: string;
  authorWebColor: string;
  createdAt: number;
  lastEditedBy?: UUID;
  lastEditedAt: number;
  lastReplyAt: number;
  pinned: boolean;
  locked: boolean;
  parentThreadId?: string;
  forumPermission?: string;
  imageUrl: string;
  seenBy: UUID[];

  // Helper methods
  getLastReply(): ReplyModel | null;
  getReplies(): ReplyModel[];
  getFormattedForum(): string;
  getLastReplyAgo(): string;
  getLastEditedAgo(): string;
  getPostedAgo(): string;
  canDelete(profile: ProfileModel): boolean;
  canEdit(profile: ProfileModel): boolean;
  canLock(profile: ProfileModel): boolean;
  hasSeen(profile: ProfileModel): boolean;
  getContent(): string;
}