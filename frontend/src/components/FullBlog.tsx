import { Appbar } from "./Appbar";
import ReactMarkdown from "react-markdown";
import type { Blog } from "../hooks";

export const FullBlog = ({ blog }: { blog: Blog }) => {
  return (
    <div>
      <Appbar />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-bold text-slate-900">{blog.title}</h1>
        <div className="mt-2 text-sm text-slate-500">
          {blog.author?.name ?? "Anonymous"}
        </div>
        <div className="mt-6 space-y-4 text-slate-700 leading-7">
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
