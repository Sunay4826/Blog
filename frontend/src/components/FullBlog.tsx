import React from "react";
import ReactMarkdown from "react-markdown";
import { Appbar } from "./Appbar";
import type { Blog, Comment } from "../hooks";

const markdownComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-semibold text-[var(--text)]" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-semibold text-[var(--text)]" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-lg font-semibold text-[var(--text)]" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-[var(--text)]" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc space-y-2 pl-6 text-[var(--text)]" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal space-y-2 pl-6 text-[var(--text)]" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-[var(--text)]" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="rounded bg-[var(--surface-alt)] px-1 py-0.5 text-sm text-[var(--text)]" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="overflow-x-auto rounded-lg bg-[var(--surface-alt)] p-4 text-sm text-[var(--text)]" {...props} />
  ),
};

type FullBlogProps = {
  blog: Blog;
  onDelete?: () => void;
  onEdit?: () => void;
  comments?: Comment[];
  onAddComment?: (content: string) => void;
  onDeleteComment?: (id: string) => void;
  onToggleLike?: () => void;
  onToggleBookmark?: () => void;
};

export const FullBlog = ({
  blog,
  onDelete,
  onEdit,
  comments,
  onAddComment,
  onDeleteComment,
  onToggleLike,
  onToggleBookmark,
}: FullBlogProps) => {
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(blog.content);
  const [commentInput, setCommentInput] = React.useState("");

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Appbar />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)]">{blog.title}</h1>
            <div className="mt-2 text-sm text-[var(--muted)]">
              {blog.author?.name ?? "Anonymous"}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleLike}
              className={`rounded-lg border px-4 py-2 text-xs font-semibold ${
                blog.likedByMe
                  ? "border-[var(--accent)] text-[var(--text)] bg-[var(--surface-alt)]"
                  : "border-[var(--accent-soft)] text-[var(--muted)] hover:border-[var(--accent)]"
              }`}
            >
              {blog.likedByMe ? "Liked" : "Like"} · {blog.likesCount ?? 0}
            </button>
            <button
              type="button"
              onClick={onToggleBookmark}
              className={`rounded-lg border px-4 py-2 text-xs font-semibold ${
                blog.bookmarkedByMe
                  ? "border-[var(--text)] bg-[var(--text)] text-[var(--accent-contrast)]"
                  : "border-[var(--accent-soft)] text-[var(--muted)] hover:border-[var(--accent)]"
              }`}
            >
              {blog.bookmarkedByMe ? "Saved" : "Save"} · {blog.bookmarksCount ?? 0}
            </button>
            {onEdit ? (
              <button
                type="button"
                onClick={onEdit}
                className="rounded-lg border border-[var(--accent-soft)] px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:border-[var(--accent)]"
              >
                Edit
              </button>
            ) : null}
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg border border-[var(--danger)] px-4 py-2 text-xs font-semibold text-[var(--danger)] hover:opacity-80"
              >
                Delete
              </button>
            ) : null}
          </div>
        </div>
        {blog.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--border)] bg-[var(--chip)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--muted)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-6 space-y-4 leading-7 [&_p]:text-[var(--text)] [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_li]:text-[var(--text)]">
          {isHtml ? (
            <div
              className="[&_a]:text-[var(--link)] [&_code]:rounded [&_code]:bg-[var(--surface-alt)] [&_code]:px-1 [&_code]:py-0.5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-[var(--surface-alt)] [&_pre]:p-4"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          ) : (
            <ReactMarkdown components={markdownComponents}>
              {blog.content}
            </ReactMarkdown>
          )}
        </div>
        <div className="mt-10 border-t border-[var(--border)] pt-6">
          <h2 className="text-lg font-semibold text-[var(--text)]">Comments</h2>
          {onAddComment ? (
            <div className="mt-4 flex flex-col gap-3">
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted-2)] focus:border-[var(--accent)] focus:outline-none"
                placeholder="Write a comment..."
              />
              <div>
                <button
                  type="button"
                  onClick={() => {
                    const value = commentInput.trim();
                    if (!value) return;
                    onAddComment(value);
                    setCommentInput("");
                  }}
                  className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-contrast)] hover:opacity-90"
                >
                  Post comment
                </button>
              </div>
            </div>
          ) : null}
          <div className="mt-6 space-y-4">
            {comments?.length ? (
              comments.map((comment) => (
                <div key={comment.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <div className="text-xs text-[var(--muted)]">
                    {comment.user?.name ?? "Anonymous"} ·{" "}
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-2 text-sm text-[var(--text)]">{comment.content}</div>
                  {onDeleteComment ? (
                    <button
                      type="button"
                      onClick={() => onDeleteComment(comment.id)}
                      className="mt-3 text-xs font-semibold text-[var(--danger)] hover:opacity-80"
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="text-sm text-[var(--muted)]">No comments yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
