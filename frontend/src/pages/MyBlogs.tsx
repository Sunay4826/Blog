import { Appbar } from "../components/Appbar.tsx";
import { BlogCard } from "../components/BlogCard.tsx";
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useMyBlogs } from "../hooks/index.ts";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useCallback } from "react";

export const MyBlogs = () => {
  const { loading, blogs, error, setBlogs } = useMyBlogs();

  const handleToggleLike = useCallback(async (id: string, likedByMe?: boolean) => {
    const token = localStorage.getItem("token");
    const url = `${BACKEND_URL}/api/v1/blog/${id}/like`;
    const response = likedByMe
      ? await axios.delete(url, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        })
      : await axios.post(
          url,
          {},
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
    setBlogs((prev) =>
      prev.map((blog) =>
        blog.id === id
          ? {
              ...blog,
              likesCount: response.data.likesCount,
              likedByMe: response.data.likedByMe,
            }
          : blog
      )
    );
  }, [setBlogs]);

  const handleToggleBookmark = useCallback(async (id: string, bookmarkedByMe?: boolean) => {
    const token = localStorage.getItem("token");
    const url = `${BACKEND_URL}/api/v1/blog/${id}/bookmark`;
    const response = bookmarkedByMe
      ? await axios.delete(url, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        })
      : await axios.post(
          url,
          {},
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
    setBlogs((prev) =>
      prev.map((blog) =>
        blog.id === id
          ? {
              ...blog,
              bookmarksCount: response.data.bookmarksCount,
              bookmarkedByMe: response.data.bookmarkedByMe,
            }
          : blog
      )
    );
  }, [setBlogs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <Appbar />
        <div className="mx-auto max-w-5xl px-4 pb-10">
          <BlogSkeleton />
          <BlogSkeleton />
          <BlogSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Appbar />
      <div className="mx-auto max-w-5xl px-4 pb-10">
        {error ? (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-4 text-sm text-[var(--danger)]">
            {error}
          </div>
        ) : null}
        {!error && blogs.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-6 py-4 text-sm text-[var(--muted)]">
            No blogs yet.
          </div>
        ) : null}
        <div className="mt-6 space-y-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          {blogs.map((blog) => (
            <BlogCard
              key={blog.id}
              id={blog.id}
              authorName={blog.author.name || "Anonymous"}
              title={blog.title}
              content={blog.content}
              tags={blog.tags}
              likesCount={blog.likesCount}
              likedByMe={blog.likedByMe}
              onToggleLike={handleToggleLike}
              bookmarksCount={blog.bookmarksCount}
              bookmarkedByMe={blog.bookmarkedByMe}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
