import { getClasses } from "@/lib/classes/actions";
import { ClassForm } from "@/components/bursar/class-form";

export default async function ClassesPage() {
  const { classes, error } = await getClasses();

  return (
    <main className="min-h-screen bg-paper p-6">
      <a href="/" className="text-sm text-trust">&larr; Back to dashboard</a>
      <h1 className="mt-2 text-xl font-semibold text-ink">Classes</h1>

      <div className="mt-4 max-w-md rounded-lg border border-line bg-white p-6">
        <ClassForm />
      </div>

      <div className="mt-6 max-w-md rounded-lg border border-line bg-white p-6">
        <h2 className="text-sm font-semibold text-ink/70">Existing classes</h2>
        {error && <p className="mt-2 text-sm text-overdue">{error}</p>}
        {classes.length === 0 && (
          <p className="mt-2 text-sm text-ink/60">No classes created yet.</p>
        )}
        <ul className="mt-2 divide-y divide-line">
          {classes.map((c) => (
            <li key={c.id} className="py-2 text-ink">{c.name}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
