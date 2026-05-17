export type ID = string;

export interface User {
  id: ID;
  username: string;
  email?: string;
  passwordHash?: string;
  avatar: string; // emoji or data URL
  bio: string;
  createdAt: number;
  banned?: boolean;
  following?: ID[]; // user ids this user follows
  hiddenPosts?: ID[]; // post ids the user has hidden
}

export interface CommunityRule {
  id: ID;
  title: string;
  description?: string;
}

export interface Community {
  id: ID;
  name: string; // slug
  title: string;
  description: string;
  icon: string; // emoji
  color: string; // hex/oklch
  ownerId: ID;
  members: ID[];
  createdAt: number;
  nsfw?: boolean;
  rules?: CommunityRule[];
  moderators?: ID[]; // additional mods besides owner
}

export type MediaType = "image" | "video";

export interface PostFlair {
  label: string;
  color: string;
}

export interface Post {
  id: ID;
  communityId: ID;
  authorId: ID;
  title: string;
  body: string; // HTML (sanitized on render)
  imageUrl?: string; // legacy
  mediaUrl?: string;
  mediaType?: MediaType;
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
  // moderation-ready
  flaggedCount?: number;
  locked?: boolean;
  pinned?: boolean;
  nsfw?: boolean;
  spoiler?: boolean;
  flair?: PostFlair;
}

export interface Comment {
  id: ID;
  postId: ID;
  parentId: ID | null;
  authorId: ID;
  body: string;
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
}

export type VoteValue = 1 | -1 | 0;
export type VoteTarget = "post" | "comment";

export interface Vote {
  id: ID;
  userId: ID;
  target: VoteTarget;
  targetId: ID;
  value: VoteValue;
}

export interface Notification {
  id: ID;
  userId: ID;
  kind: "vote" | "comment" | "mention" | "system";
  message: string;
  link?: string;
  createdAt: number;
  read: boolean;
}

export interface SavedRef {
  userId: ID;
  postId: ID;
}

export interface Report {
  id: ID;
  reporterId: ID;
  target: "post" | "comment" | "user";
  targetId: ID;
  reason: string;
  createdAt: number;
}

export interface ResetToken {
  token: string;
  userId: ID;
  expiresAt: number;
}
