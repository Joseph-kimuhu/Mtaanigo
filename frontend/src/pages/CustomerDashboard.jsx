import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { path: '/customer-dashboard', label: 'Home', icon: '🏠' },
  { path: '/customer-dashboard/search', label: 'Search', icon: '🔍' },
  { path: '/customer-dashboard/bookings', label: 'Bookings', icon: '📅' },
  { path: '/customer-dashboard/payments', label: 'Payments', icon: '💳' },
  { path: '/customer-dashboard/messages', label: 'Messages', icon: '💬' },
  { path: '/customer-dashboard/favorites', label: 'Favorites', icon: '⭐' },
];

function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-6">
          <Link to="/" className="text-2xl font-bold text-primary">MtaaniConnect</Link>
          <p className="text-sm text-text-light mt-1">Welcome, {user?.full_name}</p>
        </div>
        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => setActiveTab(item.label.toLowerCase())}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 ${
                activeTab === item.label.toLowerCase() ? 'bg-blue-50 text-primary border-r-4 border-primary' : 'text-text-light'
              }`}
            >
              <span className="mr-3 text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-50 px-4 py-3 flex items-center justify-between">
        <span className="text-xl font-bold text-primary">MtaaniConnect</span>
        <button className="text-2xl">☰</button>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8 md:ml-0 mt-16 md:mt-0">
        {activeTab === 'home' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card p-6">
                <p className="text-text-light text-sm">Upcoming Bookings</p>
                <p className="text-3xl font-bold text-primary mt-2">3</p>
              </div>
              <div className="card p-6">
                <p className="text-text-light text-sm">Completed</p>
                <p className="text-3xl font-bold text-secondary mt-2">12</p>
              </div>
              <div className="card p-6">
                <p className="text-text-light text-sm">Total Spent</p>
                <p className="text-3xl font-bold text-accent mt-2">KSh 8,500</p>
              </div>
              <div className="card p-6">
                <p className="text-text-light text-sm">Saved Providers</p>
                <p className="text-3xl font-bold text-text mt-2">5</p>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-text mb-4">Recent Activity</h2>
            <div className="card p-6">
              <p className="text-text-light">No recent activity yet. <Link to="/services" className="text-primary">Browse services</Link></p>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Find Services</h1>
            <div className="card p-6">
              <p className="text-text-light">Search for plumbers, electricians, barbers, and more...</p>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">My Bookings</h1>
            <div className="space-y-4">
              <div className="card p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-text">Plumbing Service</h3>
                    <p className="text-sm text-text-light">Scheduled: Today, 2:00 PM</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Upcoming</span>
                </div>
              </div>
              <div className="card p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-text">Electrical Repair</h3>
                    <p className="text-sm text-text-light">Completed: Yesterday</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Completed</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Payment History</h1>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Service</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-text">2026-06-01</td>
                    <td className="px-6 py-4 text-sm text-text">Plumbing</td>
                    <td className="px-6 py-4 text-sm text-text">KSh 2,500</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Paid</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Messages</h1>
            <div className="card p-6">
              <p className="text-text-light">No messages yet</p>
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Saved Providers</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card p-6">No saved providers yet</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CustomerDashboard;
