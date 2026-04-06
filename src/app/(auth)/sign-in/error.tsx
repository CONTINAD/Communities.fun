"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    OAuthCallback: "There was a problem with the X sign-in callback. Check that the callback URL is correctly configured.",
    OAuthSignin: "Could not start X sign-in. Check your API keys.",
    OAuthAccountNotLinked: "This X account is already linked to a different user. Sign in with that account instead.",
    Callback: "There was an error during the sign-in callback.",
    Default: "An authentication error occurred.",
  };

  const message = error ? (errorMessages[error] || errorMessages.Default) : errorMessages.Default;

  return (
    <div className="space-y-6 text-center">
      <h1 className="text-2xl font-bold text-text-primary">Sign-in Error</h1>
      <p className="text-text-secondary">{message}</p>
      {error && (
        <p className="text-sm text-text-secondary font-mono bg-bg-secondary rounded-lg px-4 py-2">
          Error code: {error}
        </p>
      )}
      <Link
        href="/sign-in"
        className="inline-block bg-accent hover:bg-accent-hover text-white font-bold rounded-full px-6 py-2.5 transition-colors"
      >
        Try again
      </Link>
    </div>
  );
}
