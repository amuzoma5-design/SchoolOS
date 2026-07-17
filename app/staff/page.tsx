import { getStaff } from "@/lib/staff/actions";
import { StaffForm } from "@/components/owner/staff-form";

export default async function StaffPage() {
  const { staff, error } = await getStaff();

  return (
    <main className="min-h-screen bg-paper p-6">
      <a href="/" className="text-sm text-trust">&larr; Back to dashboard</a>
      <h1 className="mt-2 text-xl font-semibold text-ink">Staff</h1>

      <div className="mt-4 max-w-md rounded-lg border border-line bg-white p-6">
        <StaffForm />
      </div>

      <div className="mt-6 max-w-md rounded-lg border border-line bg-white p-6">
        <h2 className="text-sm font-semibold text-ink/70">Current staff</h2>
        {error && <p className="mt-2 text-sm text-overdue">{error}</p>}
        <ul className="mt-2 divide-y divide-line">
          {staff.map((s: any) => (
            <li key={s.id} className="flex items-center justify-between py-2">
              <span className="text-ink">{s.name}</span>
              <span className="text-sm capitalize text-ink/50">{s.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
