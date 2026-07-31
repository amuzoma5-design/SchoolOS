"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeGoogleSignup } from "@/lib/signup/actions";

export default function CompleteSetupPage() {
  const [schoolName, setSchoolName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const result = await completeGoogleSignup(schoolName);

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper p-6">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6">
        <p className="text-xs font-semibold tracking-wide text-ink/40">SCHOOLOS</p>
        <h1 className="mt-1 text-xl font-bold text-ink">One last step</h1>
        <p className="mt-1 text-sm text-ink/60">What's your school called?</p>

        <form onSubmit={handleSubmit} className="mt-4">
          <input
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="e.g. Bright Future Academy"
            className="block w-full rounded-md border border-line px-3 py-2 text-ink"
          />

          {error && <p className="mt-2 text-sm text-overdue">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-4 w-full rounded-md bg-trust px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Setting up..." : "Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}
