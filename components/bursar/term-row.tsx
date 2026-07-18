"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateTerm, deleteTerm } from "@/lib/terms/actions";

export function TermRow({
  term,
}: {
  term: { id: string; name: string; start_date: string; end_date: string };
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(term.name);
  const [startDate, setStartDate] = useState(term.start_date);
  const [endDate, setEndDate] = useState(term.end_date);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const router = useRouter();

  async function handleSave() {
    setError(null);
    const result = await updateTerm({ termId: term.id, name, startDate, endDate });
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    setError(null);
    const result = await deleteTerm(term.id);
    if (result.error) {
      setError(result.error);
      setConfirmingDelete(false);
      return;
    }
    router.refresh();
  }

  const inputClass = "rounded-md border border-line px-2 py-1 text-sm text-ink";

  if (editing) {
    return (
      <li className="py-2">
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`ml-2 ${inputClass}`} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={`ml-2 ${inputClass}`} />
        <button onClick={handleSave} className="ml-2 text-sm text-trust">Save</button>
        <button onClick={() => setEditing(false)} className="ml-2 text-sm text-ink/50">Cancel</button>
        {error && <p className="mt-1 text-sm text-overdue">{error}</p>}
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between py-2 text-ink">
      <span>{term.name} <span className="text-ink/50 text-sm">({term.start_date} to {term.end_date})</span></span>
      <span>
        <button onClick={() => setEditing(true)} className="text-sm text-trust">Edit</button>
        {!confirmingDelete ? (
          <button onClick={() => setConfirmingDelete(true)} className="ml-3 text-sm text-overdue">Remove</button>
        ) : (
          <span className="ml-3 text-sm">
            Sure? <button onClick={handleDelete} className="font-medium text-overdue">Yes</button>{" "}
            <button onClick={() => setConfirmingDelete(false)} className="text-ink/50">No</button>
          </span>
        )}
      </span>
      {error && <p className="mt-1 text-sm text-overdue">{error}</p>}
    </li>
  );
}
