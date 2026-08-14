"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { createEvent, deleteEvent, getUpcomingEvents } from "@/lib/events/actions";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadEvents() {
    const result = await getUpcomingEvents();
    setEvents(result.events);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await createEvent({ title, eventDate });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setTitle("");
    setEventDate("");
    loadEvents();
  }

  async function handleDelete(id: string) {
    await deleteEvent(id);
    loadEvents();
  }

  const inputClass = "mt-1 block w-full rounded-md border border-line px-3 py-2 text-ink";

  return (
    <main className="min-h-screen bg-paper">
      <PageHeader title="Events" />
      <div className="p-6">
        <div className="max-w-md rounded-lg border border-line bg-white p-6">
          <form onSubmit={handleSubmit}>
            <label className="text-sm text-ink/70">Event title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. PTA Meeting"
              className={inputClass}
            />
            <label className="mt-3 block text-sm text-ink/70">Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={inputClass}
            />
            {error && <p className="mt-2 text-sm text-overdue">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="mt-3 rounded-md bg-trust px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add event"}
            </button>
          </form>
        </div>

        <div className="mt-6 max-w-md rounded-lg border border-line bg-white p-6">
          <h2 className="text-sm font-semibold text-ink/70">Upcoming events</h2>
          {events.length === 0 && <p className="mt-2 text-sm text-ink/60">Nothing scheduled yet.</p>}
          <ul className="mt-2 divide-y divide-line">
            {events.map((ev) => (
              <li key={ev.id} className="flex items-center justify-between py-2">
                <span className="text-ink">{ev.title} <span className="text-ink/50 text-sm">({ev.event_date})</span></span>
                <button onClick={() => handleDelete(ev.id)} className="text-sm text-overdue">Remove</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
