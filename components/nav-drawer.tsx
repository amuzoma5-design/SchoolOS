"use client";

import { useState } from "react";
import { SignOutButton } from "@/components/sign-out-button";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/classes", label: "Classes" },
  { href: "/terms", label: "Terms" },
  { href: "/students", label: "Students" },
  { href: "/fee-structures", label: "Fees" },
  { href: "/invoices", label: "Invoices" },
  { href: "/staff", label: "Staff" },
  { href: "/reminders", label: "Reminders" },
  { href: "/attendance", label: "Attendance" },
  { href: "/events", label: "Events" },
  { href: "/admissions", label: "Admissions" },
  { href: "/settings", label: "Settings" },
  { href: "/upgrade", label: "Upgrade" },
];

export function NavDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Open menu" className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-md border border-line bg-white">
        <span className="h-0.5 w-5 bg-ink"></span>
        <span className="h-0.5 w-5 bg-ink"></span>
        <span className="h-0.5 w-5 bg-ink"></span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)}></div>

          <div className="absolute right-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between px-6 pt-6">
              <p className="text-xs font-semibold tracking-wide text-ink/40">SCHOOLOS</p>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-2xl leading-none text-ink/50">&times;</button>
            </div>

            <nav className="mt-4 flex-1 overflow-y-auto px-6">
              <div className="flex flex-col gap-1 pb-4">
                {links.map((link) => (
                  <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-ink hover:bg-paper">{link.label}</a>
                ))}
              </div>
            </nav>

            <div className="flex-shrink-0 border-t border-line px-6 py-4">
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
