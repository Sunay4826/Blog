import { memo } from "react";

export const BlogSkeleton = memo(() => {
  return (
    <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-5 shadow-sm">
      <div className="h-4 w-32 animate-pulse rounded bg-[var(--surface-alt)]" />
      <div className="mt-4 h-6 w-3/4 animate-pulse rounded bg-[var(--surface-alt)]" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-[var(--surface-alt)]" />
      <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-[var(--surface-alt)]" />
    </div>
  );
});
