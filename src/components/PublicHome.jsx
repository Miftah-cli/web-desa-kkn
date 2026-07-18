import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const staticPadukuhanStats = [
  { label: 'Jumlah RT', value: '5 RT' },
  { label: 'Potensi Utama', value: 'Padi & Bambu' },
];

const navLinks = [
  { href: '#beranda', label: 'Beranda' },
  { href: '#visi-misi', label: 'Visi Misi' },
  { href: '#pengurus', label: 'Pengurus' },
  { href: '#umkm', label: 'UMKM' },
  { href: '#potensi-lokal', label: 'Potensi' },
];

const bottomNavLinks = [
  {
    href: '#beranda',
    label: 'Beranda',
    icon: (
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5Z" />
    ),
  },
  {
    href: '#profil',
    label: 'Profil',
    icon: (
      <path d="M4 20a8 8 0 0 1 16 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    ),
  },
  {
    href: '#pengurus',
    label: 'Pengurus',
    icon: (
      <path d="M16 11a4 4 0 1 0-8 0M3 21a7 7 0 0 1 14 0M20 21a5 5 0 0 0-4-4.9M17 3.5a3.5 3.5 0 0 1 0 7" />
    ),
  },
  {
    href: '#umkm',
    label: 'UMKM',
    icon: (
      <path d="M4 10h16l-1 11H5L4 10ZM7 10V7a5 5 0 0 1 10 0v3M8 14h.01M16 14h.01" />
    ),
  },
];

const heroImage = '/piji1.png';

const umkmPlaceholderImage =
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80';

const localPotentials = [
  {
    title: 'Hasil Bumi',
    image: '/hasilbumi.png',
    description:
      'Hamparan sawah, tanaman padi, kebun bambu, dan hasil pertanian warga menjadi kekuatan utama Padukuhan Piji.',
  },
  {
    title: 'Karawitan',
    image: '/karawitan.jpg',
    description:
      'Karawitan terus dirawat melalui kegiatan warga, latihan kelompok seni, dan agenda budaya padukuhan.',
  },
];

const jabatanOptions = [
  'Dukuh',
  'RW',
  'RT 01',
  'RT 02',
  'RT 03',
  'RT 04',
  'RT 05',
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

function normalizeJabatan(jabatan = '') {
  const cleanedJabatan = jabatan.trim().toUpperCase();

  if (cleanedJabatan === 'DUKUH') {
    return 'Dukuh';
  }

  if (cleanedJabatan === 'RW') {
    return 'RW';
  }

  const rtMatch = cleanedJabatan.match(/^RT\s*0?([1-5])$/);

  if (rtMatch) {
    return `RT 0${rtMatch[1]}`;
  }

  return jabatan.trim();
}

function isAllowedJabatan(jabatan = '') {
  return jabatanOptions.includes(normalizeJabatan(jabatan));
}

function compareJabatan(a, b) {
  return jabatanOptions.indexOf(a.jabatan) - jabatanOptions.indexOf(b.jabatan);
}

function normalizePengurusRows(rows = []) {
  const rowsByJabatan = new Map();

  rows.forEach((row) => {
    const jabatan = normalizeJabatan(row.jabatan);

    if (isAllowedJabatan(jabatan) && !rowsByJabatan.has(jabatan)) {
      rowsByJabatan.set(jabatan, { ...row, jabatan });
    }
  });

  return jabatanOptions
    .map((jabatan) => rowsByJabatan.get(jabatan) || { jabatan, nama: '', foto: null })
    .sort(compareJabatan);
}

export default function PublicHome() {
  const [pengurus, setPengurus] = useState([]);
  const [umkm, setUmkm] = useState([]);
  const [profilDesa, setProfilDesa] = useState({
    jumlah_jiwa: '',
    luas_wilayah: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileError, setProfileError] = useState('');
  const [showAllUmkm, setShowAllUmkm] = useState(false);

  const jumlahJiwaValue = profileError
    ? 'Gagal memuat'
    : `± ${profilDesa.jumlah_jiwa || '-'} Jiwa`;
  const luasWilayahValue = profileError
    ? 'Gagal memuat'
    : `± ${profilDesa.luas_wilayah || '-'} Ha`;
  const padukuhanStats = [
    {
      label: 'Data Penduduk',
      value: loading ? 'Memuat...' : jumlahJiwaValue,
    },
    {
      label: 'Luas Wilayah',
      value: loading ? 'Memuat...' : luasWilayahValue,
    },
    ...staticPadukuhanStats,
  ];

  const pimpinanPengurus = pengurus.filter((row) =>
    ['Dukuh', 'RW'].includes(row.jabatan)
  );
  const rtPengurus = pengurus.filter((row) =>
    row.jabatan.startsWith('RT')
  );
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
      setProfileError('');

      const [pengurusResult, umkmResult, profilResult] = await Promise.all([
        supabase
          .from('pengurus')
          .select('jabatan, nama, foto')
          .order('jabatan', { ascending: true }),
        supabase
          .from('umkm')
          .select('id, nama, alamat, deskripsi, foto')
          .order('id', { ascending: true }),
        supabase
          .from('profil_desa')
          .select('jumlah_jiwa, luas_wilayah')
          .eq('id', 1)
          .single(),
      ]);

      if (pengurusResult.error || umkmResult.error) {
        setError(
          pengurusResult.error?.message ||
            umkmResult.error?.message ||
            'Gagal memuat data Padukuhan Piji.'
        );
      } else {
        setPengurus(
          normalizePengurusRows(pengurusResult.data)
        );
        setUmkm(umkmResult.data || []);
      }

      if (profilResult.error) {
        setProfileError(profilResult.error.message);
      } else {
        setProfilDesa({
          jumlah_jiwa: profilResult.data?.jumlah_jiwa || '',
          luas_wilayah: profilResult.data?.luas_wilayah || '',
        });
      }

      setLoading(false);
    }

    fetchPublicData();
  }, []);

  return (
    <main className="min-h-screen scroll-smooth bg-emerald-50 pb-16 text-green-950 md:pb-0">
      <header className="sticky top-0 z-50 hidden border-b border-green-800/20 bg-green-900/95 text-white shadow-sm backdrop-blur md:block">
        <div className="mx-auto hidden max-w-6xl flex-col gap-3 px-6 py-4 md:flex lg:flex-row lg:items-center lg:justify-between">
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
              Selamat Datang di Website
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
              Padukuhan Piji
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
          <div className="rounded-lg border border-green-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="border-l-4 border-green-700 bg-green-50/30 py-2 pl-5 rounded-r-lg">
              <p className="mb-4 text-xl font-medium leading-relaxed text-gray-900 md:text-2xl">
                Padukuhan Piji merupakan wilayah yang dianugerahi kekayaan alam
                dan ikatan sosial yang erat. Kehidupan ekonomi masyarakatnya
                berputar harmonis melalui sektor pertanian, peternakan, serta
                industri kreatif unggulan seperti mebel, olahan pangan, dan
                anyaman bambu yang telah diwariskan turun-temurun sejak era
                Simbah Teguh.
              </p>
              <p className="text-base leading-relaxed text-gray-700 md:text-lg">
                Selain budaya gotong royong yang kental dalam kegiatan
                sehari-hari, Padukuhan Piji juga memiliki jejak sejarah yang
                terus dirawat kelestariannya. Salah satu daya tarik historisnya
                adalah situs "Migit Mertelu", sebuah kawasan bersejarah yang
                menurut cerita leluhur pada masa lampau hanya bisa dihuni oleh
                tiga bangunan rumah.
              </p>
            </div>
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
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d19659.95824474363!2d110.59793905696952!3d-7.834408262319754!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a4ed09a2a5733%3A0xe2da0ee78a1189f7!2sPiji%2C%20Mertelu%2C%20Gedang%20Sari%2C%20Gunungkidul%20Regency%2C%20Special%20Region%20of%20Yogyakarta!5e1!3m2!1sen!2sid!4v1784371262415!5m2!1sen!2sid"
              className="h-[420px] w-full"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      </section>

      <section id="pengurus" className="scroll-mt-24 bg-white px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Kelembagaan"
            title="Susunan Pengurus Padukuhan Piji"
            description="Dukuh, RW, dan pengurus RT yang mendukung pelayanan serta koordinasi warga Padukuhan Piji."
          />

          {loading ? (
            <LoadingState text="Memuat data pengurus..." />
          ) : error ? (
            <ErrorState message={error} />
          ) : (
            <>
                <div className="mt-10 space-y-6">
                <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:flex-wrap md:justify-center md:gap-5 md:overflow-visible md:pb-0 md:snap-none">
                  {pimpinanPengurus.map((row) => (
                    <PengurusCard key={row.jabatan} row={row} />
                  ))}
                </div>

                <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:flex-wrap md:justify-center md:gap-5 md:overflow-visible md:pb-0 md:snap-none">
                  {rtPengurus.map((row) => (
                    <PengurusCard key={row.jabatan} row={row} />
                  ))}
                </div>
              </div>
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
              <div className="no-scrollbar mt-10 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:gap-6 md:overflow-visible md:pb-0 md:snap-none md:grid-cols-2 xl:grid-cols-3">
                {visibleUmkm.map((item) => (
                  <article
                    key={item.id}
                    className="flex min-h-full w-[85%] max-w-[300px] shrink-0 snap-center overflow-hidden rounded-lg border border-green-200 bg-white shadow-sm md:w-auto md:max-w-none md:shrink"
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
                        <div className="mt-5 border-t border-green-100 pt-4 text-sm">
                          <p className="text-green-900">
                            <span className="font-medium text-green-950">
                              Alamat:
                            </span>{' '}
                            {item.alamat || '-'}
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

      <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-200 bg-white shadow-lg md:hidden">
        <div className="grid h-16 grid-cols-4">
          {bottomNavLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-green-800 transition hover:bg-emerald-50 hover:text-green-950"
              aria-label={link.label}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {link.icon}
              </svg>
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </nav>
    </main>
  );
}

function PengurusCard({ row }) {
  return (
    <article className="w-[85%] max-w-[300px] shrink-0 snap-center rounded-lg border border-green-200 bg-emerald-50 p-5 text-center shadow-sm sm:w-[220px] md:w-full md:max-w-[220px] md:shrink">
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
