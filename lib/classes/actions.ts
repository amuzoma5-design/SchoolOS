"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
});

export async function createClass(input: { name: string }) {
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

  const parsed = createClassSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("classes").insert({
    school_id: staffRecord.school_id,
    name: parsed.data.name,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function getClasses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) return { classes: [], error: error.message };
  return { classes: data ?? [], error: null };
}
