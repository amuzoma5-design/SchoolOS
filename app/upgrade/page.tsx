import { PageHeader } from "@/components/page-header";
import { getTrialStatus } from "@/lib/billing/actions";

export default async function UpgradePage() {
  const trial = await getTrialStatus();

  return (
    <main className="min-h-screen bg-paper">
      <PageHeader title="Upgrade" />
      <div className="p-6">
        {trial?.status === "active" ? (
          <div className="max-w-md rounded-lg border border-line bg-white p-6">
            <p className="text-sm font-semibold text-collected">You're on a paid plan</p>
            <p className="mt-1 text-sm text-ink/60">Thank you for supporting SchoolOS.</p>
          </div>
        ) : (
          <>
            <div className="max-w-2xl rounded-lg border border-line bg-white p-6">
              <p className="text-sm font-semibold text-ink">
                {trial?.isExpired ? "Your free trial has ended" : `${trial?.daysLeft ?? 0} day(s) left in your free trial`}
              </p>
              <p className="mt-2 text-sm text-ink/60">
                {trial?.isExpired
                  ? "New records (students, invoices, payments) are paused until you upgrade. Your existing data is safe and fully visible."
                  : "When your trial ends, you can continue on a paid plan - no automatic charge, no surprise."}
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-line bg-white p-5">
                <p className="text-sm font-semibold text-trust">Starter</p>
                <p className="mt-1 text-xs text-ink/50">Up to 100 students</p>
                <p className="mt-3 text-2xl font-bold text-ink">NGN 15,000<span className="text-sm font-normal text-ink/50">/term</span></p>
              </div>
              <div className="rounded-lg border border-line bg-white p-5">
                <p className="text-sm font-semibold text-trust">Growth</p>
                <p className="mt-1 text-xs text-ink/50">101-300 students</p>
                <p className="mt-3 text-2xl font-bold text-ink">NGN 35,000<span className="text-sm font-normal text-ink/50">/term</span></p>
              </div>
              <div className="rounded-lg border border-line bg-white p-5">
                <p className="text-sm font-semibold text-trust">Established</p>
                <p className="mt-1 text-xs text-ink/50">300+ students</p>
                <p className="mt-3 text-2xl font-bold text-ink">NGN 60,000<span className="text-sm font-normal text-ink/50">/term</span></p>
              </div>
            </div>

            <div className="mt-6 max-w-2xl rounded-md bg-white border border-line p-4">
              <p className="text-sm text-ink/70">To upgrade, reach out directly and we'll get you set up:</p>
              <div className="mt-3 flex gap-2">
                <a href="https://wa.me/2349044209650" target="_blank" className="rounded-md bg-collected px-4 py-2 text-sm font-medium text-white">WhatsApp us</a>
                <a href="mailto:venew100@gmail.com" className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink">Email us</a>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
