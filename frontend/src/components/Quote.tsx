
import { memo } from "react";

export const Quote = memo(() => {
    return (
        <div className="flex h-full items-center justify-center bg-[var(--surface-alt)] px-10 py-12">
            <div className="max-w-md">
                <p className="text-xl font-semibold text-[var(--text)]">
                    “The customer service I received was exceptional. The support team
                    went above and beyond to address my concerns.”
                </p>
                <div className="mt-4 text-sm font-semibold text-[var(--text)]">
                    Jules Winnfield
                </div>
                <div className="text-xs text-[var(--muted)]">CEO, Acme Inc</div>
            </div>
        </div>
    )
});