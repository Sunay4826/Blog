import { memo } from "react";
import { Link, useNavigate } from "react-router-dom";
interface BlogCardProps {
    authorName: string;
    title: string;
    content: string;
    id: string;
    tags?: string[];
    likesCount?: number;
    likedByMe?: boolean;
    onToggleLike?: (id: string, likedByMe?: boolean) => void;
    bookmarksCount?: number;
    bookmarkedByMe?: boolean;
    onToggleBookmark?: (id: string, bookmarkedByMe?: boolean) => void;
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, "");

export const BlogCard = memo(({
    id,
    authorName,
    title,
    content,
    tags,
    likesCount,
    likedByMe,
    onToggleLike,
    bookmarksCount,
    bookmarkedByMe,
    onToggleBookmark,
}: BlogCardProps) => {
    const navigate = useNavigate();
    return <Link to={`/blog/${id}`} className="block">
        <div className="group w-full border-b border-[var(--border)] px-6 py-6 transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--surface-alt)] hover:shadow-[0_14px_30px_-24px_var(--text)] last:border-b-0">
            <div className="flex items-center gap-2">
                <Avatar name={authorName} />
                <div className="text-sm font-medium text-[var(--muted)]">{authorName}</div>
            </div>
            <div className="pt-3 text-[22px] font-bold leading-tight tracking-tight text-[var(--text)]">
                {title}
            </div>
            <div className="pt-2 text-sm leading-relaxed text-[var(--muted)]">
                {stripHtml(content).slice(0, 150) + "..."}
            </div>
            <div className="pt-4 text-xs font-medium text-[var(--muted-2)]">
                {`${Math.ceil(content.length / 100)} minute(s) read`}
            </div>
            {tags?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                    {tags.slice(0, 4).map((tag) => (
                        <span
                            key={tag}
                            className="rounded-full border border-[var(--border)] bg-[var(--chip)] px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-[var(--muted)]"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={(event) => {
                        event.preventDefault();
                        onToggleLike?.(id, likedByMe);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 ${
                        likedByMe
                            ? "border-[var(--accent)] bg-[var(--surface-alt)] text-[var(--text)]"
                            : "border-[var(--accent-soft)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)]"
                    }`}
                >
                    <span>{likedByMe ? "♥" : "♡"}</span>
                    <span>{likedByMe ? "Liked" : "Like"}</span>
                    <span className="text-[var(--muted-2)]">{likesCount ?? 0}</span>
                </button>
                <button
                    type="button"
                    onClick={(event) => {
                        event.preventDefault();
                        onToggleBookmark?.(id, bookmarkedByMe);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition hover:-translate-y-0.5 ${
                        bookmarkedByMe
                            ? "border-[var(--text)] bg-[var(--text)] text-[var(--accent-contrast)]"
                            : "border-[var(--accent-soft)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)]"
                    }`}
                >
                    <span>{bookmarkedByMe ? "🔖" : "📑"}</span>
                    <span>{bookmarkedByMe ? "Saved" : "Save"}</span>
                    <span className="text-[var(--muted-2)]">{bookmarksCount ?? 0}</span>
                </button>
                <button
                    type="button"
                    onClick={(event) => {
                        event.preventDefault();
                        navigate(`/blog/${id}`);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--accent-soft)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--muted)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
                >
                    <span>💬</span>
                    <span>Comments</span>
                </button>
            </div>
        </div>
    </Link>
});

export function Avatar({ name, size = "small" }: { name: string, size?: "small" | "big" }) {
    return (
        <div
            className={`relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[var(--accent-soft)] bg-[color-mix(in_oklab,var(--accent-soft)_30%,var(--surface))] ${size === "small" ? "h-6 w-6" : "h-10 w-10"}`}
        >
            <span className={`${size === "small" ? "text-xs" : "text-md"} font-medium text-[var(--text)]`}>
                {name[0]}
            </span>
        </div>
    )
}
