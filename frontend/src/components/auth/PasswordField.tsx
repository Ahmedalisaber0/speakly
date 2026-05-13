"use client";

import { useState } from "react";

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
}

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  required,
  autoComplete = "current-password",
  minLength,
}: Props) {
  const [show, setShow] = useState(false);
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm">
      <span className="text-app font-medium">{label}</span>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={autoComplete}
          minLength={minLength}
          className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-app pr-12 focus:outline-none focus:border-[var(--accent)]"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-app px-2 py-1 rounded"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
}
