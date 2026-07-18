import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import PengurusManager from './PengurusManager';
import ProfilManager from './ProfilManager';
import UMKMManager from './UMKMManager';

const tabs = [
  { id: 'pengurus', label: 'Kelola Pengurus' },
  { id: 'umkm', label: 'Kelola UMKM' },
  { id: 'profil', label: 'Profil Desa' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pengurus');
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  }

  function handleTabChange(tabId) {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  }

  function renderSidebarContent() {
    return (
      <div className="flex h-full flex-col px-4 py-4 md:px-6 md:py-6">
        <div className="mb-4 md:mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Admin CMS
          </p>
          <h1 className="mt-1 text-xl font-bold text-white">
            Dashboard Desa
          </h1>
        </div>

        <nav className="flex flex-col gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`whitespace-nowrap rounded-md px-4 py-2 text-left text-sm font-medium transition ${
                  isActive
                    ? 'bg-green-700 text-white shadow-sm'
                    : 'text-emerald-100 hover:bg-green-700 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full rounded-md border border-emerald-200/50 px-4 py-2 text-sm font-medium text-emerald-50 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-green-800 bg-green-900 px-4 py-3 text-white shadow-sm md:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Admin CMS
          </p>
          <h1 className="text-lg font-bold">Dashboard Desa</h1>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-emerald-200/40 text-emerald-50 transition hover:bg-green-800"
          aria-label="Buka menu admin"
          aria-expanded={mobileMenuOpen}
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Tutup menu admin"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-green-900 text-white shadow-xl">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-green-700 bg-green-900 text-white shadow-sm md:flex">
        {renderSidebarContent()}
      </aside>

      <main className="px-4 py-6 sm:px-6 md:ml-72 md:px-8 md:py-8">
        <div className="mx-auto max-w-6xl">
          {activeTab === 'pengurus' && <PengurusManager />}
          {activeTab === 'umkm' && <UMKMManager />}
          {activeTab === 'profil' && <ProfilManager />}
        </div>
      </main>
    </div>
  );
}
