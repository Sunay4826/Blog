import { memo, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Appbar = memo(() => {
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const enabled = saved === "dark";
    setIsDark(enabled);
    document.documentElement.classList.toggle("theme-dark", enabled);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("theme-dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <Link to="/blogs" className="text-lg font-semibold text-[var(--text)]">
          Blog
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/saved"
            className="rounded-full border border-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--text)]"
          >
            Saved
          </Link>
          <Link
            to="/profile"
            className="rounded-full border border-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--text)]"
          >
            Profile
          </Link>
          <Link
            to="/my-blogs"
            className="rounded-full border border-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--text)]"
          >
            My blogs
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--accent-soft)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--text)]"
          >
            <span className="text-base">{isDark ? "☀️" : "🌙"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/signin");
            }}
            className="rounded-full border border-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--text)]"
          >
            Log out
          </button>
          <Link
            to="/publish"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-contrast)] shadow-sm hover:opacity-90"
          >
            New
          </Link>
        </div>
      </div>
    </div>
  );
});
