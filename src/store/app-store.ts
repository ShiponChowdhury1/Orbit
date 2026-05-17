import { create } from "zustand";
import type {
  Comment,
  Community,
  CommunityRule,
  Notification,
  Post,
  PostFlair,
  Report,
  ResetToken,
  SavedRef,
  User,
  Vote,
  VoteValue,
  MediaType,
} from "@/lib/types";
import { uid } from "@/lib/id";
import { seedData } from "@/lib/seed";
import { hashPassword, randomToken, verifyPassword } from "@/lib/hash";

interface AppState {
  hydrated: boolean;
  currentUserId: string | null;
  users: User[];
  communities: Community[];
  posts: Post[];
  comments: Comment[];
  votes: Vote[];
  notifications: Notification[];
  saved: SavedRef[];
  reports: Report[];
  resetTokens: ResetToken[];
  theme: "light" | "dark";

  setHydrated: (b: boolean) => void;
  resetSeed: () => void;
  toggleTheme: () => void;

  // auth
  signup: (data: {
    email: string;
    username: string;
    password: string;
    avatar?: string;
    bio?: string;
  }) => { ok: true; user: User } | { ok: false; error: string };
  loginWithEmail: (
    email: string,
    password: string,
  ) => { ok: true; user: User } | { ok: false; error: string };
  logout: () => void;
  requestPasswordReset: (
    email: string,
  ) => { ok: true; token: string } | { ok: false; error: string };
  resetPassword: (
    token: string,
    newPassword: string,
  ) => { ok: true } | { ok: false; error: string };
  changePassword: (current: string, next: string) => { ok: true } | { ok: false; error: string };
  updateProfile: (patch: {
    username?: string;
    bio?: string;
    avatar?: string;
  }) => { ok: true; user: User } | { ok: false; error: string };

  // legacy quick switch (kept for dev)
  switchUser: (userId: string) => void;

  // communities
  createCommunity: (
    data: Omit<Community, "id" | "createdAt" | "members" | "ownerId"> & { ownerId?: string },
  ) => Community;
  toggleJoin: (communityId: string) => void;
  addCommunityRule: (communityId: string, rule: Omit<CommunityRule, "id">) => void;
  removeCommunityRule: (communityId: string, ruleId: string) => void;
  updateCommunity: (
    id: string,
    patch: Partial<Pick<Community, "title" | "description" | "icon" | "color" | "nsfw">>,
  ) => void;

  // posts
  createPost: (data: {
    communityId: string;
    title: string;
    body: string;
    mediaUrl?: string;
    mediaType?: MediaType;
    nsfw?: boolean;
    spoiler?: boolean;
    flair?: PostFlair;
  }) => Post | null;
  updatePost: (
    id: string,
    patch: Partial<
      Pick<Post, "title" | "body" | "mediaUrl" | "mediaType" | "nsfw" | "spoiler" | "flair">
    >,
  ) => void;
  deletePost: (id: string) => void;
  toggleSave: (postId: string) => void;
  togglePostLock: (postId: string) => void;
  togglePostPin: (postId: string) => void;
  toggleHidePost: (postId: string) => void;

  // social
  toggleFollow: (userId: string) => void;

  // comments
  addComment: (postId: string, body: string, parentId?: string | null) => Comment | null;
  updateComment: (id: string, body: string) => void;
  deleteComment: (id: string) => void;

  // voting
  vote: (target: "post" | "comment", targetId: string, value: VoteValue) => void;

  // notifications
  pushNotification: (
    userId: string,
    n: Omit<Notification, "id" | "userId" | "createdAt" | "read">,
  ) => void;
  markAllRead: () => void;

  // moderation
  reportItem: (target: Report["target"], targetId: string, reason: string) => void;
  banUser: (userId: string) => void;
}

const seed = seedData();

export const useAppStore = create<AppState>()((set, get) => ({
  hydrated: false,
  currentUserId: null,
  users: seed.users,
  communities: seed.communities,
  posts: seed.posts,
  comments: seed.comments,
  votes: seed.votes,
  notifications: [],
  saved: [],
  reports: [],
  resetTokens: [],
  theme: "dark",

  setHydrated: (b) => set({ hydrated: b }),
  resetSeed: () => {
    const s = seedData();
    set({
      users: s.users,
      communities: s.communities,
      posts: s.posts,
      comments: s.comments,
      votes: s.votes,
      notifications: [],
      saved: [],
      reports: [],
      resetTokens: [],
      currentUserId: null,
    });
  },

  toggleTheme: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),

  signup: ({ email, username, password, avatar, bio }) => {
    const e = email.trim().toLowerCase();
    const u = username.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { ok: false, error: "Invalid email." };
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(u))
      return { ok: false, error: "Username must be 3–20 chars (letters, numbers, _)." };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    const state = get();
    if (state.users.some((x) => x.email?.toLowerCase() === e))
      return { ok: false, error: "Email already in use." };
    if (state.users.some((x) => x.username.toLowerCase() === u.toLowerCase()))
      return { ok: false, error: "Username taken." };
    const user: User = {
      id: uid("u_"),
      username: u,
      email: e,
      passwordHash: hashPassword(password),
      avatar: avatar || "🙂",
      bio: bio || "",
      createdAt: Date.now(),
    };
    set((s) => ({ users: [...s.users, user], currentUserId: user.id }));
    return { ok: true, user };
  },

  loginWithEmail: (email, password) => {
    const e = email.trim().toLowerCase();
    const user = get().users.find((x) => x.email?.toLowerCase() === e);
    if (!user || !user.passwordHash)
      return { ok: false, error: "No account found for this email." };
    if (user.banned) return { ok: false, error: "This account is banned." };
    if (!verifyPassword(password, user.passwordHash))
      return { ok: false, error: "Incorrect password." };
    set({ currentUserId: user.id });
    return { ok: true, user };
  },

  logout: () => set({ currentUserId: null }),

  requestPasswordReset: (email) => {
    const e = email.trim().toLowerCase();
    const user = get().users.find((x) => x.email?.toLowerCase() === e);
    if (!user) return { ok: false, error: "No account found for this email." };
    const token = randomToken();
    const rt: ResetToken = { token, userId: user.id, expiresAt: Date.now() + 1000 * 60 * 30 };
    set((s) => ({ resetTokens: [...s.resetTokens.filter((t) => t.userId !== user.id), rt] }));
    return { ok: true, token };
  },

  resetPassword: (token, newPassword) => {
    if (newPassword.length < 6)
      return { ok: false, error: "Password must be at least 6 characters." };
    const rt = get().resetTokens.find((t) => t.token === token);
    if (!rt) return { ok: false, error: "Invalid token." };
    if (rt.expiresAt < Date.now()) return { ok: false, error: "Token expired." };
    set((s) => ({
      users: s.users.map((u) =>
        u.id === rt.userId ? { ...u, passwordHash: hashPassword(newPassword) } : u,
      ),
      resetTokens: s.resetTokens.filter((t) => t.token !== token),
    }));
    return { ok: true };
  },

  changePassword: (current, next) => {
    const me = get().currentUserId;
    const user = get().users.find((u) => u.id === me);
    if (!user || !user.passwordHash) return { ok: false, error: "Not signed in." };
    if (!verifyPassword(current, user.passwordHash))
      return { ok: false, error: "Current password is incorrect." };
    if (next.length < 6) return { ok: false, error: "New password must be at least 6 characters." };
    set((s) => ({
      users: s.users.map((u) =>
        u.id === user.id ? { ...u, passwordHash: hashPassword(next) } : u,
      ),
    }));
    return { ok: true };
  },

  updateProfile: (patch) => {
    const me = get().currentUserId;
    const user = get().users.find((u) => u.id === me);
    if (!user) return { ok: false, error: "Not signed in." };
    if (patch.username) {
      const u = patch.username.trim();
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(u)) return { ok: false, error: "Invalid username." };
      if (get().users.some((x) => x.id !== user.id && x.username.toLowerCase() === u.toLowerCase()))
        return { ok: false, error: "Username taken." };
    }
    const updated: User = {
      ...user,
      username: patch.username?.trim() ?? user.username,
      bio: patch.bio ?? user.bio,
      avatar: patch.avatar ?? user.avatar,
    };
    set((s) => ({ users: s.users.map((u) => (u.id === user.id ? updated : u)) }));
    return { ok: true, user: updated };
  },

  switchUser: (userId) => set({ currentUserId: userId }),

  createCommunity: (data) => {
    const me = get().currentUserId;
    const owner = data.ownerId || me || get().users[0]?.id;
    const c: Community = {
      id: uid("c_"),
      name: data.name.toLowerCase().replace(/\s+/g, "-"),
      title: data.title,
      description: data.description,
      icon: data.icon || "✨",
      color: data.color || "#a3e635",
      ownerId: owner,
      members: [owner],
      createdAt: Date.now(),
    };
    set((s) => ({ communities: [c, ...s.communities] }));
    return c;
  },
  toggleJoin: (communityId) => {
    const me = get().currentUserId;
    if (!me) return;
    set((s) => ({
      communities: s.communities.map((c) =>
        c.id === communityId
          ? {
              ...c,
              members: c.members.includes(me)
                ? c.members.filter((u) => u !== me)
                : [...c.members, me],
            }
          : c,
      ),
    }));
  },
  addCommunityRule: (communityId, rule) =>
    set((s) => ({
      communities: s.communities.map((c) =>
        c.id === communityId
          ? { ...c, rules: [...(c.rules ?? []), { id: uid("rl_"), ...rule }] }
          : c,
      ),
    })),
  removeCommunityRule: (communityId, ruleId) =>
    set((s) => ({
      communities: s.communities.map((c) =>
        c.id === communityId ? { ...c, rules: (c.rules ?? []).filter((r) => r.id !== ruleId) } : c,
      ),
    })),
  updateCommunity: (id, patch) =>
    set((s) => ({ communities: s.communities.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),

  createPost: ({ communityId, title, body, mediaUrl, mediaType, nsfw, spoiler, flair }) => {
    const me = get().currentUserId;
    if (!me) return null;
    const p: Post = {
      id: uid("p_"),
      communityId,
      authorId: me,
      title,
      body,
      mediaUrl,
      mediaType,
      nsfw,
      spoiler,
      flair,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ posts: [p, ...s.posts] }));
    return p;
  },
  updatePost: (id, patch) =>
    set((s) => ({
      posts: s.posts.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p)),
    })),
  deletePost: (id) =>
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === id
          ? { ...p, deleted: true, body: "", title: "[deleted]", mediaUrl: undefined }
          : p,
      ),
    })),
  toggleSave: (postId) => {
    const me = get().currentUserId;
    if (!me) return;
    set((s) => {
      const exists = s.saved.find((x) => x.userId === me && x.postId === postId);
      return {
        saved: exists ? s.saved.filter((x) => x !== exists) : [...s.saved, { userId: me, postId }],
      };
    });
  },
  togglePostLock: (postId) =>
    set((s) => ({
      posts: s.posts.map((p) => (p.id === postId ? { ...p, locked: !p.locked } : p)),
    })),
  togglePostPin: (postId) =>
    set((s) => ({
      posts: s.posts.map((p) => (p.id === postId ? { ...p, pinned: !p.pinned } : p)),
    })),
  toggleHidePost: (postId) => {
    const me = get().currentUserId;
    if (!me) return;
    set((s) => ({
      users: s.users.map((u) => {
        if (u.id !== me) return u;
        const hidden = u.hiddenPosts ?? [];
        return {
          ...u,
          hiddenPosts: hidden.includes(postId)
            ? hidden.filter((x) => x !== postId)
            : [...hidden, postId],
        };
      }),
    }));
  },

  toggleFollow: (userId) => {
    const me = get().currentUserId;
    if (!me || me === userId) return;
    set((s) => ({
      users: s.users.map((u) => {
        if (u.id !== me) return u;
        const f = u.following ?? [];
        return {
          ...u,
          following: f.includes(userId) ? f.filter((x) => x !== userId) : [...f, userId],
        };
      }),
    }));
  },

  addComment: (postId, body, parentId = null) => {
    const me = get().currentUserId;
    if (!me) return null;
    const c: Comment = {
      id: uid("cm_"),
      postId,
      parentId,
      authorId: me,
      body,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ comments: [...s.comments, c] }));
    const post = get().posts.find((p) => p.id === postId);
    if (post && post.authorId !== me) {
      get().pushNotification(post.authorId, {
        kind: "comment",
        message: `New reply on "${post.title}"`,
        link: `/post/${post.id}`,
      });
    }
    return c;
  },
  updateComment: (id, body) =>
    set((s) => ({
      comments: s.comments.map((c) => (c.id === id ? { ...c, body, updatedAt: Date.now() } : c)),
    })),
  deleteComment: (id) =>
    set((s) => ({
      comments: s.comments.map((c) =>
        c.id === id ? { ...c, deleted: true, body: "[deleted]" } : c,
      ),
    })),

  vote: (target, targetId, value) => {
    const me = get().currentUserId;
    if (!me) return;
    const key = `${me}:${target}:${targetId}`;
    set((s) => {
      const existing = s.votes.find((v) => v.id === key);
      let next: Vote[];
      if (!existing) next = [...s.votes, { id: key, userId: me, target, targetId, value }];
      else if (existing.value === value) next = s.votes.filter((v) => v.id !== key);
      else next = s.votes.map((v) => (v.id === key ? { ...v, value } : v));
      return { votes: next };
    });
    if (value === 1) {
      if (target === "post") {
        const p = get().posts.find((x) => x.id === targetId);
        if (p && p.authorId !== me)
          get().pushNotification(p.authorId, {
            kind: "vote",
            message: `Your post got an upvote`,
            link: `/post/${p.id}`,
          });
      } else {
        const c = get().comments.find((x) => x.id === targetId);
        if (c && c.authorId !== me)
          get().pushNotification(c.authorId, {
            kind: "vote",
            message: `Your comment got an upvote`,
            link: `/post/${c.postId}`,
          });
      }
    }
  },

  pushNotification: (userId, n) =>
    set((s) => ({
      notifications: [
        { id: uid("n_"), userId, createdAt: Date.now(), read: false, ...n },
        ...s.notifications,
      ].slice(0, 200),
    })),
  markAllRead: () => {
    const me = get().currentUserId;
    if (!me) return;
    set((s) => ({
      notifications: s.notifications.map((n) => (n.userId === me ? { ...n, read: true } : n)),
    }));
  },

  reportItem: (target, targetId, reason) => {
    const me = get().currentUserId;
    if (!me) return;
    set((s) => ({
      reports: [
        { id: uid("r_"), reporterId: me, target, targetId, reason, createdAt: Date.now() },
        ...s.reports,
      ],
      posts:
        target === "post"
          ? s.posts.map((p) =>
              p.id === targetId ? { ...p, flaggedCount: (p.flaggedCount ?? 0) + 1 } : p,
            )
          : s.posts,
    }));
  },
  banUser: (userId) =>
    set((s) => ({
      users: s.users.map((u) => (u.id === userId ? { ...u, banned: !u.banned } : u)),
    })),
}));

// Manual localStorage sync (browser-only).
const STORAGE_KEY = "orbit-app-v2";
const PERSISTED_KEYS: (keyof AppState)[] = [
  "currentUserId",
  "users",
  "communities",
  "posts",
  "comments",
  "votes",
  "notifications",
  "saved",
  "reports",
  "resetTokens",
  "theme",
];

export function loadPersistedState() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const patch: Partial<AppState> = {};
      for (const k of PERSISTED_KEYS)
        if (k in parsed) (patch as Record<string, unknown>)[k] = parsed[k];
      useAppStore.setState(patch);
    }
  } catch (e) {
    console.warn("Failed to load persisted state", e);
  }
  useAppStore.setState({ hydrated: true });

  useAppStore.subscribe((state) => {
    try {
      const snapshot: Record<string, unknown> = {};
      for (const k of PERSISTED_KEYS) snapshot[k] = state[k];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      /* ignore */
    }
  });
}
