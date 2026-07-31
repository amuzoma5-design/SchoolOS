"use server";

import { createClient } from "@/lib/supabase/server";

export async function getStudentsForAttendance(classId: string, date: string) {
  const supabase = await createClient();

  const { data: students, error } = await supabase
    .from("students")
    .select("id, name")
    .eq("class_id", classId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error || !students) return { students: [], error: error?.message ?? "Could not load students" };

  const { data: existing } = await supabase
    .from("attendance")
    .select("student_id, status")
    .eq("class_id", classId)
    .eq("date", date);

  const statusMap = new Map((existing ?? []).map((a) => [a.student_id, a.status]));

  const result = students.map((s) => ({
    id: s.id,
    name: s.name,
    status: statusMap.get(s.id) ?? "present",
  }));

  return { students: result, error: null };
}

export async function saveAttendance(input: {
  classId: string;
  date: string;
  records: { studentId: string; status: string }[];
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

  const rows = input.records.map((r) => ({
    school_id: staffRecord.school_id,
    student_id: r.studentId,
    class_id: input.classId,
    date: input.date,
    status: r.status,
    marked_by: staffRecord.id,
  }));

  const { error } = await supabase
    .from("attendance")
    .upsert(rows, { onConflict: "student_id,date" });

  if (error) return { error: error.message };
  return { success: true };
}

export async function getTodaysAbsentCount() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("attendance")
    .select("id")
    .eq("date", today)
    .eq("status", "absent");

  if (error) return { count: 0 };
  return { count: data?.length ?? 0 };
}
