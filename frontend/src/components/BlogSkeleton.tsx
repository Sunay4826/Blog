import { memo } from "react";

export const BlogSkeleton = memo(() => {
  return (
    <div className="w-screen max-w-screen-md border-b border-slate-800 px-4 py-5">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-800" />
      <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-slate-800" />
      <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-900" />
      <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-900" />
    </div>
  );
});
