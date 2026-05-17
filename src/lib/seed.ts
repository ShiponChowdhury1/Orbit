import type { Comment, Community, Post, User, Vote } from "./types";
import { uid } from "./id";

export function seedData() {
  const users: User[] = [
    { id: "u_nova", username: "nova", avatar: "🦊", bio: "Designer & founder.", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90 },
    { id: "u_atlas", username: "atlas", avatar: "🐺", bio: "ML engineer. Builder.", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 70 },
    { id: "u_lyra", username: "lyra", avatar: "🦉", bio: "Writes about systems.", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 60 },
    { id: "u_zen", username: "zen", avatar: "🐙", bio: "Indie hacker.", createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30 },
  ];

  const communities: Community[] = [
    { id: "c_design", name: "design", title: "Design Systems", description: "Tokens, components, typography, taste.", icon: "🎨", color: "#a3e635", ownerId: "u_nova", members: ["u_nova", "u_atlas", "u_lyra"], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 50 },
    { id: "c_ml", name: "ml", title: "Machine Learning", description: "Papers, models, vibes.", icon: "🧠", color: "#a78bfa", ownerId: "u_atlas", members: ["u_atlas", "u_zen"], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 40 },
    { id: "c_indie", name: "indie", title: "Indie Hackers", description: "Ship small. Ship often.", icon: "🚀", color: "#fb7185", ownerId: "u_zen", members: ["u_zen", "u_nova", "u_lyra"], createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20 },
  ];

  const now = Date.now();
  const posts: Post[] = [
    { id: uid("p_"), communityId: "c_design", authorId: "u_nova", title: "Why color tokens beat hex codes", body: "Naming colors semantically (surface, accent, danger) gives you a system that survives redesigns. Here's the framework I use.", createdAt: now - 1000 * 60 * 60 * 2, updatedAt: now },
    { id: uid("p_"), communityId: "c_design", authorId: "u_lyra", title: "The case for sharper typography", body: "Display fonts are doing too much work. Pair tighter tracking with restraint.", createdAt: now - 1000 * 60 * 60 * 8, updatedAt: now },
    { id: uid("p_"), communityId: "c_ml", authorId: "u_atlas", title: "Tiny models, big wins", body: "An honest look at distillation results from the last six months.", createdAt: now - 1000 * 60 * 60 * 5, updatedAt: now },
    { id: uid("p_"), communityId: "c_indie", authorId: "u_zen", title: "I made $400 MRR in 3 weeks", body: "Stack: nothing fancy. Method: talk to ten users a day.", createdAt: now - 1000 * 60 * 60 * 1, updatedAt: now },
    { id: uid("p_"), communityId: "c_indie", authorId: "u_nova", title: "Naming your product is 30% of marketing", body: "Short. Pronounceable. Domain-available. In that order.", createdAt: now - 1000 * 60 * 60 * 30, updatedAt: now },
  ];

  const firstPost = posts[0].id;
  const comments: Comment[] = [
    { id: uid("cm_"), postId: firstPost, parentId: null, authorId: "u_atlas", body: "Strong agree. We rebuilt our palette last quarter and saved weeks.", createdAt: now - 1000 * 60 * 60, updatedAt: now },
    { id: uid("cm_"), postId: firstPost, parentId: null, authorId: "u_lyra", body: "What's your take on dark-mode parity?", createdAt: now - 1000 * 60 * 30, updatedAt: now },
  ];
  comments.push({
    id: uid("cm_"), postId: firstPost, parentId: comments[1].id, authorId: "u_nova",
    body: "Mirror the structure, not the values. Let oklch do the work.", createdAt: now - 1000 * 60 * 20, updatedAt: now,
  });

  const votes: Vote[] = [
    { id: "u_atlas:post:" + posts[0].id, userId: "u_atlas", target: "post", targetId: posts[0].id, value: 1 },
    { id: "u_lyra:post:" + posts[0].id, userId: "u_lyra", target: "post", targetId: posts[0].id, value: 1 },
    { id: "u_zen:post:" + posts[3].id, userId: "u_zen", target: "post", targetId: posts[3].id, value: 1 },
  ];

  return { users, communities, posts, comments, votes };
}
