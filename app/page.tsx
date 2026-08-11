import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardSummary } from "@/lib/dashboard/actions";
import { getDailyBriefing } from "@/lib/briefing/actions";
import { NavDrawer } from "@/components/nav-drawer";

function LandingPage() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="bg-trust px-6 py-16 text-center">
        <p className="text-xs font-semibold tracking-widest text-white/50">SCHOOLOS</p>
        <h1 className="mt-4 text-3xl font-bold leading-tight text-white">
          Stop chasing fees.<br />
          <span className="text-collected">Start seeing them.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-white/80">
          The daily operations app for African school owners - fees, attendance, and what needs your attention today, all in one place.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <a href="/signup" className="rounded-md bg-collected px-6 py-3 font-medium text-white">Get started</a>
          <a href="/login" className="rounded-md border border-white/30 px-6 py-3 font-medium text-white">Sign in</a>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">What it does</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-line bg-white p-4">
            <p className="font-medium text-ink">See your collection rate, live</p>
            <p className="mt-1 text-sm text-ink/60">No more waiting for end-of-term reports to know your cash position.</p>
          </div>
          <div className="rounded-lg border border-line bg-white p-4">
            <p className="font-medium text-ink">Know exactly who owes what</p>
            <p className="mt-1 text-sm text-ink/60">Every student, every balance, one screen.</p>
          </div>
          <div className="rounded-lg border border-line bg-white p-4">
            <p className="font-medium text-ink">Log cash and transfer payments instantly</p>
            <p className="mt-1 text-sm text-ink/60">No more separate notebook to reconcile at term's end.</p>
          </div>
          <div className="rounded-lg border border-line bg-white p-4">
            <p className="font-medium text-ink">Remind parents on WhatsApp, one tap</p>
            <p className="mt-1 text-sm text-ink/60">Pre-filled with the exact student and balance.</p>
          </div>
        </div>

        <div className="mt-8 rounded-lg border-l-4 border-trust bg-white p-4">
          <p className="text-sm font-semibold text-trust">About cost</p>
          <p className="mt-1 text-sm text-ink/70">
            SchoolOS is a paid platform. It's free for your school during the pilot period so you can try it
            properly with no risk - you'll know the price clearly before that period ends, and there's no
            obligation to continue if it's not right for you.
          </p>
        </div>

        <div className="mt-10 text-center">
          <a href="/signup" className="inline-block rounded-md bg-trust px-6 py-3 font-medium text-white">Set up your school</a>
        </div>
      </div>

      <div className="border-t border-line py-6 text-center text-xs text-ink/40">Built by Venew Coop</div>
    </main>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <LandingPage />;
  }

  const { data: staffRecord } = await supabase
    .from("users")
    .select("role, name")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!staffRecord) {
    redirect("/complete-setup");
  }

  const { data: school } = await supabase.from("schools").select("name").single();
  const { collectionRate, totalDue, totalPaid, outstanding } = await getDashboardSummary();
  const briefing = await getDailyBriefing();

  const firstName = staffRecord?.name?.split(" ")[0] ?? "there";
  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", month: "long", day: "numeric" });

  const statusColor: Record<string, string> = {
    unpaid: "text-overdue",
    partial: "text-pending",
  };

  return (
    <main className="min-h-screen bg-paper">
      <div className="flex items-start justify-between border-b border-line bg-white px-6 py-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-ink/40">SCHOOLOS</p>
          <h1 className="mt-1 text-2xl font-bold text-ink">{school?.name ?? "Your school"}</h1>
          <p className="mt-1 text-sm text-ink/60">Welcome, {firstName} - {today}</p>
        </div>
        <NavDrawer />
      </div>

      <div className="p-6">
        <div className="rounded-lg border border-line bg-white p-6">
          <h2 className="text-sm font-semibold text-ink/70">Needs your attention today</h2>
          <ul className="mt-3 space-y-3">
            {briefing.absentToday > 0 && (
              <li className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-overdue"></span>
                <span className="text-ink"><b>{briefing.absentToday}</b> student{briefing.absentToday === 1 ? "" : "s"} absent today</span>
              </li>
            )}
            {briefing.overdueCount > 0 && (
              <li className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-overdue"></span>
                <span className="text-ink"><b>{briefing.overdueCount}</b> invoice{briefing.overdueCount === 1 ? "" : "s"} overdue - <b>NGN {briefing.overdueTotal.toLocaleString()}</b> outstanding</span>
              </li>
            )}
            {briefing.remindersDue > 0 && (
              <li className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-pending"></span>
                <span className="text-ink"><b>{briefing.remindersDue}</b> unpaid invoice{briefing.remindersDue === 1 ? "" : "s"} could use a reminder - <a href="/reminders" className="text-trust">send now &rarr;</a></span>
              </li>
            )}
            {briefing.newStudentsThisWeek > 0 && (
              <li className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-collected"></span>
                <span className="text-ink"><b>{briefing.newStudentsThisWeek}</b> new student{briefing.newStudentsThisWeek === 1 ? "" : "s"} added this week</span>
              </li>
            )}
            {briefing.overdueCount === 0 && briefing.remindersDue === 0 && briefing.newStudentsThisWeek === 0 && briefing.absentToday === 0 && (
              <li className="text-sm text-ink/60">Nothing urgent right now.</li>
            )}
          </ul>
        </div>

        <div className="mt-6 rounded-lg border border-line bg-white p-6">
          <p className="text-sm text-ink/60">Collection rate this term</p>
          <p className="mt-1 text-5xl font-bold text-collected">{collectionRate}%</p>
          <p className="mt-2 text-sm text-ink/60">NGN {totalPaid.toLocaleString()} collected of NGN {totalDue.toLocaleString()} expected</p>
        </div>

        <div className="mt-6 rounded-lg border border-line bg-white p-6">
          <h2 className="text-sm font-semibold text-ink/70">Outstanding balances</h2>
          {outstanding.length === 0 && <p className="mt-2 text-sm text-ink/60">Nothing outstanding right now.</p>}
          <ul className="mt-2 divide-y divide-line">
            {outstanding.map((inv, i) => (
              <li key={i} className="flex items-center justify-between py-2">
                <span className="text-ink">{inv.studentName}</span>
                <span className={`text-sm font-medium ${statusColor[inv.status] ?? "text-ink"}`}>NGN {inv.balance.toLocaleString()}</span>
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
