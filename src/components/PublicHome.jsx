import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const villageStats = [
  { label: 'Jumlah Penduduk', value: '2.450 Jiwa' },
  { label: 'Luas Wilayah', value: '325 Ha' },
  { label: 'Batas Utara', value: 'Desa Tetangga Utara' },
  { label: 'Batas Selatan', value: 'Area Persawahan' },
];

export default function PublicHome() {
  const [pengurus, setPengurus] = useState([]);
  const [umkm, setUmkm] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPublicData() {
      setLoading(true);
      setError('');

      const [pengurusResult, umkmResult] = await Promise.all([
        supabase
          .from('pengurus')
          .select('jabatan, nama')
          .order('jabatan', { ascending: true }),
        supabase
          .from('umkm')
          .select('id, nama, alamat, no_telp, deskripsi')
          .order('id', { ascending: true }),
      ]);

      if (pengurusResult.error || umkmResult.error) {
        setError(
          pengurusResult.error?.message ||
            umkmResult.error?.message ||
            'Gagal memuat data desa.'
        );
      } else {
        setPengurus(pengurusResult.data || []);
        setUmkm(umkmResult.data || []);
      }

      setLoading(false);
    }

    fetchPublicData();
  }, []);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative flex min-h-[520px] items-center overflow-hidden bg-slate-900 px-6 py-20 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-slate-950/45" />

        <div className="relative mx-auto w-full max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
              Selamat Datang
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
              Website Resmi Desa
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-100 md:text-lg">
              Portal informasi desa untuk mengenal pemerintahan, potensi
              lokal, dan layanan masyarakat secara lebih dekat.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Tentang Desa
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Data berikut masih berupa placeholder dan dapat diganti dengan
              informasi profil desa yang sebenarnya.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {villageStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-slate-200 bg-slate-50 p-5"
              >
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
                Susunan Pengurus
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Daftar pengurus desa berdasarkan data terbaru.
              </p>
            </div>
          </div>

          {loading ? (
            <LoadingState text="Memuat data pengurus..." />
          ) : error ? (
            <ErrorState message={error} />
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pengurus.map((row) => (
                <article
                  key={row.jabatan}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm font-medium text-emerald-700">
                    {row.jabatan}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    {row.nama || '-'}
                  </h3>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Potensi UMKM
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Produk dan usaha lokal yang menjadi bagian dari kekuatan ekonomi
              desa.
            </p>
          </div>

          {loading ? (
            <LoadingState text="Memuat data UMKM..." />
          ) : error ? (
            <ErrorState message={error} />
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {umkm.map((item) => (
                <article
                  key={item.id}
                  className="flex min-h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="text-xl font-semibold text-slate-900">
                    {item.nama}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                    {item.deskripsi || 'Deskripsi UMKM belum tersedia.'}
                  </p>
                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
                    <p className="text-slate-700">
                      <span className="font-medium text-slate-900">
                        Alamat:
                      </span>{' '}
                      {item.alamat || '-'}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-medium text-slate-900">
                        Telepon:
                      </span>{' '}
                      {item.no_telp || '-'}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Lokasi Desa
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Peta lokasi desa untuk memudahkan masyarakat dan pengunjung.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <iframe
              title="Lokasi Desa"
              src="https://www.google.com/maps?q=Indonesia&output=embed"
              className="h-[360px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-6 py-6 text-center">
        <p className="text-sm text-slate-500">Website Resmi Desa</p>
        <Link
          to="/login"
          className="mt-2 inline-block text-xs font-medium text-slate-400 transition hover:text-slate-700"
        >
          Admin Login
        </Link>
      </footer>
    </main>
  );
}

function LoadingState({ text }) {
  return (
    <div className="mt-8 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      {text}
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
      {message}
    </div>
  );
}
