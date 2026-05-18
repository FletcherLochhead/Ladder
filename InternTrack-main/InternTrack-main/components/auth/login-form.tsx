"use client";

import { ArrowUpRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { createClient } from "@/lib/supabase/client";

const ERR_MESSAGES: Record<string, string> = {
  oauth: "Couldn't reach Google, try email instead.",
  callback: "Sign-in didn't complete. Mind trying once more?",
  generic: "Something went sideways. Try again.",
};

export function LoginForm({
  next,
  error,
}: {
  next?: string;
  error?: string;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(
    error ? (ERR_MESSAGES[error] ?? ERR_MESSAGES.generic) : null,
  );

  const passwordsMismatch =
    mode === "signup" &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  async function handleGoogle() {
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next ?? "/dashboard")}`,
      },
    });
    if (error) setMessage(ERR_MESSAGES.oauth);
  }

  function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (mode === "signup" && password !== confirmPassword) {
      setMessage("Passwords don't match, give the second one another go.");
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next ?? "/onboarding")}`,
          },
        });
        if (error) {
          setMessage(error.message);
        } else if (data.session) {
          // "Confirm email" is off, instant session.
          window.location.href = next ?? "/onboarding";
        } else {
          setMessage(
            "Check your inbox for a confirmation link to finish signing up.",
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setMessage(error.message);
        } else {
          window.location.href = next ?? "/dashboard";
        }
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={pending}
        className="group inline-flex items-center justify-center gap-3 border border-hairline bg-paper px-5 py-3.5 text-sm font-medium rounded-sm hover:border-ink hover:bg-paper-strong transition disabled:opacity-60"
      >
        <GoogleMark />
        Continue with Google
        <ArrowUpRight className="size-3.5 transition group-hover:rotate-45" />
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-hairline" />
        <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute">
          or
        </span>
        <div className="flex-1 border-t border-hairline" />
      </div>

      <form onSubmit={handleEmail} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@canterbury.ac.nz"
            className="w-full bg-transparent border-b border-hairline text-ink py-3 px-0 outline-none focus:border-primary transition placeholder:text-mute/60"
          />
        </label>
        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          show={showPassword}
          onToggleShow={() => setShowPassword((s) => !s)}
          autoComplete={
            mode === "signup" ? "new-password" : "current-password"
          }
          minLength={6}
        />

        {mode === "signup" && (
          <PasswordField
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            onToggleShow={() => setShowConfirm((s) => !s)}
            autoComplete="new-password"
            minLength={6}
            error={
              passwordsMismatch
                ? "Doesn't match the password above."
                : null
            }
          />
        )}

        <button
          type="submit"
          disabled={pending || passwordsMismatch}
          className="mt-3 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3.5 text-sm font-medium rounded-sm hover:bg-[var(--color-c-deep)] transition disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowUpRight className="size-4" />
          )}
          {mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode((m) => (m === "signin" ? "signup" : "signin"));
          setConfirmPassword("");
          setShowPassword(false);
          setShowConfirm(false);
          setMessage(null);
        }}
        className="text-sm text-mute hover:text-foreground transition self-start underline-offset-4 underline decoration-hairline hover:decoration-primary"
      >
        {mode === "signin"
          ? "New here? Create an account →"
          : "Already have an account? Sign in →"}
      </button>

      {message && (
        <p className="text-sm text-ink-soft border-l-2 border-primary pl-4 py-2 bg-paper-strong/50 rounded-sm">
          {message}
        </p>
      )}
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
  minLength,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  autoComplete: string;
  minLength?: number;
  error?: string | null;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-mute">
        {label}
      </span>
      <div className="relative flex items-center">
        <input
          type={show ? "text" : "password"}
          required
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          autoComplete={autoComplete}
          className={
            "w-full bg-transparent border-b text-ink py-3 pl-0 pr-8 outline-none transition placeholder:text-mute/60 " +
            (error
              ? "border-primary"
              : "border-hairline focus:border-primary")
          }
        />
        <button
          type="button"
          onClick={onToggleShow}
          tabIndex={-1}
          aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={show}
          className="absolute right-0 bottom-1.5 p-1.5 text-mute hover:text-ink transition"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && (
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
          {error}
        </span>
      )}
    </label>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.708A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.708V4.96H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.04l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.292C4.672 5.165 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
