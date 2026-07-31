"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Password updated. Redirecting to sign in...");
    setTimeout(() => router.push("/login"), 1500);
  }

  const inputClass = "mt-1 block w-full rounded-md border border-line px-3 py-2 text-ink";

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper p-6">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6">
        <p className="text-xs font-semibold tracking-wide text-ink/40">SCHOOLOS</p>
        <h1 className="mt-1 text-xl font-bold text-ink">Set a new password</h1>

        <form onSubmit={handleSubmit} className="mt-4">
          <label className="text-sm text-ink/70">New password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />

          {error && <p className="mt-2 text-sm text-overdue">{error}</p>}
          {message && <p className="mt-2 text-sm text-collected">{message}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-4 w-full rounded-md bg-trust px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Update password"}
          </button>
        </form>
      </div>
    </main>
  );
}
