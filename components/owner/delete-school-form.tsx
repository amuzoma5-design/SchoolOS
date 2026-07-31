"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMySchool } from "@/lib/settings/actions";

export function DeleteSchoolForm({ schoolName }: { schoolName: string }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setError(null);
    setSaving(true);

    const result = await deleteMySchool(typed, schoolName);

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/login");
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm font-medium text-overdue">
        Delete this school
      </button>
    );
  }

  return (
    <div className="rounded-md border border-overdue bg-white p-4">
      <p className="text-sm font-semibold text-overdue">This permanently deletes everything</p>
      <p className="mt-1 text-sm text-ink/70">
        All students, classes, terms, fee structures, invoices, payments, and staff logins for{" "}
        <b>{schoolName}</b> will be permanently removed. This cannot be undone.
      </p>
      <p className="mt-3 text-sm text-ink/70">
        Type <b>{schoolName}</b> to confirm:
      </p>
      <input
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        className="mt-2 block w-full rounded-md border border-line px-3 py-2 text-ink"
      />
      {error && <p className="mt-2 text-sm text-overdue">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          onClick={handleDelete}
          disabled={saving || typed.trim() !== schoolName.trim()}
          className="rounded-md bg-overdue px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {saving ? "Deleting..." : "Yes, permanently delete"}
        </button>
        <button onClick={() => setOpen(false)} className="text-sm text-ink/50">
          Cancel
        </button>
      </div>
    </div>
  );
}
