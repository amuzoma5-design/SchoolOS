"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFeeStructure } from "@/lib/fee-structures/actions";

type LineItem = { label: string; amount: string };

export function FeeStructureForm({
  classes,
  terms,
}: {
  classes: { id: string; name: string }[];
  terms: { id: string; name: string }[];
}) {
  const [classId, setClassId] = useState("");
  const [termId, setTermId] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([{ label: "", amount: "" }]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function updateLineItem(index: number, field: keyof LineItem, value: string) {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  }

  function addLineItem() {
    setLineItems([...lineItems, { label: "", amount: "" }]);
  }

  function removeLineItem(index: number) {
    setLineItems(lineItems.filter((_, i) => i !== index));
  }

  const total = lineItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await createFeeStructure({
      classId,
      termId,
      lineItems: lineItems.map((item) => ({
        label: item.label,
        amount: parseFloat(item.amount) || 0,
      })),
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setClassId("");
    setTermId("");
    setLineItems([{ label: "", amount: "" }]);
    router.refresh();
  }

  const inputClass = "rounded-md border border-line px-3 py-2 text-ink";
  const labelClass = "block text-sm text-ink/70";

  return (
    <form onSubmit={handleSubmit}>
      <label className={labelClass}>Class</label>
      <select value={classId} onChange={(e) => setClassId(e.target.value)} className={`mt-1 block w-full ${inputClass}`}>
        <option value="">Select a class</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <label className={`mt-3 ${labelClass}`}>Term</label>
      <select value={termId} onChange={(e) => setTermId(e.target.value)} className={`mt-1 block w-full ${inputClass}`}>
        <option value="">Select a term</option>
        {terms.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <label className={`mt-4 ${labelClass}`}>Fee line items</label>
      {lineItems.map((item, index) => (
        <div key={index} className="mt-2 flex gap-2">
          <input
            type="text"
            placeholder="e.g. Tuition"
            value={item.label}
            onChange={(e) => updateLineItem(index, "label", e.target.value)}
            className={`flex-[2] ${inputClass}`}
          />
          <input
            type="number"
            placeholder="Amount"
            value={item.amount}
            onChange={(e) => updateLineItem(index, "amount", e.target.value)}
            className={`flex-1 ${inputClass}`}
          />
          {lineItems.length > 1 && (
            <button type="button" onClick={() => removeLineItem(index)} className="text-sm text-overdue">
              Remove
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={addLineItem} className="mt-2 text-sm text-trust">
        + Add line item
      </button>

      <p className="mt-3 text-sm text-ink/70">Total: NGN {total.toLocaleString()}</p>

      {error && <p className="mt-2 text-sm text-overdue">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="mt-3 rounded-md bg-trust px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? "Saving..." : "Create fee structure"}
      </button>
    </form>
  );
}
