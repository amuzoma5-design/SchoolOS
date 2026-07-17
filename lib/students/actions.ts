"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createStudentSchema = z.object({
  name: z.string().min(1, "Student name is required"),
  classId: z.string().min(1, "Select a class"),
  parentName: z.string().min(1, "Parent name is required"),
  parentPhone: z.string().min(7, "Enter a valid phone number"),
  admissionNo: z.string().optional(),
});

export async function createStudent(input: {
  name: string;
  classId: string;
  parentName: string;
  parentPhone: string;
  admissionNo?: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { data: staffRecord } = await supabase
    .from("users")
    .select("school_id")
    .eq("auth_user_id", user.id)
    .single();
  if (!staffRecord) return { error: "No school found for this account" };

  const parsed = createStudentSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue.path.join(".") + ": " + issue.message };
  }

  const { data: existingParent } = await supabase
    .from("parents")
    .select("id")
    .eq("school_id", staffRecord.school_id)
    .eq("phone", parsed.data.parentPhone)
    .maybeSingle();

  let parentId = existingParent?.id;

  if (!parentId) {
    const { data: newParent, error: parentError } = await supabase
      .from("parents")
      .insert({
        school_id: staffRecord.school_id,
        name: parsed.data.parentName,
        phone: parsed.data.parentPhone,
      })
      .select("id")
      .single();

    if (parentError || !newParent) {
      return { error: parentError?.message ?? "Could not create parent record" };
    }
    parentId = newParent.id;
  }

  const { error: studentError } = await supabase.from("students").insert({
    school_id: staffRecord.school_id,
    parent_id: parentId,
    class_id: parsed.data.classId,
    name: parsed.data.name,
    admission_no: parsed.data.admissionNo || null,
  });

  if (studentError) return { error: studentError.message };
  return { success: true };
}

export async function getStudents() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, name, admission_no, classes(name), parents(name, phone)")
    .order("name", { ascending: true });

  if (error) return { students: [], error: error.message };
  return { students: data ?? [], error: null };
}
