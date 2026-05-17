import { useMemo, useState } from "react";
import { useAppStore } from "@/store/app-store";
import {
  buildCommentTree,
  scoreFor,
  userVote,
  type CommentNode,
  type CommentSort,
} from "@/lib/selectors";
import {
  ArrowBigDown,
  ArrowBigUp,
  ChevronDown,
  ChevronRight,
  Reply,
  Trash2,
  Pencil,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function CommentTree({
  postId,
  sort = "best",
  locked = false,
}: {
  postId: string;
  sort?: CommentSort;
  locked?: boolean;
}) {
  const comments = useAppStore((s) => s.comments);
  const votes = useAppStore((s) => s.votes);
  const tree = useMemo(
    () => buildCommentTree(comments, postId, votes, sort),
    [comments, postId, votes, sort],
  );
  return (
    <div className="space-y-3">
      {tree.length === 0 && (
        <div className="text-sm text-muted-foreground">No comments yet. Be the first.</div>
      )}
      {tree.map((n) => (
        <CommentItem key={n.id} node={n} depth={0} locked={locked} />
      ))}
    </div>
  );
}

function CommentItem({
  node,
  depth,
  locked,
}: {
  node: CommentNode;
  depth: number;
  locked: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const [editText, setEditText] = useState(node.body);

  const me = useAppStore((s) => s.currentUserId);
  const allUsers = useAppStore((s) => s.users);
  const author = useMemo(
    () => allUsers.find((u) => u.id === node.authorId),
    [allUsers, node.authorId],
  );
  const votes = useAppStore((s) => s.votes);
  const vote = useAppStore((s) => s.vote);
  const addComment = useAppStore((s) => s.addComment);
  const updateComment = useAppStore((s) => s.updateComment);
  const deleteComment = useAppStore((s) => s.deleteComment);

  const score = scoreFor(votes, "comment", node.id);
  const my = userVote(votes, me, "comment", node.id);
  const mine = me === node.authorId;

  // Cap visual indentation so deep threads don't squish on mobile.
  // After MAX_DEPTH we still nest logically but stop adding indent.
  const MAX_DEPTH = 6;
  const visualDepth = Math.min(depth, MAX_DEPTH);
  const indent = visualDepth > 0 ? "border-l-2 border-border pl-2 sm:pl-3 ml-0.5 sm:ml-1" : "";
  return (
    <div className="relative min-w-0">
      <div className={`flex gap-2 sm:gap-3 min-w-0 ${indent}`}>
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="mt-1 h-6 w-6 grid place-items-center rounded-md hover:bg-secondary text-muted-foreground shrink-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="h-5 w-5 grid place-items-center rounded-md bg-secondary text-[11px]">
              {author?.avatar}
            </span>
            <span className="font-medium text-foreground">@{author?.username}</span>
            <span>·</span>
            <span>{formatDistanceToNow(node.createdAt, { addSuffix: true })}</span>
          </div>
          {!collapsed && (
            <>
              {editing ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full bg-secondary rounded-lg p-2 text-sm border border-border"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        updateComment(node.id, editText);
                        setEditing(false);
                      }}
                      className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="h-8 px-3 rounded-lg bg-secondary text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  className={`text-sm whitespace-pre-wrap break-words ${node.deleted ? "italic text-muted-foreground" : ""}`}
                >
                  {node.body}
                </p>
              )}

              {!node.deleted && (
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <button
                    onClick={() => vote("comment", node.id, my === 1 ? 0 : 1)}
                    className={`h-7 w-7 grid place-items-center rounded-md hover:bg-secondary ${my === 1 ? "text-primary" : ""}`}
                  >
                    <ArrowBigUp className="h-3.5 w-3.5" fill={my === 1 ? "currentColor" : "none"} />
                  </button>
                  <span
                    className={`tabular-nums font-semibold ${my === 1 ? "text-primary" : my === -1 ? "text-destructive" : "text-foreground"}`}
                  >
                    {score}
                  </span>
                  <button
                    onClick={() => vote("comment", node.id, my === -1 ? 0 : -1)}
                    className={`h-7 w-7 grid place-items-center rounded-md hover:bg-secondary ${my === -1 ? "text-destructive" : ""}`}
                  >
                    <ArrowBigDown
                      className="h-3.5 w-3.5"
                      fill={my === -1 ? "currentColor" : "none"}
                    />
                  </button>
                  {!locked && (
                    <button
                      onClick={() => setReplying((v) => !v)}
                      className="h-7 px-2 rounded-md hover:bg-secondary flex items-center gap-1"
                    >
                      <Reply className="h-3 w-3" /> Reply
                    </button>
                  )}
                  {mine && (
                    <>
                      <button
                        onClick={() => {
                          setEditing(true);
                          setEditText(node.body);
                        }}
                        className="h-7 px-2 rounded-md hover:bg-secondary flex items-center gap-1"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => deleteComment(node.id)}
                        className="h-7 px-2 rounded-md hover:bg-secondary flex items-center gap-1 text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              )}

              {replying && (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write a reply…"
                    className="w-full bg-secondary rounded-lg p-2 text-sm border border-border"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (text.trim()) {
                          addComment(node.postId, text.trim(), node.id);
                          setText("");
                          setReplying(false);
                        }
                      }}
                      className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => setReplying(false)}
                      className="h-8 px-3 rounded-lg bg-secondary text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {node.children.length > 0 && (
                <div className="mt-3 space-y-3">
                  {node.children.map((c) => (
                    <CommentItem key={c.id} node={c} depth={depth + 1} locked={locked} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
