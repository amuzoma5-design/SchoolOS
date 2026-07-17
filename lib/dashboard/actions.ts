"use server";

import { createClient } from "@/lib/supabase/server";

export async function getDashboardSummary() {
  const supabase = await createClient();

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("amount_due, amount_paid, status, due_date, students(name)");

  if (error || !invoices) {
    return {
      collectionRate: 0,
      totalDue: 0,
      totalPaid: 0,
      outstanding: [] as any[],
      error: error?.message ?? "Could not load dashboard",
    };
  }

  const totalDue = invoices.reduce((sum, inv) => sum + Number(inv.amount_due), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.amount_paid), 0);
  const collectionRate = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;

  const outstanding = invoices
    .filter((inv) => inv.status !== "paid")
    .map((inv: any) => ({
      studentName: inv.students?.name ?? "Unknown",
      balance: Number(inv.amount_due) - Number(inv.amount_paid),
      dueDate: inv.due_date,
      status: inv.status,
    }))
    .sort((a, b) => b.balance - a.balance);

  return { collectionRate, totalDue, totalPaid, outstanding, error: null };
}
