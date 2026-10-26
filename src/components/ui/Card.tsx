import type { ReactNode } from "react";

export default function Card({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      {children}
    </section>
  );
}