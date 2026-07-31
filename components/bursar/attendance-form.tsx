"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStudentsForAttendance, saveAttendance } from "@/lib/attendance/actions";

type StudentRow = { id: string; name: string; status: string };

export function AttendanceForm({ classes }: { classes: { id: string; name: string }[] }) {
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    getStudentsForAttendance(classId, date).then((result) => {
      setStudents(result.students);
      setLoading(false);
    });
  }, [classId, date]);

  function updateStatus(studentId: string, status: string) {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, status } : s)));
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const result = await saveAttendance({
      classId,
      date,
      records: students.map((s) => ({ studentId: s.id, status: s.status })),
    });
    setSaving(false);

    if (result.error) {
      setMessage("Error: " + result.error);
      return;
    }

    setMessage("Attendance saved for " + students.length + " student(s)");
    router.refresh();
  }

  const statusStyles: Record<string, string> = {
    present: "bg-collected text-white",
    absent: "bg-overdue text-white",
    late: "bg-pending text-white",
  };
  const inactiveStyle = "bg-paper text-ink/60 border border-line";

  return (
    <div>
      <div className="flex gap-3">
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm text-ink"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm text-ink"
        />
      </div>

      {loading && <p className="mt-4 text-sm text-ink/60">Loading students...</p>}

      {!loading && students.length === 0 && (
        <p className="mt-4 text-sm text-ink/60">No students in this class.</p>
      )}

      <ul className="mt-4 divide-y divide-line">
        {students.map((s) => (
          <li key={s.id} className="flex items-center justify-between py-2">
            <span className="text-ink">{s.name}</span>
            <span className="flex gap-1">
              {["present", "absent", "late"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => updateStatus(s.id, opt)}
                  className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${
                    s.status === opt ? statusStyles[opt] : inactiveStyle
                  }`}
                >
                  {opt}
                </button>
              ))}
            </span>
          </li>
        ))}
      </ul>

      {students.length > 0 && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 rounded-md bg-trust px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save attendance"}
        </button>
      )}

      {message && <p className="mt-2 text-sm text-ink/70">{message}</p>}
    </div>
  );
}
