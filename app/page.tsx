import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDashboardSummary } from "@/lib/dashboard/actions";
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

  const firstName = staffRecord?.name?.split(" ")[0] ?? "there";

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
          <p className="mt-1 text-sm text-ink/60">Welcome, {firstName}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="p-6">
        <nav className="mb-6 flex gap-3 text-sm">
          <a href="/classes" className="rounded-md bg-white px-3 py-2 border border-line text-ink hover:border-trust">Classes</a>
          <a href="/terms" className="rounded-md bg-white px-3 py-2 border border-line text-ink hover:border-trust">Terms</a>
          <a href="/students" className="rounded-md bg-white px-3 py-2 border border-line text-ink hover:border-trust">Students</a>
          <a href="/fee-structures" className="rounded-md bg-white px-3 py-2 border border-line text-ink hover:border-trust">Fees</a>
          <a href="/invoices" className="rounded-md bg-white px-3 py-2 border border-line text-ink hover:border-trust">Invoices</a>
          <a href="/staff" className="rounded-md bg-white px-3 py-2 border border-line text-ink hover:border-trust">Staff</a>
          <a href="/reminders" className="rounded-md bg-white px-3 py-2 border border-line text-ink hover:border-trust">Reminders</a>
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
