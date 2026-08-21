import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DeleteSchoolForm } from "@/components/owner/delete-school-form";
import { PageHeader } from "@/components/page-header";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: staffRecord } = await supabase
    .from("users")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  const { data: school } = await supabase.from("schools").select("name, referral_code").single();

  return (
    <main className="min-h-screen bg-paper">
      <PageHeader title="Settings" />
      <div className="p-6">
        <div className="max-w-md rounded-lg border border-line bg-white p-6">
          <p className="text-sm text-ink/60">School</p>
          <p className="text-lg font-medium text-ink">{school?.name}</p>
        </div>

        <div className="mt-6 max-w-md rounded-lg border border-line bg-white p-6">
          <h2 className="text-sm font-semibold text-ink/70">Refer another school</h2>
          <p className="mt-1 text-sm text-ink/60">Both schools get a free bonus month when they sign up with your link.</p>
          <p className="mt-3 break-all rounded-md bg-paper p-2 text-sm text-trust">
            https://school-os-ashy.vercel.app/signup?ref={school?.referral_code}ref={school?.referral_code}
          </p>
        </div>

        {staffRecord?.role === "owner" && (
          <div className="mt-6 max-w-md rounded-lg border border-line bg-white p-6">
            <h2 className="text-sm font-semibold text-ink/70">Danger zone</h2>
            <div className="mt-3">
              <DeleteSchoolForm schoolName={school?.name ?? ""} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
