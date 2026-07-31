"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDailyBriefing() {
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, status, amount_due, amount_paid, due_date");

  const overdue = (invoices ?? []).filter(
    (inv) => inv.status !== "paid" && new Date(inv.due_date) < new Date()
  );
  const overdueTotal = overdue.reduce(
    (sum, inv) => sum + (Number(inv.amount_due) - Number(inv.amount_paid)),
    0
  );

  const remindersDue = (invoices ?? []).filter((inv) => inv.status !== "paid").length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { data: recentStudents } = await supabase
    .from("students")
    .select("id")
    .gte("created_at", sevenDaysAgo.toISOString());

  const today = new Date().toISOString().split("T")[0];
  const { data: absentToday } = await supabase
    .from("attendance")
    .select("id")
    .eq("date", today)
    .eq("status", "absent");

  return {
    overdueCount: overdue.length,
    overdueTotal,
    remindersDue,
    newStudentsThisWeek: recentStudents?.length ?? 0,
    absentToday: absentToday?.length ?? 0,
  };
}
