import { getInvoices } from "@/lib/invoices/actions";
import { getFeeStructures } from "@/lib/fee-structures/actions";
import { GenerateInvoicesButton } from "@/components/bursar/generate-invoices-button";
import { LogPaymentForm } from "@/components/bursar/log-payment-form";

export default async function InvoicesPage() {
  const { invoices, error } = await getInvoices();
  const { feeStructures } = await getFeeStructures();

  const statusColor: Record<string, string> = {
    unpaid: "text-overdue",
    partial: "text-pending",
    paid: "text-collected",
  };

  return (
    <main className="min-h-screen bg-paper p-6">
      <a href="/" className="text-sm text-trust">&larr; Back to dashboard</a>
      <h1 className="mt-2 text-xl font-semibold text-ink">Invoices</h1>

      <div className="mt-4 max-w-lg rounded-lg border border-line bg-white p-6">
        <h2 className="text-sm font-semibold text-ink/70">Fee structures</h2>
        <ul className="mt-2 divide-y divide-line">
          {feeStructures.map((fs: any) => (
            <li key={fs.id} className="flex items-center justify-between py-2">
              <span className="text-ink">{fs.classes?.name} - {fs.terms?.name}</span>
              <GenerateInvoicesButton feeStructureId={fs.id} />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 max-w-lg rounded-lg border border-line bg-white p-6">
        <h2 className="text-sm font-semibold text-ink/70">Existing invoices</h2>
        {error && <p className="mt-2 text-sm text-overdue">{error}</p>}
        {invoices.length === 0 && <p className="mt-2 text-sm text-ink/60">None yet.</p>}
        <ul className="mt-2 divide-y divide-line">
          {invoices.map((inv: any) => (
            <li key={inv.id} className="py-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-ink">{inv.students?.name}</span>
                <span className={`text-sm font-medium capitalize ${statusColor[inv.status] ?? "text-ink"}`}>
                  {inv.status}
                </span>
              </div>
              <p className="text-sm text-ink/60">
                Due: NGN {Number(inv.amount_due).toLocaleString()}, Paid: NGN {Number(inv.amount_paid).toLocaleString()}
              </p>
              <a href={`/pay/${inv.payment_token}`} target="_blank" className="text-sm text-trust">
                Payment link &rarr;
              </a>

              {inv.payments && inv.payments.length > 0 && (
                <ul className="mt-1 ml-2 border-l-2 border-line pl-2">
                  {inv.payments.map((p: any) => (
                    <li key={p.id} className="text-sm text-ink/60">
                      NGN {Number(p.amount).toLocaleString()} ({p.source}) -{" "}
                      
                       <a href={`/api/receipts/${p.id}`}
                        target="_blank"
                        className="text-trust"
                      >
                        Download receipt
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              {inv.status !== "paid" && (
                <div className="mt-1">
                  <LogPaymentForm invoiceId={inv.id} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
