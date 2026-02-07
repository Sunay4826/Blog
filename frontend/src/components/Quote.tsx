
import { memo } from "react";

export const Quote = memo(() => {
    return (
        <div className="flex h-full items-center justify-center bg-slate-900 px-10 py-12">
            <div className="max-w-md">
                <p className="text-xl font-semibold text-slate-100">
                    “The customer service I received was exceptional. The support team
                    went above and beyond to address my concerns.”
                </p>
                <div className="mt-4 text-sm font-semibold text-slate-100">
                    Jules Winnfield
                </div>
                <div className="text-xs text-slate-400">CEO, Acme Inc</div>
            </div>
        </div>
    )
});