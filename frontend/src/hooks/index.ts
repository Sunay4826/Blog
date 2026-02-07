import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

export interface Blog {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt?: string;
  tags?: string[];
  likesCount?: number;
  likedByMe?: boolean;
  bookmarksCount?: number;
  bookmarkedByMe?: boolean;
  author: {
    name: string | null;
  };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string | null };
}

export interface Profile {
  username: string;
  bio: string;
  totalBlogs: number;
  likesReceived: number;
}

const authHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const getCurrentUserId = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return typeof payload.id === "string" ? payload.id : null;
  } catch {
    return null;
  }
};

export const useBlog = ({ id }: { id: string }) => {
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState<Blog>();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    axios
      .get(`${BACKEND_URL}/api/v1/blog/${id}`, {
        headers: authHeader(),
      })
      .then((response) => {
        setBlog(response.data.blog);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { loading, blog, setBlog };
};

export const useBlogs = (params?: {
  search?: string;
  author?: string;
  tags?: string;
  sort?: string;
}) => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.author) searchParams.set("author", params.author);
    if (params?.tags) searchParams.set("tags", params.tags);
    if (params?.sort) searchParams.set("sort", params.sort);
    const query = searchParams.toString();
    const url = query
      ? `${BACKEND_URL}/api/v1/blog/bulk?${query}`
      : `${BACKEND_URL}/api/v1/blog/bulk`;

    axios
      .get(url, {
        headers: authHeader(),
      })
      .then((response) => {
        setBlogs(response.data.blogs ?? []);
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message || "Failed to load blogs.";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [params?.author, params?.search, params?.sort, params?.tags]);

  return { loading, blogs, error, setBlogs };
};

export const useMyBlogs = () => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/blog/my`, {
        headers: authHeader(),
      })
      .then((response) => {
        setBlogs(response.data.blogs ?? []);
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message || "Failed to load your blogs.";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { loading, blogs, error, setBlogs };
};

export const useSavedBlogs = () => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/blog/saved`, {
        headers: authHeader(),
      })
      .then((response) => {
        setBlogs(response.data.blogs ?? []);
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message || "Failed to load saved blogs.";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { loading, blogs, error, setBlogs };
};

export const useComments = (postId: string) => {
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      return;
    }
    axios
      .get(`${BACKEND_URL}/api/v1/blog/${postId}/comments`, {
        headers: authHeader(),
      })
      .then((response) => {
        setComments(response.data.comments ?? []);
      })
      .finally(() => setLoading(false));
  }, [postId]);

  return { loading, comments, setComments };
};

export const useProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/user/profile`, {
        headers: authHeader(),
      })
      .then((response) => {
        setProfile(response.data);
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message || "Failed to load profile.";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { loading, profile, error };
};
