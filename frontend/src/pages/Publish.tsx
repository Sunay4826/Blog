import { Appbar } from "../components/Appbar"
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

export const Publish = () => {
    const [title, setTitle] = useState("");
    const [tagsInput, setTagsInput] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
        }
    }, [navigate]);

    const handleTitleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Write an article..."
            })
        ],
        editorProps: {
            attributes: {
                class:
                    "tiptap min-h-[240px] outline-none"
            }
        }
    });

    const handlePublish = useCallback(async () => {
        const content = editor?.getHTML() || "";
        const tags = tagsInput
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }
        const response = await axios.post(`${BACKEND_URL}/api/v1/blog`, {
            title,
            content,
            tags
        }, {
            headers: {
                Authorization: token ? `Bearer ${token}` : ""
            }
        });
        navigate(`/blog/${response.data.id}`)
    }, [editor, navigate, tagsInput, title]);

    return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <Appbar />
            <div className="flex justify-center w-full px-6 py-10"> 
                <div className="max-w-screen-lg w-full">
                    <input
                        onChange={handleTitleChange}
                        type="text"
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted-2)] focus:border-[var(--accent)] focus:outline-none"
                        placeholder="Title"
                    />
                    <input
                        value={tagsInput}
                        onChange={(event) => setTagsInput(event.target.value)}
                        type="text"
                        className="mt-3 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted-2)] focus:border-[var(--accent)] focus:outline-none"
                        placeholder="Tags (comma separated)"
                    />

                    <TextEditor editor={editor} />
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                            onClick={handlePublish}
                            type="submit"
                            className="inline-flex items-center rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] transition hover:opacity-90"
                        >
                            Publish post
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center rounded-lg border border-[var(--accent-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--muted)]"
                            onClick={() => navigate("/my-blogs")}
                        >
                            My posts
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function TextEditor({ editor }: { editor: ReturnType<typeof useEditor> }) {
    if (!editor) {
        return null;
    }

    return (
        <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="mb-3 flex flex-wrap gap-2 text-xs">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`rounded-md border px-3 py-1 ${editor.isActive("bold") ? "border-[var(--accent)] text-[var(--text)]" : "border-[var(--border)] text-[var(--muted)]"}`}
                >
                    Bold
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`rounded-md border px-3 py-1 ${editor.isActive("italic") ? "border-[var(--accent)] text-[var(--text)]" : "border-[var(--border)] text-[var(--muted)]"}`}
                >
                    Italic
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`rounded-md border px-3 py-1 ${editor.isActive("bulletList") ? "border-[var(--accent)] text-[var(--text)]" : "border-[var(--border)] text-[var(--muted)]"}`}
                >
                    Bullets
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`rounded-md border px-3 py-1 ${editor.isActive("orderedList") ? "border-[var(--accent)] text-[var(--text)]" : "border-[var(--border)] text-[var(--muted)]"}`}
                >
                    Numbered
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`rounded-md border px-3 py-1 ${editor.isActive("heading", { level: 2 }) ? "border-[var(--accent)] text-[var(--text)]" : "border-[var(--border)] text-[var(--muted)]"}`}
                >
                    H2
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`rounded-md border px-3 py-1 ${editor.isActive("blockquote") ? "border-[var(--accent)] text-[var(--text)]" : "border-[var(--border)] text-[var(--muted)]"}`}
                >
                    Quote
                </button>
            </div>
            <EditorContent editor={editor} className="tiptap" />
        </div>
    )
}