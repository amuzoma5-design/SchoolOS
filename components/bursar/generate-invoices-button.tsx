"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateInvoicesForFeeStructure } from "@/lib/invoices/actions";

export function GenerateInvoicesButton({ feeStructureId }: { feeStructureId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    const result = await generateInvoicesForFeeStructure(feeStructureId);
    setLoading(false);

    if (result.error) {
      setMessage("Error: " + result.error);
      return;
    }

    setMessage("Created " + result.count + " invoice(s)");
    router.refresh();
  }

  return (
    <span className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex-shrink-0 rounded-md bg-trust px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Generating..." : "Generate invoices"}
      </button>
      {message && <span className="text-sm text-ink/70">{message}</span>}
    </span>
  );
}
