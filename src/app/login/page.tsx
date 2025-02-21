"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/utils/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return; // 二重送信防止

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session) {
          startTransition(() => {
            router.push("/admin");
            router.refresh();
          });
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // loading状態をボタンに反映
  const isButtonDisabled = loading || isPending;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-6 text-2xl font-bold">Admin Login</h1>
        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="mb-2 block">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
              disabled={isButtonDisabled}
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
              disabled={isButtonDisabled}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isButtonDisabled}>
            {isButtonDisabled ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
