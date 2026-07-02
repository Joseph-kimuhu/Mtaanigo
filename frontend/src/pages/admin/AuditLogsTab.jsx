import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { SectionHeader, SearchBar, Badge } from './shared';

const ACTION_COLOR = (action) => {
  if (action?.includes('delete') || action?.includes('suspend') || action?.includes('reject')) return 'red';
  if (action?.includes('create') || action?.includes('approve') || action?.includes('verify')) return 'green';
  if (action?.includes('update') || action?.includes('edit')) return 'blue';
  return 'gray';
};

const ACTION_ICON = (action) => {
  if (action?.includes('delete')) return '🗑️';
  if (action?.includes('create')) return '✅';
  if (action?.includes('suspend')) return '🚫';
  if (action?.includes('verify') || action?.includes('approve')) return '✔️';
  if (action?.includes('update') || action?.includes('edit')) return '✏️';
  if (action?.includes('login')) return '🔐';
  if (action?.includes('refund')) return '💰';
  return '📋';
};

export default function AuditLogsTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminService.listAuditLogs().then(setLogs).finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l =>
    !search ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.admin_name?.toLowerCase().includes(search.toLowerCase()) ||
    l.entity_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <SectionHeader
        title={`Audit Logs (${filtered.length})`}
        action={<SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search action, admin, entity…" />}
      />

      {loading ? (
        <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-10 text-center text-mute font-landing-sans text-sm">Loading logs…</div>
      ) : (
        <div className="rounded-2xl border border-ink/[0.06] bg-white divide-y divide-ink/[0.06]">
          {filtered.length === 0 && (
            <p className="px-5 py-10 text-center text-mute font-landing-sans text-sm">No audit logs found.</p>
          )}
          {filtered.map(log => (
            <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-sand-50 transition-colors">
              <span className="text-lg mt-0.5 shrink-0">{ACTION_ICON(log.action)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-landing-sans font-semibold text-[13px] text-ink/90">{log.admin_name || `Admin #${log.admin_id}`}</span>
                  <Badge label={log.action?.replace(/_/g, ' ')} color={ACTION_COLOR(log.action)} />
                  {log.entity_type && (
                    <span className="text-[11.5px] font-landing-sans text-mute">
                      on {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                    </span>
                  )}
                </div>
                {log.metadata && (
                  <p className="text-[12px] font-landing-sans text-mute truncate">{log.metadata}</p>
                )}
              </div>
              <span className="text-[11.5px] font-landing-sans text-mute whitespace-nowrap shrink-0">
                {log.created_at ? new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
