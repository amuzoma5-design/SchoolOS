import { NavDrawer } from "@/components/nav-drawer";

export function PageHeader({ title }: { title: string }) {
  return (
    <div className="flex items-start justify-between border-b border-line bg-white px-6 py-4">
      <div>
        <p className="text-xs font-semibold tracking-wide text-ink/40">SCHOOLOS</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">{title}</h1>
      </div>
      <NavDrawer />
    </div>
  );
}
