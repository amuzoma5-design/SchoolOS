"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signUpSchool } from "@/lib/signup/actions";

function SignUpForm() {
  const [schoolName, setSchoolName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref") ?? undefined;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const result = await signUpSchool({ schoolName, ownerName, email, password, referralCode });

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/login");
  }

  const inputClass = "mt-1 block w-full rounded-md border border-line px-3 py-2 text-ink";

  return (
    <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6">
      <p className="text-xs font-semibold tracking-wide text-ink/40">SCHOOLOS</p>
      <h1 className="mt-1 text-xl font-bold text-ink">Set up your school</h1>
      {referralCode && (
        <p className="mt-1 text-sm text-collected">You'll get a bonus free month for signing up via referral!</p>
      )}

      <form onSubmit={handleSubmit} className="mt-4">
        <label className="text-sm text-ink/70">School name</label>
        <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className={inputClass} />

        <label className="mt-3 block text-sm text-ink/70">Your name</label>
        <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputClass} />

        <label className="mt-3 block text-sm text-ink/70">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />

        <label className="mt-3 block text-sm text-ink/70">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />

        {error && <p className="mt-2 text-sm text-overdue">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-4 w-full rounded-md bg-trust px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Creating your school..." : "Create my school"}
        </button>
      </form>

      <a href="/login" className="mt-4 block text-center text-sm text-trust">Already have an account? Sign in</a>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper p-6">
      <Suspense fallback={<div className="text-sm text-ink/50">Loading...</div>}>
        <SignUpForm />
      </Suspense>
    </main>
  );
}
