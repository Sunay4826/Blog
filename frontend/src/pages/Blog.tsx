import { FullBlog } from "../components/FullBlog.tsx";
import { Spinner } from "../components/Spinner.tsx";
import { getCurrentUserId, useBlog, useComments } from "../hooks/index.ts";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";

// atomFamilies/selectorFamilies
export const Blog = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { loading, blog, setBlog } = useBlog({
        id: id || ""
    });
    const { comments, setComments } = useComments(id || "");

    if (loading || !blog) {
        return (
            <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
                <div className="flex h-[70vh] items-center justify-center">
                    <Spinner />
                </div>
            </div>
        )
    }
    const handleDelete = async () => {
        if (!id) return;
        const token = localStorage.getItem("token");
        await axios.delete(`${BACKEND_URL}/api/v1/blog/${id}`, {
            headers: {
                Authorization: token ? `Bearer ${token}` : ""
            }
        });
        navigate("/my-blogs");
    };

    const currentUserId = getCurrentUserId();
    const isOwner = currentUserId && blog.authorId === currentUserId;

    const handleAddComment = async (content: string) => {
        if (!id) return;
        const token = localStorage.getItem("token");
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/blog/${id}/comments`,
            { content },
            {
                headers: {
                    Authorization: token ? `Bearer ${token}` : ""
                }
            }
        );
        setComments((prev) => [response.data.comment, ...prev]);
    };

    const handleDeleteComment = async (commentId: string) => {
        const token = localStorage.getItem("token");
        await axios.delete(`${BACKEND_URL}/api/v1/blog/comments/${commentId}`, {
            headers: {
                Authorization: token ? `Bearer ${token}` : ""
            }
        });
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    };

    const handleToggleLike = async () => {
        if (!id || !blog) return;
        const token = localStorage.getItem("token");
        const url = `${BACKEND_URL}/api/v1/blog/${id}/like`;
        const response = blog.likedByMe
            ? await axios.delete(url, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : ""
                }
            })
            : await axios.post(
                url,
                {},
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : ""
                    }
                }
            );

        setBlog({
            ...blog,
            likesCount: response.data.likesCount,
            likedByMe: response.data.likedByMe
        });
    };

    const handleToggleBookmark = async () => {
        if (!id || !blog) return;
        const token = localStorage.getItem("token");
        const url = `${BACKEND_URL}/api/v1/blog/${id}/bookmark`;
        const response = blog.bookmarkedByMe
            ? await axios.delete(url, {
                headers: {
                    Authorization: token ? `Bearer ${token}` : ""
                }
            })
            : await axios.post(
                url,
                {},
                {
                    headers: {
                        Authorization: token ? `Bearer ${token}` : ""
                    }
                }
            );

        setBlog({
            ...blog,
            bookmarksCount: response.data.bookmarksCount,
            bookmarkedByMe: response.data.bookmarkedByMe
        });
    };

    return (
        <div>
            <FullBlog
                blog={blog}
                onDelete={isOwner ? handleDelete : undefined}
                onEdit={isOwner ? () => navigate(`/blog/${id}/edit`) : undefined}
                comments={comments}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onToggleLike={handleToggleLike}
                onToggleBookmark={handleToggleBookmark}
            />
        </div>
    )
}