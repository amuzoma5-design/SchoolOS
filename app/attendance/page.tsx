import { getClasses } from "@/lib/classes/actions";
import { AttendanceForm } from "@/components/bursar/attendance-form";

export default async function AttendancePage() {
  const { classes } = await getClasses();

  return (
    <main className="min-h-screen bg-paper p-6">
      <a href="/" className="text-sm text-trust">&larr; Back to dashboard</a>
      <h1 className="mt-2 text-xl font-semibold text-ink">Attendance</h1>

      <div className="mt-4 max-w-md rounded-lg border border-line bg-white p-6">
        {classes.length === 0 ? (
          <p className="text-sm text-ink/60">Create a class first.</p>
        ) : (
          <AttendanceForm classes={classes} />
        )}
      </div>
    </main>
  );
}
