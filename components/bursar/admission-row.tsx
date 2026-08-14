"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateApplicationStatus, deleteApplication } from "@/lib/admissions/actions";

const statusOptions = ["new", "contacted", "offered", "enrolled", "declined"];

const statusColors: Record<string, string> = {
  new: "bg-trust text-white",
  contacted: "bg-pending text-white",
  offered: "bg-pending text-white",
  enrolled: "bg-collected text-white",
  declined: "bg-overdue text-white",
};

export function AdmissionRow({ application }: { application: any }) {
  const [status, setStatus] = useState(application.status);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const router = useRouter();

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus);
    await updateApplicationStatus(application.id, newStatus);
    router.refresh();
  }

  async function handleDelete() {
    await deleteApplication(application.id);
    router.refresh();
  }

  return (
    <li className="py-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-ink">{application.applicant_name}</span>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${statusColors[status] ?? ""}`}
        >
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      <p className="text-sm text-ink/60">
        Parent: {application.parent_name} ({application.parent_phone})
        {application.desired_class ? ` - Wants: ${application.desired_class}` : ""}
      </p>
      {application.notes && <p className="text-sm text-ink/50">{application.notes}</p>}
      {!confirmingDelete ? (
        <button onClick={() => setConfirmingDelete(true)} className="mt-1 text-sm text-overdue">Remove</button>
      ) : (
        <span className="mt-1 block text-sm">
          Sure? <button onClick={handleDelete} className="font-medium text-overdue">Yes</button>{" "}
          <button onClick={() => setConfirmingDelete(false)} className="text-ink/50">No</button>
        </span>
      )}
    </li>
  );
}
