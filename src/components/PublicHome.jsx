import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const padukuhanStats = [
  { label: 'Jumlah Penduduk', value: '2.450 Jiwa' },
  { label: 'Luas Wilayah', value: '325 Ha' },
  { label: 'Jumlah RT', value: '6 RT' },
  { label: 'Potensi Utama', value: 'Padi & Bambu' },
];

const navLinks = [
  { href: '#beranda', label: 'Beranda' },
  { href: '#sejarah', label: 'Sejarah' },
  { href: '#visi-misi', label: 'Visi Misi' },
  { href: '#pengurus', label: 'Pengurus' },
  { href: '#umkm', label: 'UMKM' },
  { href: '#potensi-lokal', label: 'Potensi' },
];

const heroImage =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=80';

const umkmPlaceholderImage =
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80';

const localPotentials = [
  {
    title: 'Hasil Bumi',
    image:
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=900&q=80',
    description:
      'Hamparan sawah, tanaman padi, kebun bambu, dan hasil pertanian warga menjadi kekuatan utama Padukuhan Piji.',
  },
  {
    title: 'Kesenian Lokal',
    image:
      'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80',
    description:
      'Kesenian tradisional terus dirawat melalui kegiatan warga, latihan kelompok seni, dan agenda budaya padukuhan.',
  },
];

const visionItems = [
  'Mewujudkan Padukuhan Piji yang rukun, hijau, mandiri, dan berbudaya.',
];

const missionItems = [
  'Meningkatkan pelayanan masyarakat berbasis gotong royong.',
  'Mengembangkan potensi pertanian, bambu, dan UMKM warga.',
  'Melestarikan kesenian lokal sebagai identitas Padukuhan Piji.',
  'Menjaga lingkungan agar tetap asri, bersih, dan produktif.',
];

function avatarPlaceholder(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || 'Pengurus Padukuhan Piji'
  )}&background=dcfce7&color=14532d&size=160`;
}

export default function PublicHome() {
  const [pengurus, setPengurus] = useState([]);
  const [umkm, setUmkm] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllPengurus, setShowAllPengurus] = useState(false);
  const [showAllUmkm, setShowAllUmkm] = useState(false);

  const visiblePengurus = showAllPengurus ? pengurus : pengurus.slice(0, 5);
  const visibleUmkm = showAllUmkm ? umkm : umkm.slice(0, 5);

  useEffect(() => {
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'smooth';

    return () => {
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    };
  }, []);

  useEffect(() => {
    async function fetchPublicData() {
      setLoading(true);
      setError('');

      const [pengurusResult, umkmResult] = await Promise.all([
        supabase
          .from('pengurus')
          .select('jabatan, nama, foto')
          .order('jabatan', { ascending: true }),
        supabase
          .from('umkm')
          .select('id, nama, alamat, no_telp, deskripsi, foto')
          .order('id', { ascending: true }),
      ]);

      if (pengurusResult.error || umkmResult.error) {
        setError(
          pengurusResult.error?.message ||
            umkmResult.error?.message ||
            'Gagal memuat data Padukuhan Piji.'
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
    <main className="min-h-screen scroll-smooth bg-emerald-50 text-green-950">
      <header className="sticky top-0 z-50 border-b border-green-800/20 bg-green-900/95 text-white shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <a href="#beranda" className="text-lg font-bold tracking-tight">
            Padukuhan Piji
          </a>

          <nav className="flex gap-1 overflow-x-auto">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-green-50 transition hover:bg-green-800 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section
        id="beranda"
        className="relative flex min-h-[640px] scroll-mt-24 items-center overflow-hidden bg-green-950 px-6 py-20 text-white"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
        <div className="absolute inset-0 bg-green-950/60" />

        <div className="relative mx-auto w-full max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
              Selamat Datang di Website Resmi
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
              Padukuhan Piji yang Asri, Guyub, dan Berdaya
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-green-50 md:text-lg">
              Mengenal lebih dekat Padukuhan Piji melalui sejarah, visi misi,
              susunan pengurus, UMKM, serta potensi alam dan kesenian lokal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#sejarah"
                className="rounded-md bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
              >
                Jelajahi Piji
              </a>
              <a
                href="#potensi-lokal"
                className="rounded-md border border-emerald-100/60 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800/80"
              >
                Lihat Potensi
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="sejarah" className="scroll-mt-24 bg-emerald-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Sejarah"
            title="Sejarah Padukuhan Piji"
            description="Kisah singkat tentang akar kehidupan masyarakat dan lingkungan Padukuhan Piji."
          />
          <div className="mt-8 rounded-lg border border-green-200 bg-white p-6 shadow-sm">
            <p className="text-sm leading-7 text-green-900">
              Padukuhan Piji tumbuh dari kehidupan masyarakat yang dekat dengan
              sawah, kebun, rumpun bambu, dan tradisi gotong royong. Dari waktu
              ke waktu, warga menjaga hubungan sosial, merawat lingkungan, dan
              mengembangkan potensi lokal sebagai bekal membangun padukuhan yang
              lebih mandiri dan lestari.
            </p>
          </div>
        </div>
      </section>

      <section id="visi-misi" className="scroll-mt-24 bg-white px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-green-200 bg-emerald-50 p-6">
            <h2 className="text-2xl font-semibold text-green-950">Visi</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-green-900">
              {visionItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-green-700" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-green-200 bg-emerald-50 p-6">
            <h2 className="text-2xl font-semibold text-green-950">Misi</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-green-900">
              {missionItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-green-700" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="profil" className="scroll-mt-24 bg-emerald-50 px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <SectionHeader
              eyebrow="Profil"
              title="Mengenal Padukuhan Piji"
              description="Gambaran ringkas kondisi wilayah, masyarakat, dan potensi utama Padukuhan Piji."
            />

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {padukuhanStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-green-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm font-medium text-green-700">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-green-950">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-green-200 bg-white shadow-sm">
            <iframe
              title="Lokasi Padukuhan Piji"
              src="https://www.google.com/maps?q=Indonesia&output=embed"
              className="h-[420px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <section id="pengurus" className="scroll-mt-24 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Kelembagaan"
            title="Susunan Pengurus Padukuhan Piji"
            description="Dukuh dan pengurus RT yang mendukung pelayanan serta koordinasi warga Padukuhan Piji."
          />

          {loading ? (
            <LoadingState text="Memuat data pengurus..." />
          ) : error ? (
            <ErrorState message={error} />
          ) : (
            <>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visiblePengurus.map((row) => (
                  <article
                    key={row.jabatan}
                    className="rounded-lg border border-green-200 bg-emerald-50 p-5 text-center shadow-sm"
                  >
                    <img
                      src={row.foto || avatarPlaceholder(row.nama || row.jabatan)}
                      alt={row.nama || row.jabatan}
                      className="mx-auto h-24 w-24 rounded-full object-cover ring-4 ring-green-200"
                    />
                    <p className="mt-5 text-sm font-medium text-green-700">
                      {row.jabatan}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-green-950">
                      {row.nama || '-'}
                    </h3>
                  </article>
                ))}
              </div>

              {pengurus.length > 5 && (
                <ShowMoreButton
                  expanded={showAllPengurus}
                  onClick={() => setShowAllPengurus((current) => !current)}
                />
              )}
            </>
          )}
        </div>
      </section>

      <section id="umkm" className="scroll-mt-24 bg-emerald-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Ekonomi Lokal"
            title="UMKM Padukuhan Piji"
            description="Usaha warga yang menggerakkan ekonomi lokal dan memperkuat kemandirian padukuhan."
          />

          {loading ? (
            <LoadingState text="Memuat data UMKM..." />
          ) : error ? (
            <ErrorState message={error} />
          ) : (
            <>
              <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {visibleUmkm.map((item) => (
                  <article
                    key={item.id}
                    className="flex min-h-full overflow-hidden rounded-lg border border-green-200 bg-white shadow-sm"
                  >
                    <div className="flex w-full flex-col">
                      <img
                        src={item.foto || umkmPlaceholderImage}
                        alt={item.nama || 'Foto UMKM'}
                        className="h-52 w-full object-cover"
                      />
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="text-xl font-semibold text-green-950">
                          {item.nama}
                        </h3>
                        <p className="mt-3 flex-1 text-sm leading-6 text-green-900">
                          {item.deskripsi || 'Deskripsi UMKM belum tersedia.'}
                        </p>
                        <div className="mt-5 space-y-2 border-t border-green-100 pt-4 text-sm">
                          <p className="text-green-900">
                            <span className="font-medium text-green-950">
                              Alamat:
                            </span>{' '}
                            {item.alamat || '-'}
                          </p>
                          <p className="text-green-900">
                            <span className="font-medium text-green-950">
                              Telepon:
                            </span>{' '}
                            {item.no_telp || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {umkm.length > 5 && (
                <ShowMoreButton
                  expanded={showAllUmkm}
                  onClick={() => setShowAllUmkm((current) => !current)}
                />
              )}
            </>
          )}
        </div>
      </section>

      <section
        id="potensi-lokal"
        className="scroll-mt-24 bg-white px-6 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Potensi Alam & Kesenian"
            title="Kekayaan Lokal Padukuhan Piji"
            description="Alam yang subur dan tradisi yang hidup menjadi kekuatan bersama masyarakat."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {localPotentials.map((item) => (
              <article
                key={item.title}
                className="overflow-hidden rounded-lg border border-green-200 bg-emerald-50 shadow-sm"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-64 w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-green-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-green-900">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-green-800 bg-green-950 px-6 py-8 text-center">
        <p className="text-sm text-emerald-100">Website Resmi Padukuhan Piji</p>
        <Link
          to="/login"
          className="mt-2 inline-block text-xs font-medium text-green-400 transition hover:text-emerald-100"
        >
          Admin Login
        </Link>
      </footer>
    </main>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-green-950 md:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-green-900">{description}</p>
    </div>
  );
}

function LoadingState({ text }) {
  return (
    <div className="mt-10 flex items-center gap-3 rounded-lg border border-green-200 bg-white p-5 text-sm text-green-900 shadow-sm">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-green-200 border-t-green-800" />
      {text}
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="mt-10 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
      {message}
    </div>
  );
}

function ShowMoreButton({ expanded, onClick }) {
  return (
    <div className="mt-8 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        className="rounded-md border border-green-300 bg-white px-5 py-2.5 text-sm font-semibold text-green-800 transition hover:bg-emerald-50 hover:text-green-950"
      >
        {expanded ? 'Sembunyikan' : 'Lihat Semua'}
      </button>
    </div>
  );
}
