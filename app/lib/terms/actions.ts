"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createTermSchema = z.object({
  name: z.string().min(1, "Term name is required"),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});

export async function createTerm(input: { name: string; startDate: string; endDate: string }) {
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

  const parsed = createTermSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("terms").insert({
    school_id: staffRecord.school_id,
    name: parsed.data.name,
    start_date: parsed.data.startDate,
    end_date: parsed.data.endDate,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function getTerms() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("terms")
    .select("id, name, start_date, end_date")
    .order("start_date", { ascending: false });
  if (error) return { terms: [], error: error.message };
  return { terms: data ?? [], error: null };
}