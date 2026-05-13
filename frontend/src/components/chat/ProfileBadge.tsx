"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getStrings } from "@/lib/strings";
import { Language } from "@/types";

interface Props {
  nativeLanguage: Language | null;
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  // Read the actual theme from the DOM after hydration. Can't do it in initial
  // state because `document` doesn't exist on the server.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("speakly-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("speakly-theme", "light");
    }
  };
  return (
    <button
      onClick={toggle}
      className="w-full text-left px-3 py-2 hover:bg-[var(--bg-muted)] text-sm flex items-center justify-between"
    >
      <span>{dark ? "Light theme" : "Dark theme"}</span>
      <span className="text-xs text-[var(--text-muted)]">{dark ? "☀" : "☾"}</span>
    </button>
  );
}

export default function ProfileBadge({ nativeLanguage }: Props) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const strings = getStrings(nativeLanguage);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!user) return null;
  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-[var(--bg-muted)] transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-[var(--accent)] text-white text-xs font-semibold flex items-center justify-center">
          {initials}
        </span>
        <span className="text-sm font-medium text-app hidden sm:block">{user.username}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-56 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-lg overflow-hidden z-20 animate-fade-in">
          <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
            <p className="text-sm font-medium text-app">{user.username}</p>
            {user.dialect && (
              <p className="text-xs text-[var(--text-muted)]" dir="auto">{user.dialect}</p>
            )}
          </div>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 hover:bg-[var(--bg-muted)] text-sm"
          >
            {strings.settings}
          </Link>
          <ThemeToggle />
          <button
            onClick={async () => {
              await logout();
              router.replace("/");
            }}
            className="w-full text-left px-3 py-2 hover:bg-[var(--bg-muted)] text-sm text-[var(--danger)]"
          >
            {strings.logout}
          </button>
        </div>
      )}
    </div>
  );
}
