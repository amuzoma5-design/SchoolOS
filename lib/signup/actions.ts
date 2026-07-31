"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { z } from "zod";

const signUpSchema = z.object({
  schoolName: z.string().min(1, "School name is required"),
  ownerName: z.string().min(1, "Your name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function signUpSchool(input: {
  schoolName: string;
  ownerName: string;
  email: string;
  password: string;
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

  const { data: school, error: schoolError } = await adminClient
    .from("schools")
    .insert({
      name: parsed.data.schoolName,
      currency: "NGN",
      data_region: "unspecified",
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

  return { success: true };
}

export async function completeGoogleSignup(schoolName: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not signed in" };

  if (!schoolName || schoolName.trim().length === 0) {
    return { error: "School name is required" };
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
    .insert({ name: schoolName, currency: "NGN", data_region: "unspecified" })
    .select("id")
    .single();

  if (schoolError || !school) {
    return { error: schoolError?.message ?? "Could not create school" };
  }

  const ownerName =
    (user.user_metadata as any)?.full_name ||
    (user.user_metadata as any)?.name ||
    user.email?.split("@")[0] ||
    "Owner";

  const { error: userError } = await adminClient.from("users").insert({
    school_id: school.id,
    auth_user_id: user.id,
    role: "owner",
    name: ownerName,
  });

  if (userError) return { error: userError.message };

  return { success: true };
}