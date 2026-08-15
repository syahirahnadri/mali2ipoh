"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/shared/Button";
import { getAdminSession, setAdminSession } from "@/lib/admin-session";

export default function AdminLoginForm({ demoEmail, demoPassword }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (getAdminSession()) {
      router.replace("/admin");
    }
  }, [router]);

  function handleLogin(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter both the demo email and password.");
      return;
    }

    if (email.trim() === demoEmail && password === demoPassword) {
      setAdminSession({
        email: email.trim(),
        loggedInAt: new Date().toISOString(),
        isMock: true,
      });
      router.replace("/admin");
      return;
    }

    setError("Invalid demo admin credentials.");
  }

  function fillDemoCredentials() {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  }

  return (
    <form onSubmit={handleLogin} className="admin-card overflow-hidden rounded-[2rem] p-3 md:p-4">
      <div className="admin-highlight rounded-[26px] p-6 md:p-7">
        <p className="eyebrow text-xs font-semibold text-[#54738c]">Mock POC authentication</p>
        <h1 className="mt-3 font-display text-4xl text-ink">Admin Login</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          Use demo credentials from local environment to access the admin panel with the same calm, premium travel feel as the landing page.
        </p>
      </div>

      <div className="mt-6 space-y-5 px-3 pb-3 md:px-4 md:pb-4">
        <div className="rounded-[22px] border border-[#d9e5ee] bg-[#f8fbfd] p-4 text-sm text-[#5d6d7f]">
          <p className="font-semibold text-ink">Local demo credentials</p>
          <p className="mt-3 break-all">
            <span className="font-medium text-ink">Email:</span> {demoEmail}
          </p>
          <p className="mt-2 break-all">
            <span className="font-medium text-ink">Password:</span> {demoPassword}
          </p>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="mt-4 inline-flex rounded-full border border-[#cfe0ea] bg-white px-4 py-2 text-sm font-semibold text-brand-deep transition hover:bg-[#f6fbfe]"
          >
            Use Demo Credentials
          </button>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-ink">Email</span>
          <input
            type="text"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            placeholder={demoEmail}
            className="admin-input mt-2 w-full rounded-2xl px-4 py-3 text-sm text-ink"
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-ink">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter demo password"
            className="admin-input mt-2 w-full rounded-2xl px-4 py-3 text-sm text-ink"
          />
        </label>

        {error ? <p className="text-sm font-medium text-brand-deep">{error}</p> : null}

        <div className="flex justify-end">
          <Button type="submit">Login</Button>
        </div>
      </div>
    </form>
  );
}
