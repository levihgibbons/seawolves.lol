"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { Button, Input, Label, ErrorText, Card } from "@/components/ui";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

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
    setLoading(true);
    try {
      await postJson("/api/auth/reset-password", { token: resetToken, password });
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
        ? "Verify your email"
        : step === "setPassword"
          ? "Create a password"
          : "Sign in";

  const subtext =
    step === "password"
      ? email
      : step === "code"
        ? `We sent a 6-digit code to ${email}.`
        : step === "setPassword"
          ? "You're verified — pick a password to finish setting up your account."
          : step === "google-only"
            ? `${email} uses Google sign-in.`
            : "Enter your email to sign in or create an account.";

  return (
    <div className="mx-auto max-w-sm px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
      <p className="mt-1 text-sm text-gray-600">{subtext}</p>
      <Card className="mt-6 p-6">
        {step === "email" && (
          <>
            <GoogleSignInButton callbackUrl={callbackUrl} />
            <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
              <div className="h-px flex-1 bg-gray-200" />
              or
              <div className="h-px flex-1 bg-gray-200" />
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
                />
              </div>
              <ErrorText>{error}</ErrorText>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Continuing..." : "Continue"}
              </Button>
            </form>
          </>
        )}

        {step === "password" && (
          <form onSubmit={submitPassword} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <ErrorText>{error}</ErrorText>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={reset} className="text-navy hover:underline">
                Use a different email
              </button>
              <a
                href={`/forgot-password?email=${encodeURIComponent(email)}`}
                className="text-navy hover:underline"
              >
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
                className="tracking-[0.5em]"
              />
            </div>
            <ErrorText>{error}</ErrorText>
            {codeSentAgain && <p className="text-sm text-green-700">A new code was sent.</p>}
            <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
              {loading ? "Verifying..." : "Verify"}
            </Button>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={reset} className="text-navy hover:underline">
                Use a different email
              </button>
              <button type="button" onClick={resendCode} className="text-navy hover:underline">
                Resend code
              </button>
            </div>
          </form>
        )}

        {step === "setPassword" && (
          <form onSubmit={submitNewPassword} className="space-y-4">
            <div>
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                type="password"
                required
                autoFocus
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <p className="mt-1 text-xs text-gray-400">At least 8 characters.</p>
            </div>
            <ErrorText>{error}</ErrorText>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        )}

        {step === "google-only" && (
          <>
            <GoogleSignInButton callbackUrl={callbackUrl} />
            <button
              type="button"
              onClick={reset}
              className="mt-4 w-full text-center text-sm text-navy hover:underline"
            >
              Use a different email
            </button>
          </>
        )}
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
