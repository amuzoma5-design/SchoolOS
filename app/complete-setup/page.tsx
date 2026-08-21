"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { completeGoogleSignup } from "@/lib/signup/actions";
import { createClient } from "@/lib/supabase/client";

export default function CompleteSetupPage() {
  const [schoolName, setSchoolName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const guessedName =
        (data.user?.user_metadata as any)?.full_name ||
        (data.user?.user_metadata as any)?.name ||
        "";
      setOwnerName(guessedName);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const result = await completeGoogleSignup({ schoolName, ownerName });

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/");
    router.refresh();
  }

  const inputClass = "mt-1 block w-full rounded-md border border-line px-3 py-2 text-ink";

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper p-6">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6">
        <p className="text-xs font-semibold tracking-wide text-ink/40">SCHOOLOS</p>
        <h1 className="mt-1 text-xl font-bold text-ink">One last step</h1>

        <form onSubmit={handleSubmit} className="mt-4">
          <label className="text-sm text-ink/70">Your name</label>
          <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="e.g. Uzoma Victor" className={inputClass} />
          <p className="mt-1 text-xs text-ink/50">We got this from your Google account - correct it if it's not right.</p>

          <label className="mt-4 block text-sm text-ink/70">What's your school called?</label>
          <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="e.g. Bright Future Academy" className={inputClass} />

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
