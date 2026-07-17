"use server";

import { createClient } from "@/lib/supabase/server";

function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return "234" + digits.slice(1);
  return digits;
}

export async function getRemindersDue() {
  const supabase = await createClient();

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, amount_due, amount_paid, status, due_date, students(name, parents(name, phone))")
    .neq("status", "paid")
    .order("due_date", { ascending: true });

  if (error || !invoices) {
    return { reminders: [] as any[], error: error?.message ?? "Could not load reminders" };
  }

  const reminders = invoices.map((inv: any) => {
    const balance = Number(inv.amount_due) - Number(inv.amount_paid);
    const parentPhone = inv.students?.parents?.phone ?? "";
    const parentName = inv.students?.parents?.name ?? "Parent";
    const studentName = inv.students?.name ?? "your child";

    const message =
      "Hello " + parentName + ", this is a reminder from the school that " +
      studentName + "'s outstanding balance is NGN " + balance.toLocaleString() +
      ", due " + inv.due_date + ". Kindly make payment at your earliest convenience. Thank you.";

    const whatsappNumber = toWhatsAppNumber(parentPhone);
    const whatsappLink = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);

    return {
      invoiceId: inv.id,
      studentName,
      parentName,
      parentPhone,
      balance,
      dueDate: inv.due_date,
      status: inv.status,
      whatsappLink,
    };
  });

  return { reminders, error: null };
}
