import type { Comment, Post, Vote } from "./types";

export function scoreFor(votes: Vote[], target: "post" | "comment", id: string) {
  let s = 0;
  for (const v of votes) if (v.target === target && v.targetId === id) s += v.value;
  return s;
}

export function userVote(votes: Vote[], userId: string | null, target: "post" | "comment", id: string) {
  if (!userId) return 0;
  const v = votes.find((x) => x.userId === userId && x.target === target && x.targetId === id);
  return v?.value ?? 0;
}

// Hot score: (score) / (age_hours + 2)^1.5
export function hotScore(score: number, createdAt: number) {
  const ageHours = (Date.now() - createdAt) / 36e5;
  return score / Math.pow(ageHours + 2, 1.5);
}

export type SortKey = "hot" | "new" | "top";

export function sortPosts(posts: Post[], votes: Vote[], key: SortKey) {
  const arr = [...posts];
  if (key === "new") arr.sort((a, b) => b.createdAt - a.createdAt);
  else if (key === "top") arr.sort((a, b) => scoreFor(votes, "post", b.id) - scoreFor(votes, "post", a.id));
  else arr.sort((a, b) => hotScore(scoreFor(votes, "post", b.id), b.createdAt) - hotScore(scoreFor(votes, "post", a.id), a.createdAt));
  return arr;
}

export function userKarma(posts: Post[], comments: Comment[], votes: Vote[], userId: string) {
  let k = 0;
  for (const p of posts) if (p.authorId === userId) k += scoreFor(votes, "post", p.id);
  for (const c of comments) if (c.authorId === userId) k += scoreFor(votes, "comment", c.id);
  return k;
}

export interface CommentNode extends Comment {
  children: CommentNode[];
}

export type CommentSort = "best" | "new" | "old" | "top";

export function buildCommentTree(comments: Comment[], postId: string, votes: Vote[] = [], sort: CommentSort = "best"): CommentNode[] {
  const list = comments.filter((c) => c.postId === postId);
  const map = new Map<string, CommentNode>();
  list.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: CommentNode[] = [];
  list.forEach((c) => {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) map.get(c.parentId)!.children.push(node);
    else roots.push(node);
  });
  const cmp = (a: CommentNode, b: CommentNode) => {
    if (sort === "new") return b.createdAt - a.createdAt;
    if (sort === "old") return a.createdAt - b.createdAt;
    if (sort === "top") return scoreFor(votes, "comment", b.id) - scoreFor(votes, "comment", a.id);
    // best: score then recency
    const ds = scoreFor(votes, "comment", b.id) - scoreFor(votes, "comment", a.id);
    return ds !== 0 ? ds : b.createdAt - a.createdAt;
  };
  const sortRec = (nodes: CommentNode[]) => {
    nodes.sort(cmp);
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}
