"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStudent } from "@/lib/students/actions";

export function StudentForm({ classes }: { classes: { id: string; name: string }[] }) {
  const [name, setName] = useState("");
  const [classId, setClassId] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await createStudent({ name, classId, parentName, parentPhone, admissionNo });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setName("");
    setClassId("");
    setParentName("");
    setParentPhone("");
    setAdmissionNo("");
    router.refresh();
  }

  const inputClass = "mt-1 block w-full rounded-md border border-line px-3 py-2 text-ink";
  const labelClass = "mt-3 block text-sm text-ink/70";

  return (
    <form onSubmit={handleSubmit}>
      <label className="text-sm text-ink/70">Student name</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />

      <label className={labelClass}>Class</label>
      <select value={classId} onChange={(e) => setClassId(e.target.value)} className={inputClass}>
        <option value="">Select a class</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <label className={labelClass}>Admission number (optional)</label>
      <input type="text" value={admissionNo} onChange={(e) => setAdmissionNo(e.target.value)} className={inputClass} />

      <label className={labelClass}>Parent name</label>
      <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} className={inputClass} />

      <label className={labelClass}>Parent phone</label>
      <input type="text" placeholder="e.g. 08012345678" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} className={inputClass} />

      {error && <p className="mt-2 text-sm text-overdue">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="mt-3 rounded-md bg-trust px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? "Saving..." : "Add student"}
      </button>
    </form>
  );
}
