import { useState, type ReactNode } from 'react';
import { ChevronsLeft, ChevronsRight, Home, LayoutDashboard, Leaf, Trash2, UserRound, type LucideIcon } from 'lucide-react';

export type PageKey = 'dashboard' | 'houses' | 'wastes' | 'profile';

interface NavItem {
  key: PageKey;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'houses', label: 'Data Rumah', icon: Home },
  { key: 'wastes', label: 'Pencatatan Sampah', icon: Trash2 },
  { key: 'profile', label: 'Profil', icon: UserRound },
];

interface AppShellProps {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  children: ReactNode;
}

export function AppShell({ activePage, onNavigate, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const activeTitle = NAV_ITEMS.find((item) => item.key === activePage)?.label ?? '';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200 bg-white transition-[width] duration-300 ease-out lg:flex ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className={`flex h-16 items-center border-b border-slate-100 ${collapsed ? 'justify-center' : 'gap-3 px-5'}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Leaf className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0 animate-fade-in">
              <p className="truncate text-sm font-bold text-slate-900">EcoWaste Tracker</p>
              <p className="truncate text-xs text-slate-500">KKN Desa</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 p-3" aria-label="Navigasi utama">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const active = key === activePage;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onNavigate(key)}
                title={collapsed ? label : undefined}
                aria-current={active ? 'page' : undefined}
                className={`group flex w-full items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                  collapsed ? 'justify-center' : 'gap-3 px-3'
                } ${
                  active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-emerald-600' : ''}`} />
                {!collapsed && <span className="truncate">{label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-3">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
            className={`flex w-full items-center rounded-xl py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 ${
              collapsed ? 'justify-center' : 'gap-3 px-3'
            }`}
          >
            {collapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
            {!collapsed && <span>Ciutkan</span>}
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="text-sm font-bold text-slate-900">EcoWaste Tracker</span>
        </div>
        <span className="text-sm font-medium text-slate-500">{activeTitle}</span>
      </header>

      <main
        className={`pb-24 transition-[padding] duration-300 lg:pb-10 ${collapsed ? 'lg:pl-20' : 'lg:pl-64'}`}
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="mb-6 hidden lg:block">
            <p className="text-sm font-medium text-emerald-700">KKN EcoWaste Tracker</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">{activeTitle}</h1>
          </div>
          <div key={activePage} className="animate-fade-in-up">
            {children}
          </div>
        </div>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label="Navigasi bawah"
      >
        <ul className="grid grid-cols-4">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const active = key === activePage;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => onNavigate(key)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                    active ? 'text-emerald-700' : 'text-slate-500'
                  }`}
                >
                  <span
                    className={`flex h-8 w-14 items-center justify-center rounded-full transition-all duration-200 ${
                      active ? 'bg-emerald-100 scale-105' : ''
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="truncate">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
