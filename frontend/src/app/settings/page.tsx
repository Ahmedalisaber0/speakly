"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  apiChangePassword,
  apiDeleteVoiceSample,
  apiUpdateProfile,
  apiUploadVoiceSample,
  voiceSampleUrl,
} from "@/lib/auth-api";
import VoiceSampleRecorder from "@/components/voice/VoiceSampleRecorder";
import PasswordField from "@/components/auth/PasswordField";
import { LANGUAGES, Language } from "@/types";

const STYLES = ["Casual", "Professional", "Formal"] as const;

export default function SettingsPage() {
  const { user, refresh } = useAuth();

  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState<Language>("English");
  const [dialect, setDialect] = useState("");
  const [style, setStyle] = useState<(typeof STYLES)[number]>("Casual");
  const [targetLanguage, setTargetLanguage] = useState<Language>("English");
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceMsg, setVoiceMsg] = useState<string | null>(null);
  const [savingVoice, setSavingVoice] = useState(false);

  // Hydrate form fields once the user profile loads.
  useEffect(() => {
    if (!user) return;
    setCountry(user.country || "");
    setLanguage((user.language as Language) || "English");
    setDialect(user.dialect || "");
    setStyle((user.communication_style as (typeof STYLES)[number]) || "Casual");
    setTargetLanguage((user.target_language as Language) || "English");
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">⚙️</p>
          <p className="text-[var(--text-secondary)]">Loading your settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-[var(--border-primary)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/chat" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2">
                <span>←</span>
                <span className="hidden sm:inline">Back to Chat</span>
              </Link>
              <div className="h-6 w-px bg-[var(--border-primary)]"></div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
            </div>
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-azure)] bg-clip-text text-transparent">
              Speakly
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Section */}
        <section className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Profile</h2>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username (Disabled) */}
              <div className="flex flex-col gap-2">
                <label htmlFor="username" className="text-sm font-semibold text-[var(--text-primary)]">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={user.username}
                  disabled
                  className="px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-muted)] text-[var(--text-secondary)] cursor-not-allowed"
                />
              </div>

              {/* Country */}
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
                  className="px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
              </div>

              {/* Native Language */}
              <div className="flex flex-col gap-2">
                <label htmlFor="native-lang" className="text-sm font-semibold text-[var(--text-primary)]">
                  Native Language
                </label>
                <select
                  id="native-lang"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Practice Language */}
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

              {/* Dialect */}
              <div className="flex flex-col gap-2">
                <label htmlFor="dialect" className="text-sm font-semibold text-[var(--text-primary)]">
                  Dialect / Accent
                </label>
                <input
                  id="dialect"
                  type="text"
                  value={dialect}
                  onChange={(e) => setDialect(e.target.value)}
                  placeholder="Standard"
                  className="px-4 py-3 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
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
            </div>

            {/* Save Button & Messages */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-[var(--border-primary)]">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:bg-[var(--border-primary)] text-white font-semibold transition-all flex items-center gap-2"
              >
                {savingProfile ? (
                  <>
                    <span className="animate-spin-slow">⚙️</span>
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save Profile"
                )}
              </button>
              {profileMsg && (
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">✓ {profileMsg}</p>
              )}
              {profileErr && (
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">✗ {profileErr}</p>
              )}
            </div>
          </form>
        </section>

        {/* Voice Sample Section */}
        <section className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Voice Sample</h2>
          <div className="space-y-6">
            {user.has_voice_sample ? (
              <div className="space-y-4">
                <p className="text-[var(--text-secondary)]">
                  You have a voice sample on file. Replay or replace it below.
                </p>
                <audio
                  src={`${voiceSampleUrl()}?t=${user.user_id}`}
                  controls
                  className="w-full h-12 rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleDeleteVoice}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline font-semibold transition-colors"
                >
                  Delete Sample
                </button>
              </div>
            ) : (
              <p className="text-[var(--text-secondary)]">No voice sample saved yet.</p>
            )}

            {/* Voice Recorder */}
            <div className="border-t border-[var(--border-primary)] pt-6">
              <VoiceSampleRecorder onChange={setVoiceBlob} />
            </div>

            {/* Save Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-[var(--border-primary)]">
              <button
                type="button"
                onClick={handleSaveVoice}
                disabled={!voiceBlob || savingVoice}
                className="px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:bg-[var(--border-primary)] text-white font-semibold transition-all flex items-center gap-2"
              >
                {savingVoice ? (
                  <>
                    <span className="animate-spin-slow">⚙️</span>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>Save Sample</span>
                  </>
                )}
              </button>
              {voiceMsg && (
                <p className="text-sm text-[var(--text-secondary)]">{voiceMsg}</p>
              )}
            </div>
          </div>
        </section>

        {/* Password Section */}
        <section className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-8 animate-fade-in">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Change Password</h2>
          <form onSubmit={handleSavePassword} className="max-w-md space-y-5">
            {/* Current Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="current-pw" className="text-sm font-semibold text-[var(--text-primary)]">
                Current Password
              </label>
              <PasswordField
                id="current-pw"
                label=""
                value={currentPw}
                onChange={setCurrentPw}
                required
                autoComplete="current-password"
              />
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="new-pw" className="text-sm font-semibold text-[var(--text-primary)]">
                New Password
              </label>
              <PasswordField
                id="new-pw"
                label=""
                value={newPw}
                onChange={setNewPw}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="confirm-new-pw" className="text-sm font-semibold text-[var(--text-primary)]">
                Confirm New Password
              </label>
              <PasswordField
                id="confirm-new-pw"
                label=""
                value={confirmPw}
                onChange={setConfirmPw}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            {/* Update Button & Messages */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-[var(--border-primary)]">
              <button
                type="submit"
                disabled={savingPw}
                className="px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] disabled:bg-[var(--border-primary)] text-white font-semibold transition-all flex items-center gap-2"
              >
                {savingPw ? (
                  <>
                    <span className="animate-spin-slow">⚙️</span>
                    <span>Updating...</span>
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
              {pwMsg && (
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">✓ {pwMsg}</p>
              )}
              {pwErr && (
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">✗ {pwErr}</p>
              )}
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
}
