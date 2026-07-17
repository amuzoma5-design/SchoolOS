"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBursar } from "@/lib/staff/actions";

export function StaffForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const result = await createBursar({ name, email, password });

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    router.refresh();
  }

  const inputClass = "mt-1 block w-full rounded-md border border-line px-3 py-2 text-ink";

  return (
    <form onSubmit={handleSubmit}>
      <label className="text-sm text-ink/70">Bursar name</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />

      <label className="mt-3 block text-sm text-ink/70">Email</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />

      <label className="mt-3 block text-sm text-ink/70">Temporary password</label>
      <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      <p className="mt-1 text-xs text-ink/50">Share this with them directly - they can log in with it right away.</p>

      {error && <p className="mt-2 text-sm text-overdue">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="mt-3 rounded-md bg-trust px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? "Creating..." : "Create bursar login"}
      </button>
    </form>
  );
}
