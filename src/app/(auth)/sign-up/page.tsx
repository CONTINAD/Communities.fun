"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { signUp } from "@/actions/auth";

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [xLoading, setXLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (signInResult?.error) {
      router.push("/sign-in");
    } else {
      router.push("/home");
      router.refresh();
    }
  }

  async function handleXSignUp() {
    setXLoading(true);
    await signIn("twitter", { callbackUrl: "/home" });
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-text-primary">
          Communities<span className="text-accent">.fun</span>
        </h1>
        <p className="text-text-secondary mt-2">Create your account</p>
      </div>

      {/* Sign up with X */}
      <button
        onClick={handleXSignUp}
        disabled={xLoading}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-full bg-text-primary text-bg-primary font-bold text-base hover:bg-text-primary/90 disabled:opacity-50 transition-colors"
      >
        <XIcon />
        {xLoading ? "Connecting..." : "Sign up with X"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border-primary" />
        <span className="text-text-secondary text-sm">or</span>
        <div className="flex-1 h-px bg-border-primary" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div>
          <input
            type="text"
            name="name"
            placeholder="Display name"
            className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-primary text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            pattern="[a-zA-Z0-9_]+"
            minLength={3}
            maxLength={20}
            className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-primary text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-primary text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-lg bg-bg-primary border border-border-primary text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full border border-border-primary text-text-primary font-bold text-base hover:bg-bg-tertiary disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating account..." : "Create account with email"}
        </button>
      </form>

      <p className="text-center text-text-secondary">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
