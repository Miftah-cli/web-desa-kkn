import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import Layanan from './components/Layanan';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import PublicHome from './components/PublicHome';
import ScrollToTop from './components/ScrollToTop';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicHome />} />
      <Route path="/layanan" element={<Layanan />} />
      <Route
        path="/login"
        element={
          <>
            <PublicHome />
            <Login />
          </>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
      <ScrollToTopButton />
      <Footer />
    </BrowserRouter>
  );
}

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 360);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      title="Kembali ke atas"
      className={`fixed bottom-20 right-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-green-700 text-white shadow-lg shadow-green-950/20 ring-1 ring-white/40 transition duration-200 hover:bg-green-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 md:bottom-6 md:right-6 ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <svg
        className="h-6 w-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}

export default App;
