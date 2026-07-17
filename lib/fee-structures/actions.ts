"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const lineItemSchema = z.object({
  label: z.string().min(1),
  amount: z.number().positive(),
});

const createFeeStructureSchema = z.object({
  classId: z.string().min(1, "Select a class"),
  termId: z.string().min(1, "Select a term"),
  lineItems: z.array(lineItemSchema).min(1, "Add at least one fee line item"),
});

export async function createFeeStructure(input: {
  classId: string;
  termId: string;
  lineItems: { label: string; amount: number }[];
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { data: staffRecord } = await supabase
    .from("users")
    .select("school_id, id")
    .eq("auth_user_id", user.id)
    .single();
  if (!staffRecord) return { error: "No school found for this account" };

  const parsed = createFeeStructureSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `${issue.path.join(".")}: ${issue.message}` };
  }

  const { data: feeStructure, error: fsError } = await supabase
    .from("fee_structures")
    .insert({
      school_id: staffRecord.school_id,
      class_id: parsed.data.classId,
      term_id: parsed.data.termId,
      created_by: staffRecord.id,
    })
    .select("id")
    .single();

  if (fsError || !feeStructure) {
    return { error: fsError?.message ?? "Could not create fee structure" };
  }

  const lineItemRows = parsed.data.lineItems.map((item) => ({
    fee_structure_id: feeStructure.id,
    label: item.label,
    amount: item.amount,
  }));

  const { error: lineItemsError } = await supabase
    .from("fee_line_items")
    .insert(lineItemRows);

  if (lineItemsError) return { error: lineItemsError.message };

  return { success: true };
}

export async function getFeeStructures() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fee_structures")
    .select("id, created_at, classes(name), terms(name), fee_line_items(label, amount)")
    .order("created_at", { ascending: false });

  if (error) return { feeStructures: [], error: error.message };
  return { feeStructures: data ?? [], error: null };
}
