import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import RequestServicePage from './pages/RequestServicePage';
import RequestsPage from './pages/RequestsPage';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminRegisterPage from './pages/AdminRegisterPage';
import Navbar from './components/Navbar';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage onSwitchToRegister={() => window.location.href = '/register'} />} />
        <Route path="/register" element={<RegisterPage onSwitchToLogin={() => window.location.href = '/login'} />} />
        <Route path="/admin-register" element={<AdminRegisterPage />} />
        <Route path="/services" element={<LandingPage />} />
        <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/request" element={<ProtectedRoute allowedRoles={['customer']}><RequestServicePage /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><RequestsPage /></ProtectedRoute>} />
        <Route path="/booking" element={<ProtectedRoute allowedRoles={['customer']}><RequestServicePage /></ProtectedRoute>} />
        <Route path="/customer-dashboard" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
        <Route path="/provider-dashboard" element={<ProtectedRoute allowedRoles={['provider']}><ProviderDashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/about" element={<div className="min-h-screen bg-background p-8"><h1 className="text-3xl font-bold">About Us</h1></div>} />
        <Route path="/contact" element={<div className="min-h-screen bg-background p-8"><h1 className="text-3xl font-bold">Contact Us</h1></div>} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
