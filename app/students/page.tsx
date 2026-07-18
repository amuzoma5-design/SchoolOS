import { getStudents } from "@/lib/students/actions";
import { getClasses } from "@/lib/classes/actions";
import { StudentForm } from "@/components/bursar/student-form";
import { EditStudentForm } from "@/components/bursar/edit-student-form";

export default async function StudentsPage() {
  const { students, error } = await getStudents();
  const { classes } = await getClasses();

  return (
    <main className="min-h-screen bg-paper p-6">
      <a href="/" className="text-sm text-trust">&larr; Back to dashboard</a>
      <h1 className="mt-2 text-xl font-semibold text-ink">Students</h1>

      <div className="mt-4 max-w-md rounded-lg border border-line bg-white p-6">
        <StudentForm classes={classes} />
      </div>

      <div className="mt-6 max-w-md rounded-lg border border-line bg-white p-6">
        <h2 className="text-sm font-semibold text-ink/70">Existing students</h2>
        {error && <p className="mt-2 text-sm text-overdue">{error}</p>}
        {students.length === 0 && (
          <p className="mt-2 text-sm text-ink/60">None added yet.</p>
        )}
        <ul className="mt-2 divide-y divide-line">
          {students.map((s: any) => (
            <li key={s.id} className="py-2 text-ink">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{s.name}</span>
                  <span className="text-ink/50 text-sm"> - {s.classes?.name}</span>
                  <br />
                  <span className="text-ink/50 text-sm">Parent: {s.parents?.name} ({s.parents?.phone})</span>
                </div>
                <EditStudentForm student={s} classes={classes} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
