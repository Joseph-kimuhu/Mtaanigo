import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { path: '/provider-dashboard', label: 'Overview', icon: '📊' },
  { path: '/provider-dashboard/profile', label: 'Profile', icon: '👤' },
  { path: '/provider-dashboard/requests', label: 'Requests', icon: '📋' },
  { path: '/provider-dashboard/earnings', label: 'Earnings', icon: '💰' },
  { path: '/provider-dashboard/reviews', label: 'Reviews', icon: '⭐' },
  { path: '/provider-dashboard/portfolio', label: 'Portfolio', icon: '📁' },
];

function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-6">
          <Link to="/" className="text-2xl font-bold text-primary">MtaaniConnect</Link>
          <p className="text-sm text-text-light mt-1">Provider Dashboard</p>
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

      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-50 px-4 py-3 flex items-center justify-between">
        <span className="text-xl font-bold text-primary">MtaaniConnect</span>
        <button className="text-2xl">☰</button>
      </div>

      <main className="flex-1 p-8 md:ml-0 mt-16 md:mt-0">
        {activeTab === 'overview' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Provider Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card p-6">
                <p className="text-text-light text-sm">New Requests</p>
                <p className="text-3xl font-bold text-primary mt-2">5</p>
              </div>
              <div className="card p-6">
                <p className="text-text-light text-sm">Accepted Jobs</p>
                <p className="text-3xl font-bold text-secondary mt-2">12</p>
              </div>
              <div className="card p-6">
                <p className="text-text-light text-sm">Earnings (Month)</p>
                <p className="text-3xl font-bold text-accent mt-2">KSh 45,000</p>
              </div>
              <div className="card p-6">
                <p className="text-text-light text-sm">Rating</p>
                <p className="text-3xl font-bold text-text mt-2">4.9 ⭐</p>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-text mb-4">Recent Requests</h2>
            <div className="space-y-4">
              <div className="card p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-text">Plumbing Repair - Karen</h3>
                    <p className="text-sm text-text-light">Customer: Peter M. • 2.5 km away</p>
                    <p className="text-sm font-medium text-primary mt-1">KSh 3,000</p>
                  </div>
                  <div className="space-x-2">
                    <button className="btn-secondary px-4 py-2">Accept</button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-text-light">Decline</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">My Profile</h1>
            <div className="card p-6">
              <div className="flex items-center mb-6">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-4xl mr-4">👨‍🔧</div>
                <div>
                  <h2 className="text-xl font-semibold text-text">Joseph Plumbing Services</h2>
                  <p className="text-text-light">Professional Plumber • Nairobi</p>
                  <p className="text-accent">⭐ 4.9 (150 reviews)</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Bio</label>
                  <textarea className="w-full p-3 border border-gray-200 rounded-lg" rows={3} defaultValue="Experienced plumber with 10+ years in the industry. Specializing in residential and commercial plumbing." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-1">Skills</label>
                  <input type="text" className="w-full p-3 border border-gray-200 rounded-lg" defaultValue="Pipe installation, Repair, Maintenance" />
                </div>
              </div>
              <button className="btn-primary mt-6">Update Profile</button>
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Earnings</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card p-6">
                <p className="text-text-light text-sm">Today</p>
                <p className="text-3xl font-bold text-primary mt-2">KSh 1,500</p>
              </div>
              <div className="card p-6">
                <p className="text-text-light text-sm">This Week</p>
                <p className="text-3xl font-bold text-secondary mt-2">KSh 12,000</p>
              </div>
              <div className="card p-6">
                <p className="text-text-light text-sm">This Month</p>
                <p className="text-3xl font-bold text-accent mt-2">KSh 45,000</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Customer Reviews</h1>
            <div className="space-y-4">
              <div className="card p-6">
                <div className="flex items-center mb-2">
                  <span className="text-accent text-lg">⭐⭐⭐⭐⭐</span>
                  <span className="ml-2 font-semibold text-text">Peter M.</span>
                </div>
                <p className="text-text-light">"Excellent work! Fixed my pipes in no time."</p>
                <p className="text-sm text-text-light mt-2">2 days ago</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Portfolio</h1>
            <div className="card p-6">
              <p className="text-text-light mb-4">Upload photos of your previous work</p>
              <button className="btn-primary">+ Upload Work</button>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Service Requests</h1>
            <div className="space-y-4">
              <div className="card p-6">
                <h3 className="font-semibold text-text">Plumbing Repair</h3>
                <p className="text-sm text-text-light">Customer: Jane D. • Karen, Nairobi</p>
                <p className="text-sm text-text-light">KSh 3,500 • Today, 3:00 PM</p>
                <div className="mt-4 flex gap-2">
                  <button className="btn-secondary">Accept</button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg">Decline</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProviderDashboard;
