import { memo } from "react";

export const Spinner = memo(() => {
  return (
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-400" />
  );
});
