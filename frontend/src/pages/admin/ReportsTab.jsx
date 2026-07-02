import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { SectionHeader, Table, Badge, fmtKES } from './shared';

const REPORT_TYPES = [
  { key: 'daily-revenue', label: 'Daily Revenue' },
  { key: 'monthly-revenue', label: 'Monthly Revenue' },
  { key: 'top-providers', label: 'Top Providers' },
  { key: 'worst-providers', label: 'Worst Providers' },
  { key: 'most-booked-services', label: 'Most Booked Services' },
  { key: 'inactive-users', label: 'Inactive Users' },
  { key: 'cancelled-bookings', label: 'Cancelled Bookings' },
  { key: 'disputes', label: 'Disputes' },
  { key: 'customer-growth', label: 'Customer Growth' },
  { key: 'provider-growth', label: 'Provider Growth' },
];

function exportCSV(data, name) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const rows = [keys.join(','), ...data.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${name}.csv`;
  a.click();
}

function exportJSON(data, name) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${name}.json`;
  a.click();
}

function ReportTable({ data, type }) {
  if (!data.length) return <p className="text-mute font-landing-sans text-sm py-8 text-center">No data available.</p>;

  if (type === 'daily-revenue' || type === 'monthly-revenue') {
    const key = type === 'daily-revenue' ? 'day' : 'month';
    return (
      <Table headers={[key === 'day' ? 'Date' : 'Month', 'Revenue']} empty={null}>
        {data.map((r, i) => (
          <tr key={i} className="hover:bg-sand-50">
            <td className="px-5 py-3 font-landing-sans text-ink/80">{r[key]}</td>
            <td className="px-5 py-3 font-landing-sans font-medium text-forest-600">{fmtKES(r.revenue)}</td>
          </tr>
        ))}
      </Table>
    );
  }
  if (type === 'top-providers' || type === 'worst-providers') {
    return (
      <Table headers={['Provider', 'Rating', 'Jobs']} empty={null}>
        {data.map((r, i) => (
          <tr key={i} className="hover:bg-sand-50">
            <td className="px-5 py-3 font-landing-sans text-ink/90">{r.name}</td>
            <td className="px-5 py-3 font-landing-sans text-ink/80">⭐ {r.rating?.toFixed(1)}</td>
            <td className="px-5 py-3 font-landing-sans text-mute">{r.jobs}</td>
          </tr>
        ))}
      </Table>
    );
  }
  if (type === 'most-booked-services') {
    return (
      <Table headers={['Service', 'Bookings']} empty={null}>
        {data.map((r, i) => (
          <tr key={i} className="hover:bg-sand-50">
            <td className="px-5 py-3 font-landing-sans text-ink/90">{r.name}</td>
            <td className="px-5 py-3 font-landing-sans font-medium text-forest-600">{r.bookings}</td>
          </tr>
        ))}
      </Table>
    );
  }
  if (type === 'inactive-users') {
    return (
      <Table headers={['Name', 'Email', 'Role']} empty={null}>
        {data.map((r, i) => (
          <tr key={i} className="hover:bg-sand-50">
            <td className="px-5 py-3 font-landing-sans text-ink/90">{r.name}</td>
            <td className="px-5 py-3 font-landing-sans text-mute">{r.email}</td>
            <td className="px-5 py-3"><Badge label={r.role} color="gray" /></td>
          </tr>
        ))}
      </Table>
    );
  }
  if (type === 'customer-growth' || type === 'provider-growth') {
    return (
      <Table headers={['Month', 'New Registrations']} empty={null}>
        {data.map((r, i) => (
          <tr key={i} className="hover:bg-sand-50">
            <td className="px-5 py-3 font-landing-sans text-ink/80">{r.month}</td>
            <td className="px-5 py-3 font-landing-sans font-medium text-forest-600">{r.count}</td>
          </tr>
        ))}
      </Table>
    );
  }
  // Generic fallback
  const keys = Object.keys(data[0]);
  return (
    <Table headers={keys} empty={null}>
      {data.map((r, i) => (
        <tr key={i} className="hover:bg-sand-50">
          {keys.map(k => <td key={k} className="px-5 py-3 font-landing-sans text-ink/80">{String(r[k] ?? '—')}</td>)}
        </tr>
      ))}
    </Table>
  );
}

export default function ReportsTab() {
  const [activeReport, setActiveReport] = useState('daily-revenue');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setData([]);
    adminService.getReport(activeReport)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [activeReport]);

  return (
    <div className="space-y-5">
      <SectionHeader title="Reports" />

      <div className="flex gap-2 flex-wrap">
        {REPORT_TYPES.map(r => (
          <button
            key={r.key}
            onClick={() => setActiveReport(r.key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-landing-sans font-medium transition-colors ${activeReport === r.key ? 'bg-forest-500 text-white' : 'bg-white border border-ink/[0.1] text-ink/60 hover:bg-sand-100'}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="font-landing-sans font-semibold text-[14px] text-ink">
          {REPORT_TYPES.find(r => r.key === activeReport)?.label}
        </p>
        <div className="flex gap-1.5">
          <button onClick={() => exportCSV(data, activeReport)} className="text-[11.5px] font-landing-sans font-semibold px-3 py-1.5 rounded-lg bg-ink/[0.06] text-ink/70 hover:bg-ink/[0.1] transition-colors">CSV</button>
          <button onClick={() => exportJSON(data, activeReport)} className="text-[11.5px] font-landing-sans font-semibold px-3 py-1.5 rounded-lg bg-ink/[0.06] text-ink/70 hover:bg-ink/[0.1] transition-colors">JSON</button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-10 text-center text-mute font-landing-sans text-sm">Loading report…</div>
      ) : (
        <ReportTable data={data} type={activeReport} />
      )}
    </div>
  );
}
