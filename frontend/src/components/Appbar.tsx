import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const Appbar = memo(() => {
  const [isDark, setIsDark] = useState(false);

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
    <div className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_78%,transparent)] px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <Link
          to="/blogs"
          className="bg-gradient-to-r from-[var(--text)] to-[var(--link)] bg-clip-text text-xl font-extrabold tracking-tight text-transparent"
        >
          Inkspire
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link
            to="/saved"
            className="rounded-full border border-[var(--accent-soft)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--text)]"
          >
            Saved
          </Link>
          <Link
            to="/profile"
            className="rounded-full border border-[var(--accent-soft)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--text)]"
          >
            Profile
          </Link>
          <Link
            to="/my-blogs"
            className="rounded-full border border-[var(--accent-soft)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--text)]"
          >
            My blogs
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--accent-soft)] bg-[var(--surface)] text-[var(--muted)] hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--text)]"
          >
            <span className="text-base">{isDark ? "☀️" : "🌙"}</span>
          </button>
          <Link
            to={localStorage.getItem("token") ? "/publish" : "/signin"}
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--accent-contrast)] shadow-[0_8px_24px_-12px_var(--accent)] hover:-translate-y-0.5 hover:opacity-95"
          >
            New
          </Link>
        </div>
      </div>
    </div>
  );
});
