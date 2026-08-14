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

  const { data: allStudents } = await supabase
    .from("students")
    .select("name, date_of_birth")
    .is("deleted_at", null)
    .not("date_of_birth", "is", null);

  const now = new Date();
  const todayMonth = now.getMonth() + 1;
  const todayDay = now.getDate();
  const birthdaysToday = (allStudents ?? [])
    .filter((s) => {
      if (!s.date_of_birth) return false;
      const dob = new Date(s.date_of_birth);
      return dob.getMonth() + 1 === todayMonth && dob.getDate() === todayDay;
    })
    .map((s) => s.name);

  const todayDate = new Date().toISOString().split("T")[0];
  const sevenDaysAhead = new Date();
  sevenDaysAhead.setDate(sevenDaysAhead.getDate() + 7);
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("title, event_date")
    .gte("event_date", todayDate)
    .lte("event_date", sevenDaysAhead.toISOString().split("T")[0])
    .order("event_date", { ascending: true });

  const { data: newApplications } = await supabase
    .from("admissions")
    .select("id")
    .eq("status", "new");

  return {
    overdueCount: overdue.length,
    overdueTotal,
    remindersDue,
    newStudentsThisWeek: recentStudents?.length ?? 0,
    absentToday: absentToday?.length ?? 0,
    birthdaysToday,
    upcomingEvents: upcomingEvents ?? [],
    newApplications: newApplications?.length ?? 0,
  };
}
