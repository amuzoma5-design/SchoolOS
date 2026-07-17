import { getRemindersDue } from "@/lib/reminders/actions";

export default async function RemindersPage() {
  const { reminders, error } = await getRemindersDue();

  const statusColor: Record<string, string> = {
    unpaid: "text-overdue",
    partial: "text-pending",
  };

  return (
    <main className="min-h-screen bg-paper p-6">
      <a href="/" className="text-sm text-trust">&larr; Back to dashboard</a>
      <h1 className="mt-2 text-xl font-semibold text-ink">Reminders due</h1>
      <p className="mt-1 text-sm text-ink/60">
        Click "Send via WhatsApp" to open a pre-filled message for that parent.
      </p>

      <div className="mt-4 max-w-lg rounded-lg border border-line bg-white p-6">
        {error && <p className="text-sm text-overdue">{error}</p>}
        {reminders.length === 0 && (
          <p className="text-sm text-ink/60">No outstanding balances right now.</p>
        )}
        <ul className="divide-y divide-line">
          {reminders.map((r: any) => (
            <li key={r.invoiceId} className="py-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">{r.studentName}</span>
                <span className={`text-sm font-medium capitalize ${statusColor[r.status] ?? "text-ink"}`}>
                  NGN {r.balance.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-ink/60">
                Parent: {r.parentName} ({r.parentPhone}) - Due {r.dueDate}
              </p>
              <a
                href={r.whatsappLink}
                target="_blank"
                className="mt-1 inline-block rounded-md bg-collected px-3 py-1 text-sm font-medium text-white"
              >
                Send via WhatsApp
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
