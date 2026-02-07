import { Appbar } from "../components/Appbar.tsx";
import { useProfile } from "../hooks/index.ts";
import { Spinner } from "../components/Spinner.tsx";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";

export const Profile = () => {
  const { loading, profile, error } = useProfile();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.username);
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <Appbar />
        <div className="flex h-[70vh] items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <Appbar />
        <div className="mx-auto max-w-3xl px-6 py-10 text-sm text-[var(--danger)]">
          {error}
        </div>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <Appbar />
        <div className="mx-auto max-w-3xl px-6 py-10 text-sm text-[var(--muted)]">
          Profile not available.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Appbar />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-[var(--text)]">Profile</h1>
        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="text-lg font-semibold text-[var(--text)]">
            Username
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="min-w-[220px] flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted-2)] focus:border-[var(--accent)] focus:outline-none"
              placeholder="Your name"
            />
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                setSaveMessage(null);
                setSaving(true);
                try {
                  const token = localStorage.getItem("token");
                  await axios.put(
                    `${BACKEND_URL}/api/v1/user/profile`,
                    { name },
                    {
                      headers: {
                        Authorization: token ? `Bearer ${token}` : "",
                      },
                    }
                  );
                  setSaveMessage("Saved");
                } catch (e) {
                  setSaveMessage("Failed to save");
                } finally {
                  setSaving(false);
                }
              }}
              className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
          {saveMessage ? (
            <div className="mt-2 text-xs text-[var(--muted)]">{saveMessage}</div>
          ) : null}
          <div className="mt-2 text-sm text-[var(--muted)]">
            {profile.bio || "No bio yet."}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/signin");
              }}
              className="rounded-lg border border-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--text)]"
            >
              Log out
            </button>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] p-4">
              <div className="text-xs uppercase tracking-wide text-[var(--muted)]">
                Total blogs
              </div>
              <div className="mt-2 text-xl font-semibold text-[var(--text)]">
                {profile.totalBlogs}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] p-4">
              <div className="text-xs uppercase tracking-wide text-[var(--muted)]">
                Likes received
              </div>
              <div className="mt-2 text-xl font-semibold text-[var(--text)]">
                {profile.likesReceived}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
