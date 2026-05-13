"use client";

import Link from "next/link";

interface Props {
  title: string;
  subtitle: string;
  altLink: { href: string; label: string };
  children: React.ReactNode;
}

export default function AuthShell({ title, subtitle, altLink, children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-[var(--border-primary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-azure)] bg-clip-text text-transparent">
              Speakly
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Title & Subtitle */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              {title}
            </h1>
            <p className="text-[var(--text-secondary)] mt-3 text-lg">
              {subtitle}
            </p>
          </div>

          {/* Form Container */}
          <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-8 shadow-lg">
            {children}
          </div>

          {/* Alt Link */}
          <p className="text-center text-[var(--text-secondary)] mt-6">
            <Link href={altLink.href} className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] font-semibold transition-colors">
              {altLink.label}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
