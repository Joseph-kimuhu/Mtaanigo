import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-green-600">MtaaniGo</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-green-600 px-3 py-2">Home</Link>
            <Link to="/requests" className="text-gray-700 hover:text-green-600 px-3 py-2">My Requests</Link>
            {user?.role === 'customer' && (
              <Link to="/request" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                Request Service
              </Link>
            )}
            <span className="text-sm text-gray-600">{user?.full_name}</span>
            <button
              onClick={handleLogout}
              className="text-gray-700 hover:text-red-600 px-3 py-2"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
