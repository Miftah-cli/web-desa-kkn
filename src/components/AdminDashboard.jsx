import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import PengurusManager from './PengurusManager';
import UMKMManager from './UMKMManager';

const tabs = [
  { id: 'pengurus', label: 'Kelola Pengurus' },
  { id: 'umkm', label: 'Kelola UMKM' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pengurus');
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="border-b border-slate-200 bg-white shadow-sm lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col px-4 py-4 lg:px-6 lg:py-6">
          <div className="mb-4 lg:mb-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Admin CMS
            </p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">
              Dashboard Desa
            </h1>
          </div>

          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap rounded-md px-4 py-2 text-left text-sm font-medium transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-4 lg:mt-auto">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl">
          {activeTab === 'pengurus' && <PengurusManager />}
          {activeTab === 'umkm' && <UMKMManager />}
        </div>
      </main>
    </div>
  );
}
