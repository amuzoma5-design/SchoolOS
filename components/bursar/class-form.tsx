"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClass } from "@/lib/classes/actions";

export function ClassForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await createClass({ name });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="text-sm text-ink/70">Class name</label>
      <input
        type="text"
        placeholder="e.g. JSS1A"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mt-1 block w-full rounded-md border border-line px-3 py-2 text-ink"
      />
      {error && <p className="mt-2 text-sm text-overdue">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="mt-3 rounded-md bg-trust px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? "Saving..." : "Create class"}
      </button>
    </form>
  );
}
