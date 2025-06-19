// New API Types
// Updated to match the structure from the old Scala site

// Forum Types
export interface ForumCategory {
  id: string;
  name: string;
  weight: number;
  permission?: string;
  forums: Forum[];
}

export interface Forum {
  id: string;
  name: string;
  description: string;
  category: string;
  weight: number;
  permission?: string;
  locked: boolean;
  threadCount: number;
  replyCount: number;
  lastThread?: Thread;
  categoryPermission?: string;
}

export interface Thread {
  _id: string;
  id: string;
  title: string;
  body: string;
  forum: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  locked?: boolean;
  replies: ThreadReply[];
}

export interface ThreadReply {
  _id: string;
  id: string;
  threadId: string;
  forum: string;
  body: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

// Account Types
export interface Account {
  uuid: string;
  username: string;
  email: string;
  password?: string; // Only used in registration/login
  settings?: AccountSettings;
  // TODO: Add any new fields from the Scala API
}

export interface AccountSettings {
  privacy: PrivacySettings;
  // TODO: Add any new fields from the Scala API
}

export interface PrivacySettings {
  // TODO: Define privacy settings from the Scala API
}

// Ticket Types
export interface Ticket {
  id: string;
  title: string;
  body: string;
  category: string;
  author: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  // TODO: Add any new fields from the Scala API
}

export enum TicketStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  PENDING = "PENDING",
  // TODO: Add any new statuses from the Scala API
}

// Profile Types
export interface Profile {
  uuid: string;
  username: string;
  displayName?: string;
  badges?: Badge[];
  // TODO: Add any new fields from the Scala API
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  // TODO: Add any new fields from the Scala API
}

// Notification Types
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  // TODO: Add any new fields from the Scala API
}

export enum NotificationType {
  // TODO: Define notification types from the Scala API
}

// Legacy Types (Kept for backward compatibility)
// TODO: These should be removed once we fully migrate to the new API
export interface WebEntry {
  id: string;
  value: any;
}

export interface TextFilter {
  id: string;
  pattern: string;
  replacement: string;
}

export interface SkywarsStats {
  // TODO: Define if this is still needed
}

export interface Punishment {
  // TODO: Define if this is still needed
}

// Leaderboard Types
export interface LeaderboardEntry {
  uuid: string;
  value: string;
  webColor: string;
  resolvedName: string;
}

export interface LeaderboardModel {
  name: string;
  entries: Record<string, LeaderboardEntry[]>;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// API Error Types
export interface ApiError {
  status: number;
  message: string;
  // TODO: Add any new error fields from the Scala API
} 