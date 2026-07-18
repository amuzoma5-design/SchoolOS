"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStudent, deleteStudent } from "@/lib/students/actions";

export function EditStudentForm({
  student,
  classes,
}: {
  student: { id: string; name: string; class_id: string; admission_no: string | null };
  classes: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(student.name);
  const [classId, setClassId] = useState(student.class_id);
  const [admissionNo, setAdmissionNo] = useState(student.admission_no ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const result = await updateStudent({ studentId: student.id, name, classId, admissionNo });

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    router.refresh();
  }

  async function handleDelete() {
    setSaving(true);
    const result = await deleteStudent(student.id);
    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-trust">
        Edit
      </button>
    );
  }

  const inputClass = "mt-1 block w-full rounded-md border border-line px-2 py-1 text-sm text-ink";

  return (
    <form onSubmit={handleSubmit} className="mt-2 rounded-md border border-line bg-paper p-3">
      <label className="text-xs text-ink/60">Name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />

      <label className="mt-2 block text-xs text-ink/60">Class</label>
      <select value={classId} onChange={(e) => setClassId(e.target.value)} className={inputClass}>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <label className="mt-2 block text-xs text-ink/60">Admission number</label>
      <input value={admissionNo} onChange={(e) => setAdmissionNo(e.target.value)} className={inputClass} />

      {error && <p className="mt-2 text-sm text-overdue">{error}</p>}

      <div className="mt-2 flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-trust px-3 py-1 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink/50">
          Cancel
        </button>

        <span className="ml-auto">
          {!confirmingDelete ? (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="text-sm text-overdue"
            >
              Remove student
            </button>
          ) : (
            <span className="text-sm">
              Sure?{" "}
              <button type="button" onClick={handleDelete} className="font-medium text-overdue">
                Yes, remove
              </button>{" "}
              <button type="button" onClick={() => setConfirmingDelete(false)} className="text-ink/50">
                No
              </button>
            </span>
          )}
        </span>
      </div>
    </form>
  );
}
