"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { createApplication, getApplications } from "@/lib/admissions/actions";
import { AdmissionRow } from "@/components/bursar/admission-row";

export default function AdmissionsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [applicantName, setApplicantName] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [desiredClass, setDesiredClass] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadApplications() {
    const result = await getApplications();
    setApplications(result.applications);
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await createApplication({
      applicantName,
      parentName,
      parentPhone,
      desiredClass,
      notes,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setApplicantName("");
    setParentName("");
    setParentPhone("");
    setDesiredClass("");
    setNotes("");
    loadApplications();
  }

  const inputClass = "mt-1 block w-full rounded-md border border-line px-3 py-2 text-ink";
  const labelClass = "mt-3 block text-sm text-ink/70";

  return (
    <main className="min-h-screen bg-paper">
      <PageHeader title="Admissions" />
      <div className="p-6">
        <div className="max-w-md rounded-lg border border-line bg-white p-6">
          <form onSubmit={handleSubmit}>
            <label className="text-sm text-ink/70">Applicant name</label>
            <input value={applicantName} onChange={(e) => setApplicantName(e.target.value)} className={inputClass} />

            <label className={labelClass}>Desired class (optional)</label>
            <input value={desiredClass} onChange={(e) => setDesiredClass(e.target.value)} placeholder="e.g. JSS1" className={inputClass} />

            <label className={labelClass}>Parent name</label>
            <input value={parentName} onChange={(e) => setParentName(e.target.value)} className={inputClass} />

            <label className={labelClass}>Parent phone</label>
            <input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} placeholder="e.g. 08012345678" className={inputClass} />

            <label className={labelClass}>Notes (optional)</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />

            {error && <p className="mt-2 text-sm text-overdue">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="mt-3 rounded-md bg-trust px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Log application"}
            </button>
          </form>
        </div>

        <div className="mt-6 max-w-md rounded-lg border border-line bg-white p-6">
          <h2 className="text-sm font-semibold text-ink/70">Applications</h2>
          {applications.length === 0 && <p className="mt-2 text-sm text-ink/60">None logged yet.</p>}
          <ul className="mt-2 divide-y divide-line">
            {applications.map((app) => (
              <AdmissionRow key={app.id} application={app} />
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
