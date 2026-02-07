import { Appbar } from "../components/Appbar.tsx";
import { useProfile } from "../hooks/index.ts";
import { Spinner } from "../components/Spinner.tsx";

export const Profile = () => {
  const { loading, profile, error } = useProfile();

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
            {profile.username}
          </div>
          <div className="mt-2 text-sm text-[var(--muted)]">
            {profile.bio || "No bio yet."}
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
