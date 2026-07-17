"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTerm } from "@/lib/terms/actions";

export function TermForm() {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await createTerm({ name, startDate, endDate });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setName("");
    setStartDate("");
    setEndDate("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="text-sm text-ink/70">Term name</label>
      <input
        type="text"
        placeholder="e.g. 2026 Third Term"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-1 block w-full rounded-md border border-line px-3 py-2 text-ink"
      />
      <label className="mt-3 block text-sm text-ink/70">Start date</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="mt-1 block w-full rounded-md border border-line px-3 py-2 text-ink"
      />
      <label className="mt-3 block text-sm text-ink/70">End date</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="mt-1 block w-full rounded-md border border-line px-3 py-2 text-ink"
      />
      {error && <p className="mt-2 text-sm text-overdue">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="mt-3 rounded-md bg-trust px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? "Saving..." : "Create term"}
      </button>
    </form>
  );
}
