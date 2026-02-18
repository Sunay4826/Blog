import { useCallback, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config.ts";
import { z } from "zod";

type SignupInput = {
    name?: string;
    email: string;
    password: string;
};

type SigninInput = {
    email: string;
    password: string;
};

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
const passwordMessage =
    "Password must be at least 6 characters and include uppercase, lowercase, number, and special character.";

const signupSchema = z.object({
    email: z.string().email("Email is invalid"),
    password: z.string().regex(passwordRegex, passwordMessage),
    name: z.string().optional()
});

const signinSchema = z.object({
    email: z.string().email("Email is invalid"),
    password: z.string().min(1, "Password is required")
});

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [postInputs, setPostInputs] = useState<SignupInput>({
        name: "",
        email: "",
        password: ""
    });
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        form?: string;
    }>({});

    const sendRequest = useCallback(async () => {
        if (isSubmitting) return;
        try {
            setIsSubmitting(true);
            const payload: SignupInput | SigninInput =
                type === "signup"
                    ? postInputs
                    : { email: postInputs.email, password: postInputs.password };
            const parsed =
                type === "signup"
                    ? signupSchema.safeParse(payload)
                    : signinSchema.safeParse(payload);
            if (!parsed.success) {
                const fieldErrors: {
                    name?: string;
                    email?: string;
                    password?: string;
                } = {};
                for (const issue of parsed.error.issues) {
                    const field = issue.path[0];
                    if (field === "name") fieldErrors.name = issue.message;
                    if (field === "email") fieldErrors.email = issue.message;
                    if (field === "password") fieldErrors.password = issue.message;
                }
                setErrors(fieldErrors);
                return;
            }
            setErrors({});

            const response = await axios.post(
                `${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`,
                parsed.data
            );
            const jwt = response.data;
            localStorage.setItem("token", jwt);
            navigate("/blogs");
        } catch(e) {
            setErrors({
                form:
                    (e as { response?: { data?: { message?: string } } })?.response
                        ?.data?.message || `Unable to ${type}.`
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [isSubmitting, navigate, postInputs, type]);

    const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setPostInputs((prev: SignupInput) => ({
            ...prev,
            name: e.target.value
        }));
        setErrors((prev) => ({ ...prev, name: undefined, form: undefined }));
    }, []);

    const handleEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setPostInputs((prev: SignupInput) => ({
            ...prev,
            email: e.target.value
        }));
        setErrors((prev) => ({ ...prev, email: undefined, form: undefined }));
    }, []);

    const handlePasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setPostInputs((prev: SignupInput) => ({
            ...prev,
            password: e.target.value
        }));
        setErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
    }, []);
    
    return (
        <div className="flex h-full flex-col justify-center px-10 py-12">
            <div>
                <div className="text-3xl font-bold tracking-tight text-[var(--text)]">
                    {type === "signup" ? "Create an account" : "Welcome back"}
                </div>
                <div className="mt-2 text-sm text-[var(--muted)]">
                    {type === "signin" ? "Don't have an account?" : "Already have an account?"}
                    <Link className="pl-2 text-[var(--text)] underline" to={type === "signin" ? "/signup" : "/signin"}>
                        {type === "signin" ? "Sign up" : "Sign in"}
                    </Link>
                </div>
            </div>
            <form
                className="pt-8"
                onSubmit={(event) => {
                    event.preventDefault();
                    sendRequest();
                }}
            >
                {errors.form ? (
                    <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--danger)]">
                        {errors.form}
                    </div>
                ) : null}
                {type === "signup" ? (
                    <LabelledInput
                        label="Name"
                        placeholder="Sunay Revad..."
                        onChange={handleNameChange}
                        error={errors.name}
                    />
                ) : null}
                <LabelledInput
                    label="Email"
                    placeholder="sunayrevad@gmail.com"
                    onChange={handleEmailChange}
                    error={errors.email}
                />
                <LabelledInput
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    onChange={handlePasswordChange}
                    error={errors.password}
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-8 w-full rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-[var(--accent-contrast)] shadow-[0_10px_24px_-14px_var(--accent)] transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting ? "Please wait..." : type === "signup" ? "Sign up" : "Sign in"}
                </button>
            </form>
        </div>
    )
}

interface LabelledInputType {
    label: string;
    placeholder: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    error?: string;
}

function LabelledInput({ label, placeholder, onChange, type, error }: LabelledInputType) {
    return (
        <div className="pt-4">
            <label className="mb-2 block text-sm font-semibold text-[var(--text)]">
                {label}
            </label>
            <input
                onChange={onChange}
                type={type || "text"}
                className={`block w-full rounded-xl border bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted-2)] focus:border-[var(--accent)] focus:outline-none ${
                    error ? "border-[var(--danger)]" : "border-[var(--border)]"
                }`}
                placeholder={placeholder}
                required
            />
            {error ? (
                <div className="mt-2 text-xs text-[var(--danger)]">{error}</div>
            ) : null}
        </div>
    )
}
