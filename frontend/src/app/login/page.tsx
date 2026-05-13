"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import AuthShell from "@/components/auth/AuthShell";
import PasswordField from "@/components/auth/PasswordField";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await login({ username: username.trim(), password, remember });
      const next = params.get("next") || "/chat";
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Username Field */}
      <div className="flex flex-col gap-2">
        <label htmlFor="username" className="text-sm font-semibold text-[var(--text-primary)]">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          placeholder="Enter your username"
          className="w-full px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
        />
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-semibold text-[var(--text-primary)]">
          Password
        </label>
        <PasswordField
          id="password"
          label=""
          value={password}
          onChange={setPassword}
          required
          autoComplete="current-password"
        />
      </div>

      {/* Remember Me */}
      <label className="flex items-center gap-3 text-sm text-[var(--text-secondary)] select-none cursor-pointer hover:text-[var(--text-primary)] transition-colors">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
          className="w-4 h-4 rounded border-[var(--border-primary)] cursor-pointer accent-[var(--color-primary)]"
        />
        <span>Remember me</span>
      </label>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-slide-down">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !username.trim() || !password}
        className="w-full px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:bg-[var(--border-primary)] disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 mt-2"
      >
        {loading ? (
          <>
            <span className="animate-spin-slow">⚙️</span>
            <span>Signing in...</span>
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your conversations."
      altLink={{ href: "/register", label: "Don't have an account? Create one" }}
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
