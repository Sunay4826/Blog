import { Appbar } from "../components/Appbar.tsx"
import { BlogCard } from "../components/BlogCard.tsx"
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useBlogs } from "../hooks/index.ts";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useCallback, useEffect, useMemo, useState } from "react";

const dummyBlogs = [
    {
        id: "demo-1",
        title: "Why React Still Wins in 2026",
        content:
            "React keeps shipping practical improvements that make component-driven UI fast to build and maintain. Here is how the ecosystem keeps it ahead...",
        author: { name: "Sunay" },
        likesCount: 128,
        likedByMe: false,
        bookmarksCount: 24,
        bookmarkedByMe: false,
        tags: ["React", "Programming"],
    },
    {
        id: "demo-2",
        title: "AI Is Changing Everyday Coding",
        content:
            "From autocomplete to tests, AI tools are quietly removing the boring parts of software delivery. The real value is focus...",
        author: { name: "Maya" },
        likesCount: 86,
        likedByMe: true,
        bookmarksCount: 12,
        bookmarkedByMe: true,
        tags: ["AI", "Life"],
    },
    {
        id: "demo-3",
        title: "Clean Architecture for Busy Devs",
        content:
            "You do not need a massive refactor to get clean boundaries. These small steps can make any codebase easier to change...",
        author: { name: "Chris" },
        likesCount: 45,
        likedByMe: false,
        bookmarksCount: 6,
        bookmarkedByMe: false,
        tags: ["Programming"],
    },
];

export const Blogs = () => {
    const [search, setSearch] = useState("");
    const [author, setAuthor] = useState("");
    const [sort, setSort] = useState("newest");
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [debouncedAuthor, setDebouncedAuthor] = useState(author);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setDebouncedAuthor(author.trim());
        }, 350);
        return () => clearTimeout(timer);
    }, [author, search]);

    const params = useMemo(
        () => ({
            search: debouncedSearch || undefined,
            author: debouncedAuthor || undefined,
            sort
        }),
        [debouncedAuthor, debouncedSearch, sort]
    );

    const { loading, blogs, error, setBlogs } = useBlogs(params);
    const visibleBlogs = useMemo(
        () => (blogs.length ? blogs : error ? dummyBlogs : []),
        [blogs, error]
    );

    const handleToggleLike = useCallback(async (id: string, likedByMe?: boolean) => {
        const token = localStorage.getItem("token");
        const url = `${BACKEND_URL}/api/v1/blog/${id}/like`;
        const response = likedByMe
            ? await axios.delete(url, {
                headers: { Authorization: token ? `Bearer ${token}` : "" }
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
                        likedByMe: response.data.likedByMe
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
                headers: { Authorization: token ? `Bearer ${token}` : "" }
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
                        bookmarkedByMe: response.data.bookmarkedByMe
                    }
                    : blog
            )
        );
    }, [setBlogs]);

    if (loading) {
        return <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <Appbar /> 
            <div className="mx-auto max-w-5xl px-4 pb-10">
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
            </div>
        </div>
    }

    return <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <Appbar />
        <div className="mx-auto max-w-5xl px-4 pb-10">
                <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search title..."
                        className="min-w-[220px] flex-1 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted-2)] focus:border-[var(--accent)] focus:outline-none"
                    />
                    <input
                        value={author}
                        onChange={(event) => setAuthor(event.target.value)}
                        placeholder="Filter by author..."
                        className="min-w-[200px] flex-1 rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted-2)] focus:border-[var(--accent)] focus:outline-none"
                    />
                    <select
                        value={sort}
                        onChange={(event) => setSort(event.target.value)}
                        className="min-w-[160px] rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
                    >
                        <option value="newest">Newest</option>
                        <option value="popular">Popular</option>
                    </select>
                </div>
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
                    {visibleBlogs.map((blog) => (
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
}
