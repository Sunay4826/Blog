
import { memo } from "react";

export const Quote = memo(() => {
    return (
        <div className="relative flex h-full items-center justify-center overflow-hidden bg-[var(--surface-alt)] px-10 py-12">
            <div className="pointer-events-none absolute -left-14 top-0 h-52 w-52 rounded-full bg-[color-mix(in_oklab,var(--accent)_22%,transparent)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-[color-mix(in_oklab,var(--accent-soft)_45%,transparent)] blur-3xl" />
            <div className="relative max-w-md">
                <p className="text-2xl font-bold leading-snug tracking-tight text-[var(--text)]">
                    “Write what matters, ship fast, and let great ideas travel farther.”
                </p>
                <div className="mt-5 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text)]">
                    Editorial Note
                </div>
                <div className="text-xs text-[var(--muted)]">Built for creators who publish consistently</div>
            </div>
        </div>
    )
});
