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
import AdminDashboard from './pages/admin/AdminDashboard';
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




function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 font-sans">
          <Navbar />
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

            {/* Protected: Admin */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
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
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
