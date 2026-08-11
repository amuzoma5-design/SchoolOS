import { getClasses } from "@/lib/classes/actions";
import { ClassForm } from "@/components/bursar/class-form";
import { ClassRow } from "@/components/bursar/class-row";
import { PageHeader } from "@/components/page-header";

export default async function ClassesPage() {
  const { classes, error } = await getClasses();

  return (
    <main className="min-h-screen bg-paper">
      <PageHeader title="Classes" />
      <div className="p-6">
        <div className="max-w-md rounded-lg border border-line bg-white p-6">
          <ClassForm />
        </div>
        <div className="mt-6 max-w-md rounded-lg border border-line bg-white p-6">
          <h2 className="text-sm font-semibold text-ink/70">Existing classes</h2>
          {error && <p className="mt-2 text-sm text-overdue">{error}</p>}
          {classes.length === 0 && <p className="mt-2 text-sm text-ink/60">No classes created yet.</p>}
          <ul className="mt-2 divide-y divide-line">
            {classes.map((c) => (
              <ClassRow key={c.id} cls={c} />
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
