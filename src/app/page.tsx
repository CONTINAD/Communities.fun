import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";

export default async function LandingPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/home");
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Nav */}
      <header className="w-full border-b border-border-primary">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <span className="text-accent font-bold text-2xl tracking-tight">
            Communities<span className="text-text-primary">.fun</span>
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-text-primary text-[15px] font-medium hover:text-accent transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="bg-accent hover:bg-accent-hover text-white font-bold rounded-full px-5 py-2 text-[15px] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <section className="max-w-3xl w-full text-center pt-20 pb-16 sm:pt-28 sm:pb-24">
          <h1 className="text-5xl sm:text-7xl font-extrabold text-text-primary tracking-tight leading-[1.1]">
            The home for
            <br />
            <span className="text-accent">memecoin communities</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-xl mx-auto leading-relaxed">
            Create and discover communities for your favorite tokens. Pull data
            from DexScreener, connect your X account, and build your community.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-white font-bold rounded-full px-10 py-3.5 text-[17px] transition-colors text-center"
            >
              Get started
            </Link>
            <Link
              href="/sign-in"
              className="w-full sm:w-auto border border-border-primary text-text-primary font-bold rounded-full px-10 py-3.5 text-[17px] transition-colors hover:bg-bg-hover text-center"
            >
              Sign in
            </Link>
          </div>
        </section>

        {/* Feature cards */}
        <section className="max-w-5xl w-full pb-20 sm:pb-28 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* DexScreener Integration */}
            <div className="rounded-2xl border border-border-primary bg-bg-secondary p-6 hover:border-accent/40 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 className="text-text-primary font-bold text-lg mb-2">
                DexScreener Integration
              </h3>
              <p className="text-text-secondary text-[15px] leading-relaxed">
                Paste a contract address and auto-fill your community with live
                token data, charts, and market stats from DexScreener.
              </p>
            </div>

            {/* X Connected */}
            <div className="rounded-2xl border border-border-primary bg-bg-secondary p-6 hover:border-accent/40 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </div>
              <h3 className="text-text-primary font-bold text-lg mb-2">
                X Connected
              </h3>
              <p className="text-text-secondary text-[15px] leading-relaxed">
                Sign in with your X account, sync your profile, and engage with
                communities using your existing identity.
              </p>
            </div>

            {/* Community Powered */}
            <div className="rounded-2xl border border-border-primary bg-bg-secondary p-6 hover:border-accent/40 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 mb-4">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-text-primary font-bold text-lg mb-2">
                Community Powered
              </h3>
              <p className="text-text-secondary text-[15px] leading-relaxed">
                Post, like, reply, and repost within communities. Build real
                engagement around the tokens you believe in.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-primary py-6 text-center">
        <span className="text-text-secondary text-sm">
          Communities<span className="text-text-secondary">.fun</span>
        </span>
      </footer>
    </div>
  );
}
