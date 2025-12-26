import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import OwnerDashboard from './pages/owner/Dashboard';
import AddHotel from './pages/owner/AddHotel';
import OwnerHotelDetails from './pages/owner/HotelDetails';
import GuestBookings from './pages/owner/GuestBookings';
import HotelDetails from './pages/HotelDetails';

import Home from './pages/Home';
import Explore from './pages/Explore';
import MyBookings from './pages/MyBookings';
import Wishlist from './pages/Wishlist';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSecurity from './pages/admin/AdminSecurity';
import Profile from './pages/Profile';








// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Placeholder removed - Imported Home




import { Footer } from './components/layout/Footer';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/hotels/:id" element={<HotelDetails />} />

              <Route path="/login" element={<Login />} />

              <Route path="/register" element={<Register />} />

              {/* Protected: Customer */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                }
              />

              {/* Protected: Admin */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/security"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminSecurity />
                  </ProtectedRoute>
                }
              />

              {/* Protected: Owner */}

              <Route
                path="/owner/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/add-hotel"
                element={
                  <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
                    <AddHotel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/hotels/:id"
                element={
                  <ProtectedRoute allowedRoles={['OWNER', 'ADMIN']}>
                    <OwnerHotelDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/owner/bookings"
                element={
                  <ProtectedRoute allowedRoles={['OWNER']}>
                    <GuestBookings />
                  </ProtectedRoute>
                }
              />


            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
