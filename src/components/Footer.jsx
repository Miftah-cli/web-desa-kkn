import { Link } from 'react-router-dom';

const footerLinks = [
  { href: '/#beranda', label: 'Beranda' },
  { href: '/#profil', label: 'Profil' },
  { href: '/#potensi-lokal', label: 'Potensi' },
  { href: '/#umkm', label: 'UMKM' },
  { href: '/#kontak', label: 'Kontak' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-green-900 px-6 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Padukuhan Piji</h2>
          <p className="mt-4 text-sm leading-6 text-green-50">
            Pusat informasi resmi dan pelayanan digital untuk warga Padukuhan
            Piji.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight">Navigasi</h2>
          <nav className="mt-4 grid grid-cols-2 gap-x-6 text-sm text-green-50">
            <div className="flex flex-col gap-2">
              {footerLinks.slice(0, 3).map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-emerald-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {footerLinks.slice(3).map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-emerald-200"
                >
                  {link.label}
                </a>
              ))}
              <Link to="/login" className="transition hover:text-emerald-200">
                Login Admin
              </Link>
            </div>
          </nav>
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight">Lokasi</h2>
          <p className="mt-4 text-sm leading-6 text-green-50">
            Piji, Mertelu, Gedangsari, Gunungkidul, Daerah Istimewa Yogyakarta,
            Indonesia 55863
          </p>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-green-700 pt-6 text-center text-xs text-green-100">
        © Copyright by KKN 89 UAJY Kelompok 29 {currentYear}. All Right
        Reserved.
      </div>
    </footer>
  );
}
