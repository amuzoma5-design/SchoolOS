"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function createBursar(input: { email: string; password: string; name: string }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { data: staffRecord } = await supabase
    .from("users")
    .select("school_id, role")
    .eq("auth_user_id", user.id)
    .single();

  if (!staffRecord) return { error: "No school found for this account" };
  if (staffRecord.role !== "owner") {
    return { error: "Only the owner can add staff accounts" };
  }

  if (!input.email || !input.password || !input.name) {
    return { error: "All fields are required" };
  }
  if (input.password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  const adminClient = createServiceRoleClient();

  const { data: newAuthUser, error: authError } = await adminClient.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
  });

  if (authError || !newAuthUser?.user) {
    return { error: authError?.message ?? "Could not create login" };
  }

  const { error: insertError } = await adminClient.from("users").insert({
    school_id: staffRecord.school_id,
    auth_user_id: newAuthUser.user.id,
    role: "bursar",
    name: input.name,
  });

  if (insertError) return { error: insertError.message };

  return { success: true };
}

export async function getStaff() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, name, role")
    .order("role", { ascending: true });

  if (error) return { staff: [], error: error.message };
  return { staff: data ?? [], error: null };
}
