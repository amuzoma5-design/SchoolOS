"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAttendanceStreak() {
  const supabase = await createClient();

  const { data: records, error } = await supabase
    .from("attendance")
    .select("date")
    .order("date", { ascending: false });

  if (error || !records || records.length === 0) return { streak: 0 };

  const uniqueDates = Array.from(new Set(records.map((r) => r.date))).sort().reverse();

  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  for (const dateStr of uniqueDates) {
    const recordDate = new Date(dateStr);
    recordDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((cursor.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0 || diffDays === 1) {
      streak++;
      cursor = recordDate;
    } else if (diffDays > 1) {
      break;
    }
  }

  return { streak };
}
