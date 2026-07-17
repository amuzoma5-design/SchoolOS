import { createClient } from "@/lib/supabase/server";

export default async function PayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = createClient() as any;
  const client = await supabase;

  const { data: invoice } = await client
    .from("invoices")
    .select("id, amount_due, amount_paid, status, due_date")
    .eq("payment_token", token)
    .maybeSingle();

  if (!invoice) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper p-6">
        <p className="text-center text-sm text-ink/70">
          This payment link is invalid or has expired. Contact your school for a new one.
        </p>
      </main>
    );
  }

  if (invoice.status === "paid") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper p-6">
        <p className="text-center text-collected">This invoice is already fully paid.</p>
      </main>
    );
  }

  const balance = invoice.amount_due - invoice.amount_paid;

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper p-6">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-6 text-center">
        <p className="text-sm text-ink/60">Amount due</p>
        <p className="mt-1 text-3xl font-bold text-ink">NGN {balance.toLocaleString()}</p>
        <p className="mt-1 text-xs text-ink/50">Due {invoice.due_date}</p>
        <button className="mt-6 w-full rounded-md bg-trust px-4 py-3 font-medium text-white">
          Pay now
        </button>
      </div>
    </main>
  );
}
