"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { Button, Input, Label, ErrorText } from "@/components/ui";
import { PasswordInput } from "@/components/PasswordInput";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { AuthShell } from "@/components/AuthShell";

type Step = "email" | "password" | "code" | "setPassword" | "google-only";

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
  return data;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const oauthError = searchParams.get("error");

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    oauthError
      ? "That Google account can't sign in here — it may not be on an allowed domain, or the account is suspended."
      : null
  );
  const [loading, setLoading] = useState(false);
  const [codeSentAgain, setCodeSentAgain] = useState(false);

  function reset() {
    setStep("email");
    setPassword("");
    setConfirmPassword("");
    setUsername("");
    setCode("");
    setResetToken(null);
    setError(null);
    setCodeSentAgain(false);
  }

  async function submitEmail(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await postJson("/api/auth/start", { email });
      if (data.mode === "password") setStep("password");
      else if (data.mode === "code") setStep("code");
      else if (data.mode === "google-only") setStep("google-only");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function submitPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError(
        "Incorrect password, or your account isn't active. If you're locked out, reset your password or contact an admin."
      );
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  async function submitCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await postJson("/api/auth/verify-code", { email, code });
      setResetToken(data.token);
      setStep("setPassword");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setError(null);
    setCodeSentAgain(false);
    try {
      await postJson("/api/auth/start", { email });
      setCodeSentAgain(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function submitNewPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Those passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await postJson("/api/auth/reset-password", { token: resetToken, password, username });
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) throw new Error("Account created, but sign-in failed — try signing in below.");
      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const heading =
    step === "password"
      ? "Welcome back"
      : step === "code"
        ? "Check your email"
        : step === "setPassword"
          ? "Finish setting up"
          : "Sign in";

  const subtext =
    step === "password"
      ? email
      : step === "code"
        ? `We sent a 6-digit code to ${email}.`
        : step === "setPassword"
          ? "Pick a username and a password — that's the last step."
          : step === "google-only"
            ? `${email} uses Google sign-in.`
            : "Use your email to sign in or make an account.";

  const switchLink =
    "text-sm font-bold text-surf-600 transition-colors duration-150 hover:text-surf-500";

  return (
    <AuthShell title={heading} subtitle={subtext}>
      {step === "email" && (
        <>
          <GoogleSignInButton callbackUrl={callbackUrl} />
          <div className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-navy-300">
            <div className="h-px flex-1 bg-navy-100" />
            or
            <div className="h-px flex-1 bg-navy-100" />
          </div>
          <form onSubmit={submitEmail} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@email.com"
              />
            </div>
            <ErrorText>{error}</ErrorText>
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Checking…" : "Continue"}
            </Button>
          </form>
        </>
      )}

      {step === "password" && (
        <form onSubmit={submitPassword} className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <div className="flex justify-between gap-3">
            <button type="button" onClick={reset} className={switchLink}>
              Different email
            </button>
            <a href={`/forgot-password?email=${encodeURIComponent(email)}`} className={switchLink}>
              Forgot password?
            </a>
          </div>
        </form>
      )}

      {step === "code" && (
        <form onSubmit={submitCode} className="space-y-4">
          <div>
            <Label htmlFor="code">6-digit code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-center font-display text-2xl font-extrabold tracking-[0.45em]"
            />
          </div>
          <ErrorText>{error}</ErrorText>
          {codeSentAgain && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              New code sent.
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || code.length !== 6}
          >
            {loading ? "Verifying…" : "Verify"}
          </Button>
          <div className="flex justify-between gap-3">
            <button type="button" onClick={reset} className={switchLink}>
              Different email
            </button>
            <button type="button" onClick={resendCode} className={switchLink}>
              Resend code
            </button>
          </div>
        </form>
      )}

      {step === "setPassword" && (
        <form onSubmit={submitNewPassword} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              required
              autoFocus
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
            <p className="mt-1.5 text-xs text-navy-400">
              This is the name on everything you post. Letters, numbers and underscores.
            </p>
          </div>
          <div>
            <Label htmlFor="new-password">Password</Label>
            <PasswordInput
              id="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <p className="mt-1.5 text-xs text-navy-400">At least 8 characters.</p>
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm password</Label>
            <PasswordInput
              id="confirm-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <ErrorText>{error}</ErrorText>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      )}

      {step === "google-only" && (
        <>
          <GoogleSignInButton callbackUrl={callbackUrl} />
          <button type="button" onClick={reset} className={`mt-4 w-full text-center ${switchLink}`}>
            Use a different email
          </button>
        </>
      )}
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
