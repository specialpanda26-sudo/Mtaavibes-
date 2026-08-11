"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="glass w-full max-w-sm rounded-card p-6">
        <h1 className="text-[20px] font-medium mb-5">Sign in</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full glass rounded-2xl px-4 py-3 text-[14px] mb-3 outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full glass rounded-2xl px-4 py-3 text-[14px] mb-4 outline-none"
        />

        {error && <p className="text-[12px] text-accentRed mb-3">{error}</p>}

        <button className="w-full rounded-button bg-ink py-3 text-[14px] font-medium text-white">
          Sign in
        </button>

        <p className="mt-4 text-center text-[13px] text-secondary">
          No account? <a href="/signup" className="font-medium text-ink">Sign up</a>
        </p>
      </form>
    </main>
  );
}
