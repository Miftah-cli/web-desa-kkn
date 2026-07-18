import { useState } from 'react';
import { Link } from 'react-router-dom';

const layananItems = [
  {
    title: 'KTP Elektronik (e-KTP)',
    image: '/poster/ektp.jpeg',
    requirements:
      'Biaya GRATIS! Syarat Utama: Berusia 17 tahun/sudah menikah, fotocopy KK, mengisi formulir permohonan, rekam biometrik di Disdukcapil (tidak dapat diwakilkan). Jika Hilang/Rusak: Surat Kehilangan dari Kepolisian & fotocopy KK.',
  },
  {
    title: 'Kartu Keluarga (KK)',
    image: '/poster/kk.jpeg',
    requirements:
      'Syarat sementara: fotocopy KTP anggota keluarga, KK lama, surat pengantar RT/RW, dan dokumen pendukung perubahan data seperti akta kelahiran, buku nikah, atau surat pindah jika diperlukan.',
  },
  {
    title: 'Surat Keterangan Domisili',
    image: '/poster/domisili.jpeg',
    requirements:
      'Syarat sementara: fotocopy KTP, fotocopy KK, surat pengantar RT/RW, pas foto bila diperlukan, serta keterangan alamat domisili lengkap sesuai kondisi tempat tinggal.',
  },
  {
    title: 'Akta Kelahiran',
    image: '/poster/akta.jpeg',
    requirements:
      'Syarat sementara: Surat keterangan lahir, fotocopy KK, fotocopy KTP orang tua, fotocopy buku nikah/akta perkawinan orang tua, dan data saksi sesuai ketentuan administrasi yang berlaku.',
  },
];

const navLinks = [
  { href: '/#beranda', label: 'Beranda' },
  { to: '/layanan', label: 'Layanan' },
  { href: '/#profil', label: 'Profil' },
  { href: '/#pengurus', label: 'Pengurus' },
  { href: '/#umkm', label: 'UMKM' },
  { href: '/#potensi-lokal', label: 'Potensi' },
];

const bottomNavLinks = [
  {
    href: '/#beranda',
    label: 'Beranda',
    icon: (
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5Z" />
    ),
  },
  {
    to: '/layanan',
    label: 'Layanan',
    icon: (
      <path d="M6 3h9l3 3v15H6V3ZM14 3v4h4M9 12h6M9 16h6" />
    ),
  },
  {
    href: '/#profil',
    label: 'Profil',
    icon: (
      <path d="M4 20a8 8 0 0 1 16 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    ),
  },
  {
    href: '/#pengurus',
    label: 'Pengurus',
    icon: (
      <path d="M16 11a4 4 0 1 0-8 0M3 21a7 7 0 0 1 14 0M20 21a5 5 0 0 0-4-4.9M17 3.5a3.5 3.5 0 0 1 0 7" />
    ),
  },
  {
    href: '/#umkm',
    label: 'UMKM',
    icon: (
      <path d="M4 10h16l-1 11H5L4 10ZM7 10V7a5 5 0 0 1 10 0v3M8 14h.01M16 14h.01" />
    ),
  },
];

export default function Layanan() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <main className="min-h-screen bg-emerald-50 pb-16 text-green-950 md:pb-0">
      <header className="sticky top-0 z-50 hidden border-b border-green-800/20 bg-green-900/95 text-white shadow-sm backdrop-blur md:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-bold tracking-tight">
            Padukuhan Piji
          </Link>

          <nav className="flex gap-1 overflow-x-auto">
            {navLinks.map((link) =>
              link.to ? (
                <Link
                  key={link.to}
                  to={link.to}
                  className="whitespace-nowrap rounded-md bg-green-700 px-3 py-2 text-sm font-medium text-white"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-green-50 transition hover:bg-green-800 hover:text-white"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>
        </div>
      </header>

      <section className="bg-green-950 px-6 py-16 text-white md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
            Informasi Pelayanan
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
            Layanan Administrasi Padukuhan
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-green-50 md:text-lg">
            Panduan ringkas persyaratan dokumen administrasi warga Padukuhan
            Piji.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 md:py-14">
        <div className="mx-auto max-w-4xl space-y-4">
          {layananItems.map((item, index) => {
            const isOpen = openIndex === index;
            const panelId = `layanan-panel-${index}`;

            return (
              <article
                key={item.title}
                className="overflow-hidden rounded-lg border border-green-200 bg-white shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-emerald-50"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span className="text-base font-semibold text-green-950 md:text-lg">
                    {item.title}
                  </span>
                  <svg
                    className={`h-5 w-5 shrink-0 text-green-700 transition ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {isOpen && (
                  <div
                    id={panelId}
                    className="border-t border-green-100 bg-emerald-50/40 px-4 py-6 sm:px-6"
                  >
                    <img
                      src={item.image}
                      alt={`Poster ${item.title}`}
                      className="mx-auto mb-6 h-auto w-full max-w-2xl rounded-lg object-contain shadow-md"
                    />
                    <p className="mx-auto max-w-2xl text-sm leading-7 text-green-900 md:text-base">
                      {item.requirements}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-200 bg-white shadow-lg md:hidden">
        <div className="grid h-16 grid-cols-5">
          {bottomNavLinks.map((link) => {
            const isActive = link.to === '/layanan';
            const contentClassName = `flex min-w-[56px] flex-col items-center justify-center gap-1 rounded-lg px-2 py-1 transition ${
              isActive
                ? 'bg-green-700 text-white'
                : 'bg-transparent text-gray-600 group-hover:bg-emerald-50 group-hover:text-green-950'
            }`;

            return link.to ? (
              <Link
                key={link.to}
                to={link.to}
                className="group flex items-center justify-center text-[11px] font-medium"
                aria-label={link.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={contentClassName}>
                  <NavIcon>{link.icon}</NavIcon>
                  <span>{link.label}</span>
                </span>
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="group flex items-center justify-center text-[11px] font-medium"
                aria-label={link.label}
              >
                <span className={contentClassName}>
                  <NavIcon>{link.icon}</NavIcon>
                  <span>{link.label}</span>
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </main>
  );
}

function NavIcon({ children }) {
  return (
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
      {children}
    </svg>
  );
}
