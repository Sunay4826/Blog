import { useCallback, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { SignupInput, SigninInput } from "sunay-common";
import axios from "axios";
import { BACKEND_URL } from "../config.ts";

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
    const navigate = useNavigate();
    const [postInputs, setPostInputs] = useState<SignupInput>({
        name: "",
        email: "",
        password: ""
    });

    const sendRequest = useCallback(async () => {
        try {
            const payload: SignupInput | SigninInput =
                type === "signup"
                    ? postInputs
                    : { email: postInputs.email, password: postInputs.password };

            const response = await axios.post(
                `${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`,
                payload
            );
            const jwt = response.data;
            localStorage.setItem("token", jwt);
            navigate("/blogs");
        } catch(e) {
            alert("Error while signing up")
            // alert the user here that the request failed
        }
    }, [navigate, postInputs, type]);

    const handleNameChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setPostInputs((prev: SignupInput) => ({
            ...prev,
            name: e.target.value
        }));
    }, []);

    const handleEmailChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setPostInputs((prev: SignupInput) => ({
            ...prev,
            email: e.target.value
        }));
    }, []);

    const handlePasswordChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setPostInputs((prev: SignupInput) => ({
            ...prev,
            password: e.target.value
        }));
    }, []);
    
    return (
        <div className="flex h-full flex-col justify-center px-10 py-12">
            <div>
                <div className="text-3xl font-semibold text-slate-100">
                    {type === "signup" ? "Create an account" : "Welcome back"}
                </div>
                <div className="mt-2 text-sm text-slate-400">
                    {type === "signin" ? "Don't have an account?" : "Already have an account?"}
                    <Link className="pl-2 text-slate-100 underline" to={type === "signin" ? "/signup" : "/signin"}>
                        {type === "signin" ? "Sign up" : "Sign in"}
                    </Link>
                </div>
            </div>
            <div className="pt-8">
                {type === "signup" ? (
                    <LabelledInput
                        label="Name"
                        placeholder="Sunay Revad..."
                        onChange={handleNameChange}
                    />
                ) : null}
                <LabelledInput
                    label="Email"
                    placeholder="sunayrevad@gmail.com"
                    onChange={handleEmailChange}
                />
                <LabelledInput
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    onChange={handlePasswordChange}
                />
                <button
                    onClick={sendRequest}
                    type="button"
                    className="mt-8 w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
                >
                    {type === "signup" ? "Sign up" : "Sign in"}
                </button>
            </div>
        </div>
    )
}

interface LabelledInputType {
    label: string;
    placeholder: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}

function LabelledInput({ label, placeholder, onChange, type }: LabelledInputType) {
    return (
        <div className="pt-4">
            <label className="mb-2 block text-sm font-semibold text-slate-200">
                {label}
            </label>
            <input
                onChange={onChange}
                type={type || "text"}
                className="block w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
                placeholder={placeholder}
                required
            />
        </div>
    )
}