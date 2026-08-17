"use server";

import { createClient } from "@/lib/supabase/server";

export async function getTrialStatus() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: staffRecord } = await supabase
    .from("users")
    .select("school_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!staffRecord) return null;

  const { data: school } = await supabase
    .from("schools")
    .select("subscription_status, trial_ends_at")
    .eq("id", staffRecord.school_id)
    .single();

  if (!school) return null;

  const trialEndsAt = new Date(school.trial_ends_at);
  const now = new Date();
  const daysLeft = Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    status: school.subscription_status as string,
    daysLeft,
    isExpired: school.subscription_status === "trialing" && daysLeft <= 0,
    isEndingSoon: school.subscription_status === "trialing" && daysLeft > 0 && daysLeft <= 14,
  };
}
