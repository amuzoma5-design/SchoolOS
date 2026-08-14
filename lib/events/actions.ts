"use server";

import { createClient } from "@/lib/supabase/server";

export async function createEvent(input: { title: string; eventDate: string }) {
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

  if (!input.title || !input.eventDate) {
    return { error: "Title and date are required" };
  }

  const { error } = await supabase.from("events").insert({
    school_id: staffRecord.school_id,
    title: input.title,
    event_date: input.eventDate,
    created_by: staffRecord.id,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteEvent(eventId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function getUpcomingEvents() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("events")
    .select("id, title, event_date")
    .gte("event_date", today)
    .order("event_date", { ascending: true });

  if (error) return { events: [], error: error.message };
  return { events: data ?? [], error: null };
}
