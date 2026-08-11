import { getClasses } from "@/lib/classes/actions";
import { AttendanceForm } from "@/components/bursar/attendance-form";
import { PageHeader } from "@/components/page-header";

export default async function AttendancePage() {
  const { classes } = await getClasses();

  return (
    <main className="min-h-screen bg-paper">
      <PageHeader title="Attendance" />
      <div className="p-6">
        <div className="max-w-md rounded-lg border border-line bg-white p-6">
          {classes.length === 0 ? (
            <p className="text-sm text-ink/60">Create a class first.</p>
          ) : (
            <AttendanceForm classes={classes} />
          )}
        </div>
      </div>
    </main>
  );
}
