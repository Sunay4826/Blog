import { Auth } from "../components/Auth"
import { Quote } from "../components/Quote"

export const Signup = () => {
    return (
        <div className="min-h-screen bg-[var(--bg)] px-4 py-10 text-[var(--text)]">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
                <div className="w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        <Auth type="signup" />
                        <div className="hidden lg:block">
                            <Quote />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}