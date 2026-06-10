import { useState } from 'react';

const adminMenu = [
  { path: '/admin-dashboard', label: 'Overview', icon: '📊' },
  { path: '/admin-dashboard/users', label: 'Users', icon: '👥' },
  { path: '/admin-dashboard/providers', label: 'Providers', icon: '👷' },
  { path: '/admin-dashboard/categories', label: 'Categories', icon: '📂' },
  { path: '/admin-dashboard/payments', label: 'Payments', icon: '💳' },
  { path: '/admin-dashboard/reports', label: 'Reports', icon: '📈' },
  { path: '/admin-dashboard/notifications', label: 'Notifications', icon: '🔔' },
];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-6">
          <span className="text-2xl font-bold text-primary">MtaaniConnect</span>
          <p className="text-sm text-text-light mt-1">Admin Dashboard</p>
        </div>
        <nav className="mt-6">
          {adminMenu.map((item) => (
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

      <main className="flex-1 p-8">
        {activeTab === 'overview' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Admin Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card p-6">
                <p className="text-text-light text-sm">Total Users</p>
                <p className="text-3xl font-bold text-primary mt-2">1,234</p>
              </div>
              <div className="card p-6">
                <p className="text-text-light text-sm">Active Providers</p>
                <p className="text-3xl font-bold text-secondary mt-2">456</p>
              </div>
              <div className="card p-6">
                <p className="text-text-light text-sm">Revenue (Month)</p>
                <p className="text-3xl font-bold text-accent mt-2">KSh 120,000</p>
              </div>
              <div className="card p-6">
                <p className="text-text-light text-sm">Pending Complaints</p>
                <p className="text-3xl font-bold text-red-500 mt-2">3</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">User Management</h1>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-text">John Doe</td>
                    <td className="px-6 py-4 text-sm text-text">john@example.com</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Customer</span></td>
                    <td className="px-6 py-4">
                      <button className="text-primary text-sm">View</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'providers' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Provider Management</h1>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Service</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-text">Joseph Plumbing</td>
                    <td className="px-6 py-4 text-sm text-text">Plumber</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Active</span></td>
                    <td className="px-6 py-4">
                      <button className="text-primary text-sm">Verify</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Service Categories</h1>
            <div className="card p-6">
              <button className="btn-primary mb-4">+ Add Category</button>
              <div className="space-y-2">
                {['Plumber', 'Electrician', 'Barber', 'Mechanic'].map((cat) => (
                  <div key={cat} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-text">{cat}</span>
                    <button className="text-red-500 text-sm">Remove</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Payment Monitoring</h1>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Transaction ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Method</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-text">#TXN001</td>
                    <td className="px-6 py-4 text-sm text-text">KSh 2,500</td>
                    <td className="px-6 py-4 text-sm text-text">M-Pesa</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Completed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Reports & Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="font-semibold text-text mb-4">Active Users</h3>
                <p className="text-3xl font-bold text-primary">1,234</p>
                <p className="text-sm text-text-light">+12% from last month</p>
              </div>
              <div className="card p-6">
                <h3 className="font-semibold text-text mb-4">Popular Services</h3>
                <p className="text-text-light">1. Plumbing • 2. Electrical • 3. Barber</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Notifications</h1>
            <div className="card p-6">
              <h3 className="font-semibold text-text mb-4">Send Announcement</h3>
              <textarea className="w-full p-3 border border-gray-200 rounded-lg mb-4" rows={3} placeholder="Enter message..." />
              <button className="btn-primary">Send to All Users</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
