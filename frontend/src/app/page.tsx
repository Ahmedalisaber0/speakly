"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Language, LANGUAGES } from "@/types";
import Flag from "@/components/Flag";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [nativeLanguage, setNativeLanguage] = useState<Language>("English");
  const [targetLanguage, setTargetLanguage] = useState<Language>("Spanish");

  // Already-authed visitors skip the marketing page.
  useEffect(() => {
    if (!loading && user) router.replace("/chat");
  }, [loading, user, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Header - Modern Navigation */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-primary)] bg-[var(--bg-primary)]/80 backdrop-blur-md">
        <div className="h-16 px-6 flex items-center justify-between max-w-7xl mx-auto w-full">
          <Link 
            href="/" 
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-azure)] flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <span className="text-xl font-bold text-[var(--text-primary)]">Speakly</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/translate" 
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-smooth"
            >
              Translate
            </Link>
            <Link 
              href="/news" 
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-smooth"
            >
              News
            </Link>
            <Link 
              href="/login" 
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-smooth"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium transition-smooth"
            >
              Get started
            </Link>
          </nav>

          {/* Mobile Menu Icon */}
          <button className="md:hidden w-10 h-10 flex items-center justify-center text-[var(--text-primary)] hover:text-[var(--color-primary)]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6">
        {/* Hero Section */}
        <section className="py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-slide-up">
            <div className="space-y-4">
              <h1 className="h1 text-[var(--text-primary)] leading-tight">
                Practice languages with an AI{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-azure)]">
                  that knows you
                </span>
              </h1>
              <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                Speakly remembers your dialect, your style, and your past conversations — 
                so every interaction feels personal, not scripted. Practice with confidence.
              </p>
            </div>

            {/* Language Selection Card */}
            <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-6 space-y-4 shadow-sm">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                Choose your languages
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Native Language */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    Native Language
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)]">
                    <Flag language={nativeLanguage} size={20} />
                    <select
                      value={nativeLanguage}
                      onChange={(e) => setNativeLanguage(e.target.value as Language)}
                      className="flex-1 text-sm bg-transparent focus:outline-none text-[var(--text-primary)]"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-end justify-center pb-2">
                  <div className="text-2xl text-[var(--color-primary)] font-light">→</div>
                </div>

                {/* Target Language */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    Target Language
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)]">
                    <Flag language={targetLanguage} size={20} />
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value as Language)}
                      className="flex-1 text-sm bg-transparent focus:outline-none text-[var(--text-primary)]"
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href="/register"
                className="px-6 py-3 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium transition-smooth flex items-center justify-center gap-2"
              >
                <span>Create account</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 rounded-lg border-2 border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] font-medium transition-smooth"
              >
                Sign in
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="hidden lg:flex items-center justify-center animate-slide-down">
            <div className="w-full h-96 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/10 via-[var(--color-azure)]/10 to-[var(--color-purple)]/10 border border-[var(--border-primary)] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-azure)] mx-auto flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <p className="text-sm text-[var(--text-secondary)]">Start practicing now</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="h2 text-[var(--text-primary)]">Why choose Speakly?</h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Designed for learners who want a smarter, more personal language learning experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🎯",
                title: "Personalized Learning",
                body: "Speakly adapts to your dialect, style, and pace — making every session uniquely yours.",
                color: "from-[var(--color-primary)]"
              },
              {
                icon: "💾",
                title: "Conversation Memory",
                body: "All your conversations are saved. Pick up where you left off on any device.",
                color: "from-[var(--color-azure)]"
              },
              {
                icon: "🎤",
                title: "Natural Speech",
                body: "Practice with real-time speech recognition and natural voice feedback.",
                color: "from-[var(--color-purple)]"
              },
              {
                icon: "📰",
                title: "Real News Content",
                body: "Learn from today's headlines. Read, translate, and practice with current events.",
                color: "from-[var(--color-azure)]"
              },
              {
                icon: "🌍",
                title: "Multiple Languages",
                body: "Master one language or learn several at your own pace with a single account.",
                color: "from-[var(--color-primary)]"
              },
              {
                icon: "✨",
                title: "AI Feedback",
                body: "Get instant, personalized corrections and explanations for every message.",
                color: "from-[var(--color-purple)]"
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-6 hover:border-[var(--color-primary)] hover:shadow-md transition-smooth animate-slide-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} to-transparent flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-smooth`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-azure)] rounded-2xl p-12 text-center space-y-6">
            <h2 className="h2 text-white">
              Ready to practice smarter?
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Join thousands of language learners improving their skills every day with Speakly.
            </p>
            <Link
              href="/register"
              className="inline-block px-8 py-4 rounded-lg bg-white hover:bg-gray-50 text-[var(--color-primary)] font-bold transition-smooth"
            >
              Get started free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link href="/chat" className="hover:text-[var(--text-primary)] transition-smooth">Chat</Link></li>
                <li><Link href="/translate" className="hover:text-[var(--text-primary)] transition-smooth">Translate</Link></li>
                <li><Link href="/news" className="hover:text-[var(--text-primary)] transition-smooth">News</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link href="#" className="hover:text-[var(--text-primary)] transition-smooth">Blog</Link></li>
                <li><Link href="#" className="hover:text-[var(--text-primary)] transition-smooth">FAQ</Link></li>
                <li><Link href="#" className="hover:text-[var(--text-primary)] transition-smooth">Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link href="#" className="hover:text-[var(--text-primary)] transition-smooth">About</Link></li>
                <li><Link href="#" className="hover:text-[var(--text-primary)] transition-smooth">Privacy</Link></li>
                <li><Link href="#" className="hover:text-[var(--text-primary)] transition-smooth">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[var(--text-primary)] mb-4">Follow</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link href="#" className="hover:text-[var(--text-primary)] transition-smooth">Twitter</Link></li>
                <li><Link href="#" className="hover:text-[var(--text-primary)] transition-smooth">LinkedIn</Link></li>
                <li><Link href="#" className="hover:text-[var(--text-primary)] transition-smooth">GitHub</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[var(--border-primary)] pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]">
              © 2025 Speakly. All rights reserved.
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Made with ❤️ for language learners worldwide
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
