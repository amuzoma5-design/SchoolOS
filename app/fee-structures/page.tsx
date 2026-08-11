import { getFeeStructures } from "@/lib/fee-structures/actions";
import { getClasses } from "@/lib/classes/actions";
import { getTerms } from "@/lib/terms/actions";
import { FeeStructureForm } from "@/components/bursar/fee-structure-form";
import { PageHeader } from "@/components/page-header";

export default async function FeeStructuresPage() {
  const { feeStructures, error } = await getFeeStructures();
  const { classes } = await getClasses();
  const { terms } = await getTerms();

  return (
    <main className="min-h-screen bg-paper">
      <PageHeader title="Fee Structures" />
      <div className="p-6">
        <div className="max-w-md rounded-lg border border-line bg-white p-6">
          <FeeStructureForm classes={classes} terms={terms} />
        </div>
        <div className="mt-6 max-w-md rounded-lg border border-line bg-white p-6">
          <h2 className="text-sm font-semibold text-ink/70">Existing fee structures</h2>
          {error && <p className="mt-2 text-sm text-overdue">{error}</p>}
          {feeStructures.length === 0 && <p className="mt-2 text-sm text-ink/60">None created yet.</p>}
          <ul className="mt-2 divide-y divide-line">
            {feeStructures.map((fs: any) => (
              <li key={fs.id} className="py-3">
                <p className="font-medium text-ink">{fs.classes?.name} - {fs.terms?.name}</p>
                <ul className="mt-1 text-sm text-ink/60">
                  {fs.fee_line_items?.map((item: any, i: number) => (
                    <li key={i}>{item.label}: NGN {Number(item.amount).toLocaleString()}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
