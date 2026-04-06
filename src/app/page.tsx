import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";

export default async function LandingPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/home");
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Hero */}
        <div className="space-y-4">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-text-primary tracking-tight">
            Communities
            <span className="text-accent">.fun</span>
          </h1>
          <p className="text-xl text-text-secondary">
            Where communities thrive
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-white font-bold rounded-full px-8 py-3 text-[17px] transition-colors text-center"
          >
            Get started
          </Link>
          <Link
            href="/sign-in"
            className="w-full sm:w-auto border border-border-primary text-text-primary font-bold rounded-full px-8 py-3 text-[17px] transition-colors hover:bg-bg-hover text-center"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
