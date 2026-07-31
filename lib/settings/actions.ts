"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function deleteMySchool(confirmationText: string, expectedSchoolName: string) {
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
    return { error: "Only the owner can delete the school" };
  }

  if (confirmationText.trim() !== expectedSchoolName.trim()) {
    return { error: "The typed name doesn't match. Please type the school name exactly." };
  }

  const adminClient = createServiceRoleClient();

  const { data: allStaff } = await adminClient
    .from("users")
    .select("auth_user_id")
    .eq("school_id", staffRecord.school_id);

  const { error: schoolError } = await adminClient
    .from("schools")
    .delete()
    .eq("id", staffRecord.school_id);

  if (schoolError) return { error: schoolError.message };

  for (const staff of allStaff ?? []) {
    await adminClient.auth.admin.deleteUser(staff.auth_user_id);
  }

  return { success: true };
}
