import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";

export interface Blog {
  id: string;
  title: string;
  content: string;
  author: {
    name: string | null;
  };
}

const authHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
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

  return { loading, blog };
};

export const useBlogs = () => {
  const [loading, setLoading] = useState(true);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    axios
      .get(`${BACKEND_URL}/api/v1/blog/bulk`, {
        headers: authHeader(),
      })
      .then((response) => {
        setBlogs(response.data.blogs ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  return { loading, blogs };
};
