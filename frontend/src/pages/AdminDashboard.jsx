import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../services/adminService';

const adminMenu = [
  { key: 'overview', label: 'Overview', icon: '📊' },
  { key: 'users', label: 'Users', icon: '👥' },
  { key: 'providers', label: 'Providers', icon: '👷' },
  { key: 'categories', label: 'Categories', icon: '📂' },
  { key: 'requests', label: 'Requests', icon: '🧾' },
  { key: 'payments', label: 'Payments', icon: '💳' },
  { key: 'ratings', label: 'Ratings', icon: '⭐' },
  { key: 'notifications', label: 'Notifications', icon: '🔔' },
];

function formatCurrencyKES(amount) {
  try {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `KSh ${Math.round(amount || 0).toLocaleString('en-KE')}`;
  }
}

function StatusPill({ tone, children }) {
  const map = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
    amber: 'bg-amber-100 text-amber-800',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${map[tone] || map.gray}`}>{children}</span>
  );
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState('');

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState('');

  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [providersError, setProvidersError] = useState('');

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState('');

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState('');

  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentsError, setPaymentsError] = useState('');

  const [ratings, setRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [ratingsError, setRatingsError] = useState('');

  const [verifyBusyIds, setVerifyBusyIds] = useState(new Set());

  const [newCategory, setNewCategory] = useState({ name: '', icon: '', description: '' });
  const [createCategoryBusy, setCreateCategoryBusy] = useState(false);
  const [createCategoryError, setCreateCategoryError] = useState('');

  const shouldLoad = useMemo(
    () => ({
      overview: metrics === null,
      users: users.length === 0,
      providers: providers.length === 0,
      categories: categories.length === 0,
      requests: requests.length === 0,
      payments: payments.length === 0,
      ratings: ratings.length === 0,
    }),
    [metrics, users.length, providers.length, categories.length, requests.length, payments.length, ratings.length]
  );

  useEffect(() => {
    const load = async () => {
      if (activeTab === 'overview' && shouldLoad.overview) {
        setLoadingMetrics(true);
        setMetricsError('');
        try {
          const data = await adminService.getMetrics();
          setMetrics(data);
        } catch (e) {
          setMetricsError(e?.response?.data?.detail || 'Failed to load metrics');
        } finally {
          setLoadingMetrics(false);
        }
      }

      if (activeTab === 'users' && shouldLoad.users) {
        setLoadingUsers(true);
        setUsersError('');
        try {
          const data = await adminService.listUsers();
          setUsers(data);
        } catch (e) {
          setUsersError(e?.response?.data?.detail || 'Failed to load users');
        } finally {
          setLoadingUsers(false);
        }
      }

      if (activeTab === 'providers' && shouldLoad.providers) {
        setLoadingProviders(true);
        setProvidersError('');
        try {
          const data = await adminService.listProviders();
          setProviders(data);
        } catch (e) {
          setProvidersError(e?.response?.data?.detail || 'Failed to load providers');
        } finally {
          setLoadingProviders(false);
        }
      }

      if (activeTab === 'categories' && shouldLoad.categories) {
        setLoadingCategories(true);
        setCategoriesError('');
        try {
          const data = await adminService.listCategories();
          setCategories(data);
        } catch (e) {
          setCategoriesError(e?.response?.data?.detail || 'Failed to load categories');
        } finally {
          setLoadingCategories(false);
        }
      }

      if (activeTab === 'requests' && shouldLoad.requests) {
        setLoadingRequests(true);
        setRequestsError('');
        try {
          const data = await adminService.listRequests();
          setRequests(data);
        } catch (e) {
          setRequestsError(e?.response?.data?.detail || 'Failed to load requests');
        } finally {
          setLoadingRequests(false);
        }
      }

      if (activeTab === 'payments' && shouldLoad.payments) {
        setLoadingPayments(true);
        setPaymentsError('');
        try {
          const data = await adminService.listPayments();
          setPayments(data);
        } catch (e) {
          setPaymentsError(e?.response?.data?.detail || 'Failed to load payments');
        } finally {
          setLoadingPayments(false);
        }
      }

      if (activeTab === 'ratings' && shouldLoad.ratings) {
        setLoadingRatings(true);
        setRatingsError('');
        try {
          const data = await adminService.listRatings();
          setRatings(data);
        } catch (e) {
          setRatingsError(e?.response?.data?.detail || 'Failed to load ratings');
        } finally {
          setLoadingRatings(false);
        }
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleVerifyProvider = async (providerId, currentVerified) => {
    const nextVerified = !currentVerified;
    setVerifyBusyIds((prev) => new Set(prev).add(providerId));
    try {
      await adminService.verifyProvider(providerId, nextVerified);
      const data = await adminService.listProviders();
      setProviders(data);
    } catch (e) {
      alert(e?.response?.data?.detail || 'Failed to verify provider');
    } finally {
      setVerifyBusyIds((prev) => {
        const n = new Set(prev);
        n.delete(providerId);
        return n;
      });
    }
  };

  const handleCreateCategory = async () => {
    setCreateCategoryError('');
    if (!newCategory.name.trim()) {
      setCreateCategoryError('Category name is required');
      return;
    }
    setCreateCategoryBusy(true);
    try {
      await adminService.createCategory(newCategory);
      setNewCategory({ name: '', icon: '', description: '' });
      const data = await adminService.listCategories();
      setCategories(data);
    } catch (e) {
      setCreateCategoryError(e?.response?.data?.detail || 'Failed to create category');
    } finally {
      setCreateCategoryBusy(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Deactivate this category?')) return;
    try {
      await adminService.deactivateCategory(categoryId);
      const data = await adminService.listCategories();
      setCategories(data);
    } catch (e) {
      alert(e?.response?.data?.detail || 'Failed to delete category');
    }
  };

  const requestTone = (status) => {
    const s = (status || '').toLowerCase();
    if (['completed', 'confirmed'].includes(s)) return 'green';
    if (['pending'].includes(s)) return 'amber';
    if (['cancelled', 'disputed'].includes(s)) return 'red';
    return 'gray';
  };

  const paymentTone = (status) => {
    const s = (status || '').toLowerCase();
    if (['completed', 'paid'].includes(s)) return 'green';
    if (['pending'].includes(s)) return 'amber';
    if (['failed', 'refunded'].includes(s)) return 'red';
    return 'gray';
  };

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
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 ${
                activeTab === item.key ? 'bg-blue-50 text-primary border-r-4 border-primary' : 'text-text-light'
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
            {loadingMetrics && <p className="text-text-light">Loading metrics...</p>}
            {metricsError && <p className="text-red-500">{metricsError}</p>}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card p-6">
                  <p className="text-text-light text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-primary mt-2">{metrics.total_users}</p>
                </div>
                <div className="card p-6">
                  <p className="text-text-light text-sm">Active Providers</p>
                  <p className="text-3xl font-bold text-secondary mt-2">{metrics.active_providers}</p>
                </div>
                <div className="card p-6">
                  <p className="text-text-light text-sm">Revenue (Month)</p>
                  <p className="text-3xl font-bold text-accent mt-2">{formatCurrencyKES(metrics.month_revenue)}</p>
                </div>
                <div className="card p-6">
                  <p className="text-text-light text-sm">Pending Complaints</p>
                  <p className="text-3xl font-bold text-red-500 mt-2">{metrics.pending_requests}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">User Management</h1>
            {loadingUsers && <p className="text-text-light">Loading users...</p>}
            {usersError && <p className="text-red-500">{usersError}</p>}
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Verified</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 text-sm text-text">{u.full_name}</td>
                      <td className="px-6 py-4 text-sm text-text">{u.email}</td>
                      <td className="px-6 py-4"><StatusPill tone="blue">{u.role}</StatusPill></td>
                      <td className="px-6 py-4">
                        <StatusPill tone={u.is_verified ? 'green' : 'amber'}>{u.is_verified ? 'Verified' : 'Unverified'}</StatusPill>
                      </td>
                      <td className="px-6 py-4 text-sm text-text">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {users.length === 0 && !loadingUsers && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-text-light">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'providers' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Provider Management</h1>
            {loadingProviders && <p className="text-text-light">Loading providers...</p>}
            {providersError && <p className="text-red-500">{providersError}</p>}
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Rating</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Jobs</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {providers.map((p) => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 text-sm text-text">{p.full_name || `Provider #${p.id}`}</td>
                      <td className="px-6 py-4 text-sm text-text">{p.rating.toFixed(1)} ★</td>
                      <td className="px-6 py-4 text-sm text-text">{p.total_jobs}</td>
                      <td className="px-6 py-4">
                        <StatusPill tone={p.status === 'online' || p.status === 'active' ? 'green' : 'amber'}>{p.status}</StatusPill>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleVerifyProvider(p.id, p.status === 'online' || p.status === 'active')}
                          disabled={verifyBusyIds.has(p.id)}
                          className="text-primary text-sm disabled:opacity-50"
                        >
                          {verifyBusyIds.has(p.id) ? 'Saving...' : (p.status === 'online' || p.status === 'active' ? 'Suspend' : 'Verify')}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {providers.length === 0 && !loadingProviders && (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-text-light">No providers found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Service Categories</h1>
            {loadingCategories && <p className="text-text-light">Loading categories...</p>}
            {categoriesError && <p className="text-red-500">{categoriesError}</p>}
            <div className="card p-6">
              <div className="flex flex-wrap gap-3 mb-4">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="Icon (emoji)"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, icon: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-32"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm flex-1 min-w-[200px]"
                />
                <button
                  onClick={handleCreateCategory}
                  disabled={createCategoryBusy}
                  className="btn-primary disabled:opacity-50"
                >
                  {createCategoryBusy ? 'Creating...' : '+ Add Category'}
                </button>
              </div>
              {createCategoryError && <p className="text-red-500 text-sm mb-3">{createCategoryError}</p>}
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-text">{cat.icon || '📂'} {cat.name}</span>
                      {cat.description && <span className="text-text-light text-sm ml-2">— {cat.description}</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill tone={cat.is_active ? 'green' : 'red'}>{cat.is_active ? 'Active' : 'Inactive'}</StatusPill>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && !loadingCategories && (
                  <p className="text-text-light text-sm">No categories yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Service Requests</h1>
            {loadingRequests && <p className="text-text-light">Loading requests...</p>}
            {requestsError && <p className="text-red-500">{requestsError}</p>}
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Provider</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td className="px-6 py-4 text-sm text-text font-mono">#{r.id}</td>
                      <td className="px-6 py-4 text-sm text-text">{r.customer?.full_name || `User #${r.customer_id}`}</td>
                      <td className="px-6 py-4 text-sm text-text">{r.category?.name || `Cat #${r.category_id}`}</td>
                      <td className="px-6 py-4"><StatusPill tone={requestTone(r.status)}>{r.status}</StatusPill></td>
                      <td className="px-6 py-4 text-sm text-text">{r.provider?.full_name || '—'}</td>
                      <td className="px-6 py-4 text-sm text-text">{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {requests.length === 0 && !loadingRequests && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-text-light">No requests found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Payments</h1>
            {loadingPayments && <p className="text-text-light">Loading payments...</p>}
            {paymentsError && <p className="text-red-500">{paymentsError}</p>}
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Request</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Method</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Paid At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 text-sm text-text font-mono">#{p.id}</td>
                      <td className="px-6 py-4 text-sm text-text">#{p.request_id}</td>
                      <td className="px-6 py-4 text-sm text-text font-medium">{formatCurrencyKES(p.amount)}</td>
                      <td className="px-6 py-4 text-sm text-text">{p.payment_method || '—'}</td>
                      <td className="px-6 py-4"><StatusPill tone={paymentTone(p.status)}>{p.status}</StatusPill></td>
                      <td className="px-6 py-4 text-sm text-text">{p.paid_at ? new Date(p.paid_at).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                  {payments.length === 0 && !loadingPayments && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-text-light">No payments found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ratings' && (
          <div>
            <h1 className="text-2xl font-bold text-text mb-6">Ratings & Reviews</h1>
            {loadingRatings && <p className="text-text-light">Loading ratings...</p>}
            {ratingsError && <p className="text-red-500">{ratingsError}</p>}
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Provider</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Rating</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Comment</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-text-light">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {ratings.map((r) => (
                    <tr key={r.id}>
                      <td className="px-6 py-4 text-sm text-text font-mono">#{r.id}</td>
                      <td className="px-6 py-4 text-sm text-text">{r.customer?.full_name || `User #${r.customer_id}`}</td>
                      <td className="px-6 py-4 text-sm text-text">{r.provider?.full_name || `Provider #${r.provider_id}`}</td>
                      <td className="px-6 py-4 text-sm text-text">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                      <td className="px-6 py-4 text-sm text-text">{r.comment || '—'}</td>
                      <td className="px-6 py-4 text-sm text-text">{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {ratings.length === 0 && !loadingRatings && (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-text-light">No ratings found</td>
                    </tr>
                  )}
                </tbody>
              </table>
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
