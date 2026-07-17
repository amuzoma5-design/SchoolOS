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
    <span style={{ marginLeft: "1rem" }}>
      <button onClick={handleClick} disabled={loading}>
        {loading ? "Generating..." : "Generate invoices"}
      </button>
      {message && <span style={{ marginLeft: "0.5rem" }}>{message}</span>}
    </span>
  );
}
