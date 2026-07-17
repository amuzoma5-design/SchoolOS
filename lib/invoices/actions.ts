"use server";

import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export async function generateInvoicesForFeeStructure(feeStructureId: string) {
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

  const { data: feeStructure, error: fsError } = await supabase
    .from("fee_structures")
    .select("id, class_id, term_id, terms(end_date), fee_line_items(amount)")
    .eq("id", feeStructureId)
    .single();

  if (fsError || !feeStructure) {
    return { error: fsError?.message ?? "Fee structure not found" };
  }

  const amountDue = (feeStructure.fee_line_items as any[]).reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );
  const dueDate = (feeStructure.terms as any)?.end_date;

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id")
    .eq("school_id", staffRecord.school_id)
    .eq("class_id", feeStructure.class_id);

  if (studentsError) return { error: studentsError.message };
  if (!students || students.length === 0) {
    return { error: "No students found in this class yet" };
  }

  const { data: existingInvoices } = await supabase
    .from("invoices")
    .select("student_id")
    .eq("fee_structure_id", feeStructureId);

  const alreadyInvoiced = new Set((existingInvoices ?? []).map((i) => i.student_id));

  const newInvoiceRows = students
    .filter((s) => !alreadyInvoiced.has(s.id))
    .map((s) => ({
      school_id: staffRecord.school_id,
      student_id: s.id,
      fee_structure_id: feeStructureId,
      term_id: feeStructure.term_id,
      amount_due: amountDue,
      due_date: dueDate,
      payment_token: randomUUID(),
    }));

  if (newInvoiceRows.length === 0) {
    return { error: "Invoices already exist for every student in this class" };
  }

  const { error: insertError } = await supabase.from("invoices").insert(newInvoiceRows);
  if (insertError) return { error: insertError.message };

  return { success: true, count: newInvoiceRows.length };
}

export async function getInvoices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("id, amount_due, amount_paid, status, due_date, payment_token, students(name)")
    .order("due_date", { ascending: true });

  if (error) return { invoices: [], error: error.message };
  return { invoices: data ?? [], error: null };
}

export async function logManualPayment(input: { invoiceId: string; amount: number }) {
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

  if (!input.amount || input.amount <= 0) {
    return { error: "Amount must be greater than zero" };
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, school_id, amount_due, amount_paid")
    .eq("id", input.invoiceId)
    .single();

  if (invoiceError || !invoice) {
    return { error: invoiceError?.message ?? "Invoice not found" };
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    school_id: invoice.school_id,
    invoice_id: invoice.id,
    amount: input.amount,
    source: "manual",
    logged_by: staffRecord.id,
  });

  if (paymentError) return { error: paymentError.message };

  const newAmountPaid = Number(invoice.amount_paid) + input.amount;
  const newStatus =
    newAmountPaid >= Number(invoice.amount_due)
      ? "paid"
      : newAmountPaid > 0
      ? "partial"
      : "unpaid";

  const { error: updateError } = await supabase
    .from("invoices")
    .update({ amount_paid: newAmountPaid, status: newStatus })
    .eq("id", invoice.id);

  if (updateError) return { error: updateError.message };

  return { success: true };
}
