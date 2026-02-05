import { Link } from "react-router-dom";

export const Appbar = () => {
  return (
    <div className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link to="/blogs" className="text-lg font-semibold text-slate-900">
          Medium
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/publish"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            New
          </Link>
        </div>
      </div>
    </div>
  );
};
