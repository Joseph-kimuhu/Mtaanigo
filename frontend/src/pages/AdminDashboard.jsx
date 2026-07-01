import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';

const sidebarItems = [
  { key: 'overview', label: 'Dashboard', icon: 'M3 11l9-7 9 7M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9' },
  { key: 'users', label: 'Users', icon: 'M9 7a4 4 0 100-8 4 4 0 000 8zM5 21c1.2-3.6 4-5 7-5s5.8 1.4 7 5' },
  { key: 'providers', label: 'Service providers', icon: 'M14 4l6 6-9 9H5v-6l9-9z' },
  { key: 'companies', label: 'Companies', icon: 'M3 21V8l9-5 9 5v13M9 21v-6h6v6' },
  { key: 'bookings', label: 'Bookings', icon: 'M3 5h18M3 10h18M3 15h18M3 20h18' },
  { key: 'services', label: 'Services', icon: 'M12 17.3L6.2 21l1.6-6.9-5.3-4.6 7-.6L12 2.5l2.5 6.4 7 .6-5.3 4.6L17.8 21z' },
  { key: 'categories', label: 'Categories', icon: 'M5 12h14M12 5l7 7-7 7' },
  { key: 'earnings', label: 'Earnings', icon: 'M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-1M21 12H13a2 2 0 100 4h8' },
  { key: 'commissions', label: 'Commissions', icon: 'M21 11.5a8.4 8.4 0 01-9 8.4A8.5 8.5 0 014 13a8.4 8.4 0 018.4-8.4 8.5 8.5 0 018.6 6.9z' },
  { key: 'reviews', label: 'Reviews', icon: 'M12 17.3L6.2 21l1.6-6.9-5.3-4.6 7-.6L12 2.5l2.5 6.4 7 .6-5.3 4.6L17.8 21z' },
  { key: 'disputes', label: 'Disputes', icon: 'M12 8v4l3 2' },
  { key: 'coupons', label: 'Coupons', icon: 'M20 12a8 8 0 11-3-6.2M20 4v5h-5' },
  { key: 'announcements', label: 'Announcements', icon: 'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9' },
  { key: 'reports', label: 'Reports', icon: 'M9 17v-6a3 3 0 016 0v6M5 21h14a2 2 0 002-2v-2H3v2a2 2 0 002 2z' },
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

function StatusDot({ color }) {
  return <span className="status-dot" style={{ backgroundColor: color }} />;
}

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  const loadData = async (key) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
    try {
      switch (key) {
        case 'overview':
          setMetrics(await adminService.getMetrics());
          break;
        case 'users':
          setUsers(await adminService.listUsers());
          break;
        case 'providers':
          setProviders(await adminService.listProviders());
          break;
        case 'bookings':
        case 'reports':
          setRequests(await adminService.listRequests());
          break;
        case 'categories':
          setCategories(await adminService.listCategories());
          break;
        case 'reviews':
          setRatings(await adminService.listRatings());
          break;
        case 'earnings':
        case 'commissions':
          setPayments(await adminService.listPayments());
          break;
        default:
          break;
      }
    } catch (e) {
      setErrors((prev) => ({ ...prev, [key]: e?.response?.data?.detail || 'Failed to load' }));
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  useEffect(() => {
    loadData(activeNav);
  }, [activeNav]);

  const requestTone = (status) => {
    const s = (status || '').toLowerCase();
    if (['completed', 'confirmed'].includes(s)) return 'var(--green)';
    if (['pending'].includes(s)) return 'var(--ochre)';
    if (['cancelled', 'disputed'].includes(s)) return 'var(--red)';
    return '#6b6b64';
  };

  const titleMap = {
    overview: 'Dashboard overview',
    users: 'User Management',
    providers: 'Service Providers',
    companies: 'Companies',
    bookings: 'Bookings',
    services: 'Services',
    categories: 'Service Categories',
    earnings: 'Earnings',
    commissions: 'Commissions',
    reviews: 'Reviews & Ratings',
    disputes: 'Disputes',
    coupons: 'Coupons',
    announcements: 'Announcements',
    reports: 'Reports',
  };

  const renderContent = () => {
    const title = titleMap[activeNav] || 'Dashboard';

    if (activeNav === 'overview') {
      return (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-9 fade-up delay-2">
            <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-4">
              <p className="text-[12px] text-mute mb-1.5 font-landing-sans">Total users</p>
              <p className="font-landing-display text-[22px] font-semibold text-ink">
                {loading.overview ? '…' : metrics?.total_users?.toLocaleString() || '—'}
              </p>
            </div>
            <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-4">
              <p className="text-[12px] text-mute mb-1.5 font-landing-sans">Total providers</p>
              <p className="font-landing-display text-[22px] font-semibold text-ink">
                {loading.overview ? '…' : metrics?.total_providers?.toLocaleString() || '—'}
              </p>
            </div>
            <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-4">
              <p className="text-[12px] text-mute mb-1.5 font-landing-sans">Total bookings</p>
              <p className="font-landing-display text-[22px] font-semibold text-ink">
                {loading.overview ? '…' : metrics?.total_bookings?.toLocaleString() || '—'}
              </p>
            </div>
            <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-4">
              <p className="text-[12px] text-mute mb-1.5 font-landing-sans">Total revenue</p>
              <p className="font-landing-display text-[22px] font-semibold text-ink">
                {loading.overview ? '…' : formatCurrencyKES(metrics?.total_revenue) || '—'}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-9">
            <div className="lg:col-span-2 rounded-2xl border border-ink/[0.06] bg-white px-5 py-5 fade-up delay-3">
              <p className="text-[13px] font-landing-sans font-semibold text-ink/80 mb-4">Bookings overview</p>
              <svg viewBox="0 0 560 140" className="w-full h-36">
                <line x1="0" y1="35" x2="560" y2="35" stroke="#16241D" strokeOpacity="0.06" />
                <line x1="0" y1="70" x2="560" y2="70" stroke="#16241D" strokeOpacity="0.06" />
                <line x1="0" y1="105" x2="560" y2="105" stroke="#16241D" strokeOpacity="0.06" />
                <polyline points="0,110 70,100 140,95 210,75 280,80 350,55 420,60 490,30 560,38" fill="none" stroke="#1A7F4B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <polygon points="0,110 70,100 140,95 210,75 280,80 350,55 420,60 490,30 560,38 560,140 0,140" fill="#1A7F4B" fillOpacity="0.08" />
              </svg>
            </div>
            <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-5 fade-up delay-3">
              <p className="text-[13px] font-landing-sans font-semibold text-ink/80 mb-4">Bookings by status</p>
              <div className="flex items-center justify-center mb-4">
                <svg viewBox="0 0 120 120" width="120" height="120">
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#CFEBD9" strokeWidth="16" />
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#1A7F4B" strokeWidth="16" strokeDasharray="173.5 289" strokeDashoffset="0" strokeLinecap="round" transform="rotate(-90 60 60)" />
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#D97A3D" strokeWidth="16" strokeDasharray="72.3 289" strokeDashoffset="-173.5" strokeLinecap="round" transform="rotate(-90 60 60)" />
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#E24B4A" strokeWidth="16" strokeDasharray="28.9 289" strokeDashoffset="-245.8" strokeLinecap="round" transform="rotate(-90 60 60)" />
                </svg>
              </div>
              <div className="space-y-2 text-[12.5px]">
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><StatusDot color="var(--green)" />Completed</span><span className="font-semibold text-ink/70">60%</span></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><StatusDot color="var(--ochre)" />Pending</span><span className="font-semibold text-ink/70">25%</span></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><StatusDot color="#E24B4A" />Cancelled</span><span className="font-semibold text-ink/70">10%</span></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><StatusDot color="rgba(15,30,23,0.3)" />Others</span><span className="font-semibold text-ink/70">5%</span></div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-9">
            <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-5 fade-up delay-4">
              <p className="text-[13px] font-landing-sans font-semibold text-ink/80 mb-4">Revenue overview</p>
              <svg viewBox="0 0 240 120" className="w-full h-28">
                <rect x="6" y="60" width="20" height="60" rx="3" fill="#CFEBD9" />
                <rect x="36" y="45" width="20" height="75" rx="3" fill="#CFEBD9" />
                <rect x="66" y="30" width="20" height="90" rx="3" fill="#1A7F4B" />
                <rect x="96" y="50" width="20" height="70" rx="3" fill="#CFEBD9" />
                <rect x="126" y="20" width="20" height="100" rx="3" fill="#1A7F4B" />
                <rect x="156" y="40" width="20" height="80" rx="3" fill="#CFEBD9" />
                <rect x="186" y="10" width="20" height="110" rx="3" fill="#1A7F4B" />
                <rect x="216" y="35" width="20" height="85" rx="3" fill="#CFEBD9" />
              </svg>
            </div>
            <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-5 fade-up delay-4">
              <p className="text-[13px] font-landing-sans font-semibold text-ink/80 mb-4">Top services</p>
              <div className="space-y-3.5">
                {[
                  { name: 'Cleaning', pct: 90, bookings: '2,450' },
                  { name: 'Plumbing', pct: 70, bookings: '1,890' },
                  { name: 'Electrical', pct: 54, bookings: '1,456' },
                  { name: 'Car repair', pct: 46, bookings: '1,223' },
                  { name: 'Carpentry', pct: 38, bookings: '995' },
                ].map((s) => (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-[12.5px] font-landing-sans mb-1.5">
                      <span className="font-medium text-ink/80">{s.name}</span>
                      <span className="text-mute">{s.bookings} bookings</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-forest-50"><div className="h-1.5 rounded-full bg-forest-500" style={{ width: `${s.pct}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl bg-forest-900 text-white px-5 py-5 fade-up delay-4 flex flex-col justify-between">
              <div>
                <p className="text-[13px] font-landing-sans font-semibold text-white/80 mb-1">Avg. booking value</p>
                <p className="font-landing-display text-[26px] font-semibold mb-3">KSh 1,920</p>
                <p className="text-[12px] text-white/60 font-landing-sans leading-relaxed">Across all categories this month, up from KSh 1,740 in April.</p>
              </div>
              <button className="mt-5 rounded-full bg-forest-500 hover:bg-forest-400 transition-colors text-white text-[12.5px] font-landing-sans font-semibold px-4 py-2.5 w-fit">View full report</button>
            </div>
          </div>

          <AdminTable title="Recent bookings" headers={['Customer', 'Service', 'Provider', 'Date', 'Status', 'Amount']} data={requests.slice(0, 10)} loading={loading.bookings} emptyText="No bookings found." renderRow={(r) => (
            <>
              <td className="px-5 py-3.5 flex items-center gap-2.5"><span className="w-7 h-7 rounded-full bg-forest-100 inline-block" /><span className="font-landing-sans text-ink/90">{r.customer?.full_name || `User #${r.customer_id}`}</span></td>
              <td className="px-5 py-3.5 font-landing-sans text-ink/90">{r.category?.name || '—'}</td>
              <td className="px-5 py-3.5 font-landing-sans text-ink/90">{r.provider?.full_name || '—'}</td>
              <td className="px-5 py-3.5 text-mute font-landing-sans">{r.created_at ? new Date(r.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—'}</td>
              <td className="px-5 py-3.5"><span className="inline-flex items-center gap-1.5 font-landing-sans font-semibold" style={{ color: requestTone(r.status) }}><StatusDot color={requestTone(r.status)} />{r.status}</span></td>
              <td className="px-5 py-3.5 text-right font-landing-sans font-medium text-ink/90">{r.final_price ? formatCurrencyKES(r.final_price) : r.price_offered ? formatCurrencyKES(r.price_offered) : '—'}</td>
            </>
          )} />
        </>
      );
    }

    if (activeNav === 'users') {
      return (
        <div className="rounded-2xl border border-ink/[0.06] bg-white overflow-x-auto fade-up delay-2">
          {loading.users && <div className="px-5 py-8 text-center text-mute">Loading users…</div>}
          {errors.users && <div className="px-5 py-4 text-red-600 text-sm">{errors.users}</div>}
          {!loading.users && (
            <table className="w-full text-[13px]">
              <thead><tr className="text-left text-mute border-b border-ink/[0.06]">
                <th className="font-landing-sans font-medium px-5 py-3">Name</th>
                <th className="font-landing-sans font-medium px-5 py-3">Email</th>
                <th className="font-landing-sans font-medium px-5 py-3">Role</th>
                <th className="font-landing-sans font-medium px-5 py-3">Verified</th>
                <th className="font-landing-sans font-medium px-5 py-3">Joined</th>
              </tr></thead>
              <tbody className="divide-y divide-ink/[0.06]">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-4 font-landing-sans text-ink/90">{u.full_name}</td>
                    <td className="px-5 py-4 font-landing-sans text-ink/90">{u.email}</td>
                    <td className="px-5 py-4"><span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">{u.role}</span></td>
                    <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${u.is_verified ? 'text-forest-600' : 'text-clay-600'}`}><StatusDot color={u.is_verified ? 'var(--green)' : 'var(--ochre)'} />{u.is_verified ? 'Verified' : 'Unverified'}</span></td>
                    <td className="px-5 py-4 font-landing-sans text-ink/90">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan="5" className="px-5 py-8 text-center text-mute">No users found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      );
    }

    if (activeNav === 'providers') {
      return (
        <div className="rounded-2xl border border-ink/[0.06] bg-white overflow-x-auto fade-up delay-2">
          {loading.providers && <div className="px-5 py-8 text-center text-mute">Loading providers…</div>}
          {errors.providers && <div className="px-5 py-4 text-red-600 text-sm">{errors.providers}</div>}
          {!loading.providers && (
            <table className="w-full text-[13px]">
              <thead><tr className="text-left text-mute border-b border-ink/[0.06]">
                <th className="font-landing-sans font-medium px-5 py-3">Name</th>
                <th className="font-landing-sans font-medium px-5 py-3">Rating</th>
                <th className="font-landing-sans font-medium px-5 py-3">Jobs</th>
                <th className="font-landing-sans font-medium px-5 py-3">Status</th>
                <th className="font-landing-sans font-medium px-5 py-3">Address</th>
              </tr></thead>
              <tbody className="divide-y divide-ink/[0.06]">
                {providers.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-4 font-landing-sans font-semibold text-ink/90">{p.full_name || `Provider #${p.id}`}</td>
                    <td className="px-5 py-4 font-landing-sans text-ink/90">⭐ {p.rating?.toFixed(1) || '—'}</td>
                    <td className="px-5 py-4 font-landing-sans text-ink/90">{p.total_jobs || 0}</td>
                    <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${p.status === 'online' ? 'text-forest-600' : 'text-clay-600'}`}><StatusDot color={p.status === 'online' ? 'var(--green)' : 'var(--ochre)'} />{p.status}</span></td>
                    <td className="px-5 py-4 font-landing-sans text-ink/90">{p.address || '—'}</td>
                  </tr>
                ))}
                {providers.length === 0 && <tr><td colSpan="5" className="px-5 py-8 text-center text-mute">No providers found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      );
    }

    if (activeNav === 'categories') {
      return (
        <div className="rounded-2xl border border-ink/[0.06] bg-white p-6 fade-up delay-2">
          {loading.categories && <div className="text-mute">Loading categories…</div>}
          {errors.categories && <div className="text-red-600 text-sm mb-3">{errors.categories}</div>}
          {!loading.categories && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="rounded-xl border border-ink/[0.06] p-4 flex items-center gap-3">
                  <span className="text-2xl">{cat.icon || '📂'}</span>
                  <div>
                    <p className="font-landing-sans font-semibold text-ink/90 text-sm">{cat.name}</p>
                    <p className={`text-xs font-landing-sans ${cat.is_active ? 'text-forest-600' : 'text-clay-600'}`}>{cat.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              ))}
              {categories.length === 0 && <p className="text-mute text-sm col-span-4 text-center py-8">No categories yet.</p>}
            </div>
          )}
        </div>
      );
    }

    if (activeNav === 'reviews') {
      return (
        <div className="rounded-2xl border border-ink/[0.06] bg-white overflow-x-auto fade-up delay-2">
          {loading.reviews && <div className="px-5 py-8 text-center text-mute">Loading reviews…</div>}
          {errors.reviews && <div className="px-5 py-4 text-red-600 text-sm">{errors.reviews}</div>}
          {!loading.reviews && (
            <table className="w-full text-[13px]">
              <thead><tr className="text-left text-mute border-b border-ink/[0.06]">
                <th className="font-landing-sans font-medium px-5 py-3">Customer</th>
                <th className="font-landing-sans font-medium px-5 py-3">Provider</th>
                <th className="font-landing-sans font-medium px-5 py-3">Rating</th>
                <th className="font-landing-sans font-medium px-5 py-3">Comment</th>
                <th className="font-landing-sans font-medium px-5 py-3">Date</th>
              </tr></thead>
              <tbody className="divide-y divide-ink/[0.06]">
                {ratings.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-4 font-landing-sans text-ink/90">{r.customer_name || `User #${r.customer_id}`}</td>
                    <td className="px-5 py-4 font-landing-sans text-ink/90">{r.provider_name || `Provider #${r.provider_id}`}</td>
                    <td className="px-5 py-4 font-landing-sans text-ink/90">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                    <td className="px-5 py-4 font-landing-sans text-ink/90">{r.comment || '—'}</td>
                    <td className="px-5 py-4 font-landing-sans text-ink/90">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {ratings.length === 0 && <tr><td colSpan="5" className="px-5 py-8 text-center text-mute">No ratings found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      );
    }

    if (activeNav === 'earnings' || activeNav === 'commissions') {
      return (
        <div className="rounded-2xl border border-ink/[0.06] bg-white overflow-x-auto fade-up delay-2">
          {loading[activeNav] && <div className="px-5 py-8 text-center text-mute">Loading payments…</div>}
          {errors[activeNav] && <div className="px-5 py-4 text-red-600 text-sm">{errors[activeNav]}</div>}
          {!loading[activeNav] && (
            <table className="w-full text-[13px]">
              <thead><tr className="text-left text-mute border-b border-ink/[0.06]">
                <th className="font-landing-sans font-medium px-5 py-3">ID</th>
                <th className="font-landing-sans font-medium px-5 py-3">Request</th>
                <th className="font-landing-sans font-medium px-5 py-3">Amount</th>
                <th className="font-landing-sans font-medium px-5 py-3">Method</th>
                <th className="font-landing-sans font-medium px-5 py-3">Status</th>
                <th className="font-landing-sans font-medium px-5 py-3">Paid At</th>
              </tr></thead>
              <tbody className="divide-y divide-ink/[0.06]">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-4 font-landing-sans font-mono text-ink/90">#{p.id}</td>
                    <td className="px-5 py-4 font-landing-sans text-ink/90">#{p.request_id}</td>
                    <td className="px-5 py-4 font-landing-sans font-medium text-ink/90">{formatCurrencyKES(p.amount)}</td>
                    <td className="px-5 py-4 font-landing-sans text-ink/90">{p.payment_method || '—'}</td>
                    <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${p.status === 'completed' ? 'text-forest-600' : p.status === 'pending' ? 'text-clay-600' : 'text-red-600'}`}><StatusDot color={p.status === 'completed' ? 'var(--green)' : p.status === 'pending' ? 'var(--ochre)' : 'var(--red)'} />{p.status}</span></td>
                    <td className="px-5 py-4 font-landing-sans text-ink/90">{p.paid_at ? new Date(p.paid_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
                {payments.length === 0 && <tr><td colSpan="6" className="px-5 py-8 text-center text-mute">No payments found</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-12 text-center fade-up delay-2">
        <p className="text-mute font-landing-sans text-sm mb-2">{title}</p>
        <p className="text-ink/60 font-landing-sans text-xs">This section is being built. Check back soon.</p>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-sand-50 text-ink font-sans antialiased">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-[228px] shrink-0 flex-col border-r border-ink/[0.06] bg-white px-4 py-6 overflow-y-auto">
        <Link to="/" className="flex items-center gap-2 font-landing-display text-[18px] font-semibold tracking-tight px-2 mb-7 text-ink">
          <span className="w-7 h-7 rounded-lg bg-forest-500 text-white flex items-center justify-center text-[12px] font-landing-sans font-bold">M</span>
          Mtaani<span className="text-forest-500">Go</span>
        </Link>

        <nav className="flex flex-col gap-0.5 text-[13.5px] font-landing-sans">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                activeNav === item.key ? 'bg-forest-50 text-forest-700 font-semibold' : 'text-ink/65 hover:bg-sand-100'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={item.icon} /></svg>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 px-6 md:px-10 py-7 max-w-[1300px]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-7 fade-up delay-1">
          <div>
            <h1 className="font-landing-display text-[24px] font-medium text-ink">{titleMap[activeNav] || 'Dashboard'}</h1>
            <p className="text-mute text-[13.5px] mt-1 font-landing-sans">Platform management at a glance.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-forest-100 border border-forest-200" />
          </div>
        </div>

        {activeNav === 'overview' && renderContent()}
        {activeNav !== 'overview' && renderContent()}
      </main>
    </div>
  );
}

function AdminTable({ title, headers, data, loading, emptyText, renderRow }) {
  return (
    <div className="fade-up delay-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80">{title}</h2>
      </div>
      <div className="rounded-2xl border border-ink/[0.06] bg-white overflow-x-auto">
        {loading ? (
          <div className="px-5 py-8 text-center text-mute text-sm font-landing-sans">Loading…</div>
        ) : data.length === 0 ? (
          <div className="px-5 py-8 text-center text-mute text-sm font-landing-sans">{emptyText}</div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-mute border-b border-ink/[0.06]">
                {headers.map((h) => <th key={h} className="font-landing-sans font-medium px-5 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.06]">
              {data.map((r, i) => <tr key={r.id || i}>{renderRow(r)}</tr>)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
