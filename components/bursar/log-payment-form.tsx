"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logManualPayment } from "@/lib/invoices/actions";

export function LogPaymentForm({ invoiceId }: { invoiceId: string }) {
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const result = await logManualPayment({
      invoiceId,
      amount: parseFloat(amount) || 0,
    });

    setSaving(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setAmount("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-sm text-trust">
        Log payment
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex items-center gap-2">
      <input
        type="number"
        placeholder="Amount received"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-32 rounded-md border border-line px-2 py-1 text-sm text-ink"
      />
      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-collected px-3 py-1 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? "Saving..." : "Confirm"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink/50">
        Cancel
      </button>
      {error && <p className="text-sm text-overdue">{error}</p>}
    </form>
  );
}
