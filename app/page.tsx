import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardSummary } from "@/lib/dashboard/actions";
import { getDailyBriefing } from "@/lib/briefing/actions";
import { SignOutButton } from "@/components/sign-out-button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: staffRecord } = await supabase
    .from("users")
    .select("role, name")
    .eq("auth_user_id", user.id)
    .single();

  const { data: school } = await supabase.from("schools").select("name").single();
  const { collectionRate, totalDue, totalPaid, outstanding } = await getDashboardSummary();
  const briefing = await getDailyBriefing();

  const firstName = staffRecord?.name?.split(" ")[0] ?? "there";
  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", month: "long", day: "numeric" });

  const statusColor: Record<string, string> = {
    unpaid: "text-overdue",
    partial: "text-pending",
  };

  const navLinkClass =
    "flex-shrink-0 rounded-md bg-white px-3 py-2 border border-line text-ink hover:border-trust";

  return (
    <main className="min-h-screen bg-paper">
      <div className="flex items-start justify-between border-b border-line bg-white px-6 py-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-ink/40">SCHOOLOS</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{school?.name ?? "Your school"}</h1>
          <p className="mt-1 text-sm text-ink/60">Welcome, {firstName} - {today}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="p-6">
        <div className="rounded-lg border border-line bg-white p-6">
          <h2 className="text-sm font-semibold text-ink/70">Needs your attention today</h2>
          <ul className="mt-3 space-y-3">
            {briefing.absentToday > 0 && (
              <li className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-overdue"></span>
                <span className="text-ink">
                  <b>{briefing.absentToday}</b> student{briefing.absentToday === 1 ? "" : "s"} absent today
                </span>
              </li>
            )}
            {briefing.overdueCount > 0 && (
              <li className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-overdue"></span>
                <span className="text-ink">
                  <b>{briefing.overdueCount}</b> invoice{briefing.overdueCount === 1 ? "" : "s"} overdue -{" "}
                  <b>NGN {briefing.overdueTotal.toLocaleString()}</b> outstanding
                </span>
              </li>
            )}
            {briefing.remindersDue > 0 && (
              <li className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-pending"></span>
                <span className="text-ink">
                  <b>{briefing.remindersDue}</b> unpaid invoice{briefing.remindersDue === 1 ? "" : "s"} could use a reminder -{" "}
                  <a href="/reminders" className="text-trust">send now &rarr;</a>
                </span>
              </li>
            )}
            {briefing.newStudentsThisWeek > 0 && (
              <li className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-collected"></span>
                <span className="text-ink">
                  <b>{briefing.newStudentsThisWeek}</b> new student{briefing.newStudentsThisWeek === 1 ? "" : "s"} added this week
                </span>
              </li>
            )}
            {briefing.overdueCount === 0 && briefing.remindersDue === 0 && briefing.newStudentsThisWeek === 0 && briefing.absentToday === 0 && (
              <li className="text-sm text-ink/60">Nothing urgent right now.</li>
            )}
          </ul>
        </div>

        <nav className="mt-6 mb-6 flex gap-3 overflow-x-auto whitespace-nowrap text-sm pb-2">
          <a href="/classes" className={navLinkClass}>Classes</a>
          <a href="/terms" className={navLinkClass}>Terms</a>
          <a href="/students" className={navLinkClass}>Students</a>
          <a href="/fee-structures" className={navLinkClass}>Fees</a>
          <a href="/invoices" className={navLinkClass}>Invoices</a>
          <a href="/staff" className={navLinkClass}>Staff</a>
          <a href="/reminders" className={navLinkClass}>Reminders</a>
          <a href="/attendance" className={navLinkClass}>Attendance</a>
        </nav>

        <div className="rounded-lg border border-line bg-white p-6">
          <p className="text-sm text-ink/60">Collection rate this term</p>
          <p className="mt-1 text-5xl font-bold text-collected">{collectionRate}%</p>
          <p className="mt-2 text-sm text-ink/60">
            NGN {totalPaid.toLocaleString()} collected of NGN {totalDue.toLocaleString()} expected
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-line bg-white p-6">
          <h2 className="text-sm font-semibold text-ink/70">Outstanding balances</h2>
          {outstanding.length === 0 && (
            <p className="mt-2 text-sm text-ink/60">Nothing outstanding right now.</p>
          )}
          <ul className="mt-2 divide-y divide-line">
            {outstanding.map((inv, i) => (
              <li key={i} className="flex items-center justify-between py-2">
                <span className="text-ink">{inv.studentName}</span>
                <span className={`text-sm font-medium ${statusColor[inv.status] ?? "text-ink"}`}>
                  NGN {inv.balance.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-lg border border-line bg-white p-6">
          <p className="text-sm text-ink/60">Your role</p>
          <p className="text-xl font-semibold text-trust capitalize">{staffRecord?.role ?? "unknown"}</p>
        </div>
      </div>
    </main>
  );
}
