"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";

const signUpSchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
  ownerName: z.string().min(1, "Your name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  referralCode: z.string().optional(),
});

export async function signUpSchool(input: {
  schoolName: string;
  ownerName: string;
  email: string;
  password: string;
  referralCode?: string;
}) {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue.path.join(".") + ": " + issue.message };
  }

  const adminClient = createServiceRoleClient();

  const { data: newAuthUser, error: authError } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (authError || !newAuthUser?.user) {
    return { error: authError?.message ?? "Could not create account" };
  }

  let referredBySchoolId: string | null = null;
  if (parsed.data.referralCode) {
    const { data: referrer } = await adminClient
      .from("schools")
      .select("id")
      .eq("referral_code", parsed.data.referralCode.trim())
      .maybeSingle();
    if (referrer) referredBySchoolId = referrer.id;
  }

  const { data: school, error: schoolError } = await adminClient
    .from("schools")
    .insert({
      name: parsed.data.schoolName,
      currency: "NGN",
      data_region: "unspecified",
      referred_by: referredBySchoolId,
    })
    .select("id")
    .single();

  if (schoolError || !school) {
    return { error: schoolError?.message ?? "Could not create school" };
  }

  const { error: userError } = await adminClient.from("users").insert({
    school_id: school.id,
    auth_user_id: newAuthUser.user.id,
    role: "owner",
    name: parsed.data.ownerName,
  });

  if (userError) return { error: userError.message };

  if (referredBySchoolId) {
    const { data: referrerSchool } = await adminClient
      .from("schools")
      .select("trial_ends_at")
      .eq("id", referredBySchoolId)
      .single();

    if (referrerSchool) {
      const extended = new Date(referrerSchool.trial_ends_at);
      extended.setDate(extended.getDate() + 30);
      await adminClient.from("schools").update({ trial_ends_at: extended.toISOString() }).eq("id", referredBySchoolId);
    }

    const newExtended = new Date();
    newExtended.setDate(newExtended.getDate() + 30);
    const { data: currentTrial } = await adminClient.from("schools").select("trial_ends_at").eq("id", school.id).single();
    if (currentTrial) {
      const base = new Date(currentTrial.trial_ends_at);
      const bonus = new Date(Math.max(base.getTime(), newExtended.getTime()));
      await adminClient.from("schools").update({ trial_ends_at: bonus.toISOString() }).eq("id", school.id);
    }
  }

  return { success: true };
}

export async function completeGoogleSignup(input: { schoolName: string; ownerName: string }) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not signed in" };

  if (!input.schoolName || input.schoolName.trim().length === 0) {
    return { error: "School name is required" };
  }
  if (!input.ownerName || input.ownerName.trim().length === 0) {
    return { error: "Your name is required" };
  }

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (existing) {
    return { error: "This account is already set up" };
  }

  const adminClient = createServiceRoleClient();

  const { data: school, error: schoolError } = await adminClient
    .from("schools")
    .insert({ name: input.schoolName, currency: "NGN", data_region: "unspecified" })
    .select("id")
    .single();

  if (schoolError || !school) {
    return { error: schoolError?.message ?? "Could not create school" };
  }

  const { error: userError } = await adminClient.from("users").insert({
    school_id: school.id,
    auth_user_id: user.id,
    role: "owner",
    name: input.ownerName,
  });

  if (userError) return { error: userError.message };

  return { success: true };
}
