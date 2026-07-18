import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import Layanan from './components/Layanan';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import PublicHome from './components/PublicHome';

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
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
