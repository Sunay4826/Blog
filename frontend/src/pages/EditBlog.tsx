import { useCallback, useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Appbar } from "../components/Appbar";
import { BACKEND_URL } from "../config";
import { getCurrentUserId, useBlog } from "../hooks/index.ts";

export const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { blog } = useBlog({ id: id || "" });
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Write your content..." }),
    ],
    editorProps: {
      attributes: { class: "tiptap min-h-[240px] outline-none" },
    },
  });

  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setContent(blog.content);
      setTagsInput(blog.tags?.join(", ") ?? "");
      if (editor) {
        editor.commands.setContent(blog.content || "");
      }
    }
  }, [blog, editor]);

  useEffect(() => {
    if (blog) {
      const currentUserId = getCurrentUserId();
      if (!currentUserId || blog.authorId !== currentUserId) {
        navigate(`/blog/${blog.id}`);
      }
    }
  }, [blog, navigate]);

  const handleSave = useCallback(async () => {
    if (!id) return;
    const token = localStorage.getItem("token");
    const htmlContent = editor?.getHTML() || content;
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    await axios.put(
      `${BACKEND_URL}/api/v1/blog/${id}`,
      { title, content: htmlContent, tags },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );
    navigate(`/blog/${id}`);
  }, [content, editor, id, navigate, tagsInput, title]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Appbar />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold">Edit blog</h1>
        <div className="mt-6 space-y-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted-2)] focus:border-[var(--accent)] focus:outline-none"
            placeholder="Title"
          />
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted-2)] focus:border-[var(--accent)] focus:outline-none"
            placeholder="Tags (comma separated)"
          />
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-3 flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`rounded-md border px-3 py-1 ${editor?.isActive("bold") ? "border-[var(--accent)] text-[var(--text)]" : "border-[var(--border)] text-[var(--muted)]"}`}
              >
                Bold
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`rounded-md border px-3 py-1 ${editor?.isActive("italic") ? "border-[var(--accent)] text-[var(--text)]" : "border-[var(--border)] text-[var(--muted)]"}`}
              >
                Italic
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`rounded-md border px-3 py-1 ${editor?.isActive("bulletList") ? "border-[var(--accent)] text-[var(--text)]" : "border-[var(--border)] text-[var(--muted)]"}`}
              >
                Bullets
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={`rounded-md border px-3 py-1 ${editor?.isActive("orderedList") ? "border-[var(--accent)] text-[var(--text)]" : "border-[var(--border)] text-[var(--muted)]"}`}
              >
                Numbered
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`rounded-md border px-3 py-1 ${editor?.isActive("heading", { level: 2 }) ? "border-[var(--accent)] text-[var(--text)]" : "border-[var(--border)] text-[var(--muted)]"}`}
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={`rounded-md border px-3 py-1 ${editor?.isActive("blockquote") ? "border-[var(--accent)] text-[var(--text)]" : "border-[var(--border)] text-[var(--muted)]"}`}
              >
                Quote
              </button>
            </div>
            <EditorContent editor={editor} className="tiptap" />
          </div>
          <button
            onClick={handleSave}
            className="inline-flex items-center rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] transition hover:opacity-90"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};
