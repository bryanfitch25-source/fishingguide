"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setPending(true);
    const supabase = createClient();

    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setPending(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/tackle");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setPending(false);
      if (error) {
        setError(error.message);
        return;
      }
      setInfo("Account created. Check your email to confirm, then sign in.");
      setMode("sign-in");
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 sm:px-6 py-16">
      <h1 className="text-2xl font-extrabold text-brand-dark mb-1">
        {mode === "sign-in" ? "Sign In" : "Create Account"}
      </h1>
      <p className="text-sm text-muted mb-6">
        Your tackle box and catch log are private to your account. The species guide stays
        public — no sign-in needed for that.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {error && (
          <p className="text-sm text-danger bg-danger-light rounded px-3 py-2">{error}</p>
        )}
        {info && (
          <p className="text-sm text-brand-dark bg-brand-light rounded px-3 py-2">{info}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-brand text-white font-semibold py-2.5 hover:bg-brand-dark transition disabled:opacity-60"
        >
          {pending ? "Please wait…" : mode === "sign-in" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <button
        onClick={() => {
          setMode(mode === "sign-in" ? "sign-up" : "sign-in");
          setError(null);
          setInfo(null);
        }}
        className="mt-4 text-sm text-accent hover:underline"
      >
        {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
