import { getTerms } from "@/lib/terms/actions";
import { TermForm } from "@/components/bursar/term-form";

export default async function TermsPage() {
  const { terms, error } = await getTerms();

  return (
    <main className="min-h-screen bg-paper p-6">
      <a href="/" className="text-sm text-trust">&larr; Back to dashboard</a>
      <h1 className="mt-2 text-xl font-semibold text-ink">Terms</h1>

      <div className="mt-4 max-w-md rounded-lg border border-line bg-white p-6">
        <TermForm />
      </div>

      <div className="mt-6 max-w-md rounded-lg border border-line bg-white p-6">
        <h2 className="text-sm font-semibold text-ink/70">Existing terms</h2>
        {error && <p className="mt-2 text-sm text-overdue">{error}</p>}
        {terms.length === 0 && (
          <p className="mt-2 text-sm text-ink/60">No terms created yet.</p>
        )}
        <ul className="mt-2 divide-y divide-line">
          {terms.map((t) => (
            <li key={t.id} className="py-2 text-ink">
              {t.name} <span className="text-ink/50 text-sm">({t.start_date} to {t.end_date})</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
