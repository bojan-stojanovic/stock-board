import { NavLink, Outlet } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <span className="text-lg font-bold">Stockboard</span>
          <nav aria-label="Main" className="flex gap-1">
            <NavLink to="/" end className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/portfolio" className={linkClass}>
              Portfolio
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-6 text-xs text-slate-500">
        Quotes are delayed and may be incomplete. Nothing here is investment advice.
      </footer>
    </div>
  );
}