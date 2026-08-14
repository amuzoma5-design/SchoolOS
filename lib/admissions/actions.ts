"use server";

import { createClient } from "@/lib/supabase/server";

export async function createApplication(input: {
  applicantName: string;
  parentName: string;
  parentPhone: string;
  desiredClass?: string;
  notes?: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { data: staffRecord } = await supabase
    .from("users")
    .select("id, school_id")
    .eq("auth_user_id", user.id)
    .single();
  if (!staffRecord) return { error: "No school found for this account" };

  if (!input.applicantName || !input.parentName || !input.parentPhone) {
    return { error: "Applicant name, parent name, and phone are required" };
  }

  const { error } = await supabase.from("admissions").insert({
    school_id: staffRecord.school_id,
    applicant_name: input.applicantName,
    parent_name: input.parentName,
    parent_phone: input.parentPhone,
    desired_class: input.desiredClass || null,
    notes: input.notes || null,
    created_by: staffRecord.id,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { error } = await supabase
    .from("admissions")
    .update({ status })
    .eq("id", applicationId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteApplication(applicationId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { error } = await supabase.from("admissions").delete().eq("id", applicationId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function getApplications() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admissions")
    .select("id, applicant_name, parent_name, parent_phone, desired_class, status, notes, created_at")
    .order("created_at", { ascending: false });

  if (error) return { applications: [], error: error.message };
  return { applications: data ?? [], error: null };
}

export async function getNewApplicationsCount() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admissions")
    .select("id")
    .eq("status", "new");

  if (error) return { count: 0 };
  return { count: data?.length ?? 0 };
}
