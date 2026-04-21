// User & Auth
export interface Profile {
  id: string;
  email: string;
  displayName: string;
  department?: string;
  jobTitle?: string;
  avatarUrl?: string;
  trustScore: number;
  isVerified: boolean;
  anonymousSeed: string;
  createdAt: Date;
  updatedAt: Date;
}

// Channels
export interface Channel {
  id: string;
  slug: string;
  name: string;
  description?: string;
  iconUrl?: string;
  isPrivate: boolean;
  memberCount: number;
  postCount: number;
  createdBy: string;
  createdAt: Date;
}

// Posts
export interface Post {
  id: string;
  channelId: string;
  authorId: string;
  isAnonymous: boolean;
  anonAlias?: string;
  title?: string;
  content: string;
  contentType: 'text' | 'image' | 'link';
  mediaUrls: string[];
  linkUrl?: string;
  linkPreview?: Record<string, any>;
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  viewCount: number;
  flair?: string;
  isPinned: boolean;
  isDeleted: boolean;
  hotScore: number;
  createdAt: Date;
  updatedAt: Date;
}

// Comments
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  parentId?: string;
  isAnonymous: boolean;
  anonNumber?: number;
  content: string;
  upvoteCount: number;
  isDeleted: boolean;
  depth: number;
  createdAt: Date;
}

// Votes
export type VoteType = 'up' | 'down';
export type TargetType = 'post' | 'comment';

export interface Vote {
  id: string;
  userId: string;
  targetType: TargetType;
  targetId: string;
  voteType: VoteType;
  createdAt: Date;
}

// Reactions
export type ReactionEmoji = 'like' | 'heart' | 'laugh' | 'wow' | 'sad' | 'angry';

export interface Reaction {
  id: string;
  userId: string;
  postId?: string;
  commentId?: string;
  emoji: ReactionEmoji;
  createdAt: Date;
}

// Notifications
export type NotificationType = 'comment' | 'vote' | 'mention' | 'system';

export interface Notification {
  id: string;
  recipientId: string;
  actorId?: string;
  type: NotificationType;
  targetType?: 'post' | 'comment';
  targetId?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Reports
export type ReportReason = 'spam' | 'hate' | 'inappropriate' | 'other';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'post' | 'comment' | 'user';
  targetId: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  createdAt: Date;
}
