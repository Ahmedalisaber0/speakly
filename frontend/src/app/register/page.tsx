"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiUploadVoiceSample } from "@/lib/auth-api";
import AuthShell from "@/components/auth/AuthShell";
import PasswordField from "@/components/auth/PasswordField";
import VoiceSampleRecorder from "@/components/voice/VoiceSampleRecorder";
import { LANGUAGES, Language } from "@/types";

const STYLES = ["Casual", "Professional", "Formal"] as const;

// Lightweight dialect suggestions per language. Free-form text is also fine
// (the field is just a string on the user record).
const DIALECT_SUGGESTIONS: Record<Language, string[]> = {
  Arabic: ["Egyptian Arabic", "Levantine Arabic", "Gulf Arabic", "Maghrebi Arabic", "Iraqi Arabic", "Modern Standard"],
  English: ["American", "British", "Australian", "Canadian", "Indian"],
  Spanish: ["Mexican", "Castilian", "Argentinian", "Colombian"],
  French: ["European French", "Quebec French"],
  German: ["Standard German", "Austrian", "Swiss"],
  Italian: ["Standard Italian", "Sicilian"],
  Portuguese: ["Brazilian", "European Portuguese"],
  Japanese: ["Standard"],
  Korean: ["Standard"],
  Chinese: ["Mandarin", "Cantonese"],
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState<Language>("English");
  const [dialect, setDialect] = useState("");
  const [style, setStyle] = useState<(typeof STYLES)[number]>("Casual");
  const [targetLanguage, setTargetLanguage] = useState<Language>("English");
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register({
        username: username.trim(),
        password,
        confirm_password: confirm,
        email: email.trim() || undefined,
        country: country.trim() || undefined,
        language,
        dialect: dialect.trim() || undefined,
        communication_style: style,
        target_language: targetLanguage,
      });
      // Optional voice sample upload — non-blocking; failures don't abort signup.
      if (voiceBlob) {
        try {
          await apiUploadVoiceSample(voiceBlob);
        } catch (err) {
          console.warn("Voice sample upload failed:", err);
        }
      }
      router.replace("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

    <AuthShell
      title="Create your account"
      subtitle="Tell us about you so the AI can speak your way."
      altLink={{ href: "/login", label: "Already have an account? Sign in" }}
    >
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
            minLength={3}
            autoComplete="username"
            placeholder="Choose a username"
            className="w-full px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          />
        </div>

        {/* Email Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-semibold text-[var(--text-primary)]">
            Email <span className="text-[var(--text-secondary)] font-normal">(optional)</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          />
        </div>

        {/* Password Fields */}
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
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="confirm" className="text-sm font-semibold text-[var(--text-primary)]">
            Confirm Password
          </label>
          <PasswordField
            id="confirm"
            label=""
            value={confirm}
            onChange={setConfirm}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        {/* Country Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="country" className="text-sm font-semibold text-[var(--text-primary)]">
            Country
          </label>
          <input
            id="country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Egypt"
            className="w-full px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          />
        </div>

        {/* Language Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="native-lang" className="text-sm font-semibold text-[var(--text-primary)]">
              Native Language
            </label>
            <select
              id="native-lang"
              value={language}
              onChange={(e) => {
                const lang = e.target.value as Language;
                setLanguage(lang);
                setDialect("");
              }}
              className="px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
            >
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="practice-lang" className="text-sm font-semibold text-[var(--text-primary)]">
              Practice Language
            </label>
            <select
              id="practice-lang"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value as Language)}
              className="px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
            >
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dialect Field */}
        <div className="flex flex-col gap-2">
          <label htmlFor="dialect" className="text-sm font-semibold text-[var(--text-primary)]">
            Dialect / Accent
          </label>
          <input
            id="dialect"
            type="text"
            list="dialect-suggestions"
            value={dialect}
            onChange={(e) => setDialect(e.target.value)}
            placeholder={DIALECT_SUGGESTIONS[language]?.[0] || "Standard"}
            className="w-full px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          />
          <datalist id="dialect-suggestions">
            {(DIALECT_SUGGESTIONS[language] || []).map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
          <p className="text-xs text-[var(--text-secondary)]">
            Used to bias voice recognition and the AI's tone.
          </p>
        </div>

        {/* Communication Style */}
        <div className="flex flex-col gap-2">
          <label htmlFor="style" className="text-sm font-semibold text-[var(--text-primary)]">
            Communication Style
          </label>
          <select
            id="style"
            value={style}
            onChange={(e) => setStyle(e.target.value as (typeof STYLES)[number])}
            className="px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
          >
            {STYLES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Voice Sample */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--text-primary)]">
            Voice Sample
          </label>
          <VoiceSampleRecorder onChange={setVoiceBlob} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-slide-down">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:bg-[var(--border-primary)] disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <span className="animate-spin-slow">⚙️</span>
              <span>Creating account...</span>
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </AuthShell>
}
