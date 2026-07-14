// ─── Fundi Dashboard Shared Primitives ───────────────────────────────────────

export function fmtKES(n) {
  return `KES ${Number(n || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
}

export function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

export function StatusPill({ status }) {
  const map = {
    pending:     'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    accepted:    'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    in_progress: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    completed:   'bg-forest-50 text-forest-700 ring-1 ring-forest-200',
    cancelled:   'bg-red-50 text-red-700 ring-1 ring-red-200',
    disputed:    'bg-red-50 text-red-700 ring-1 ring-red-200',
    approved:    'bg-forest-50 text-forest-700 ring-1 ring-forest-200',
    rejected:    'bg-red-50 text-red-700 ring-1 ring-red-200',
    paid:        'bg-forest-50 text-forest-700 ring-1 ring-forest-200',
  };
  const cls = map[(status || '').toLowerCase()] || 'bg-ink/[0.05] text-ink/55 ring-1 ring-ink/[0.08]';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold font-landing-sans capitalize ${cls}`}>
      {(status || '').replace('_', ' ')}
    </span>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-ink/[0.07] bg-white ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, sub }) {
  return (
    <div className="mb-5">
      <h2 className="font-landing-sans font-bold text-[17px] text-ink leading-tight">{children}</h2>
      {sub && <p className="text-[12.5px] text-mute font-landing-sans mt-0.5">{sub}</p>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-2 border-forest-200 border-t-forest-500 animate-spin" />
    </div>
  );
}

export function Empty({ icon = '📭', text = 'Nothing here yet.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-mute font-landing-sans text-sm">{text}</p>
    </div>
  );
}

export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', className = '' }) {
  const base = 'inline-flex items-center justify-center gap-2 font-landing-sans font-semibold rounded-xl transition-all duration-150 disabled:opacity-40 active:scale-[.98]';
  const sizes = { sm: 'text-[11.5px] px-3 py-1.5', md: 'text-[13px] px-4 py-2.5', lg: 'text-[14px] px-6 py-3' };
  const variants = {
    primary: 'bg-forest-500 hover:bg-forest-600 text-white',
    outline: 'border border-ink/[0.15] bg-white hover:bg-sand-100 text-ink/80',
    red:     'bg-red-500 hover:bg-red-600 text-white',
    yellow:  'bg-amber-400 hover:bg-amber-500 text-white',
    ghost:   'bg-ink/[0.05] hover:bg-ink/[0.1] text-ink/70',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Input({ label, error, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-[12px] font-landing-sans font-medium text-ink/70 mb-1.5">{label}</label>}
      <input
        className={`w-full border rounded-xl px-3.5 py-2.5 text-[13px] font-landing-sans text-ink focus:outline-none focus:ring-2 transition-colors ${error ? 'border-red-300 focus:ring-red-200' : 'border-ink/[0.12] focus:ring-forest-400/30 focus:border-forest-400'}`}
        {...props}
      />
      {error && <p className="text-[11.5px] text-red-600 font-landing-sans mt-1">{error}</p>}
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-[12px] font-landing-sans font-medium text-ink/70 mb-1.5">{label}</label>}
      <select className="w-full border border-ink/[0.12] rounded-xl px-3.5 py-2.5 text-[13px] font-landing-sans text-ink focus:outline-none focus:ring-2 focus:ring-forest-400/30 bg-white" {...props}>
        {children}
      </select>
    </div>
  );
}

export function Textarea({ label, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-[12px] font-landing-sans font-medium text-ink/70 mb-1.5">{label}</label>}
      <textarea rows={3} className="w-full border border-ink/[0.12] rounded-xl px-3.5 py-2.5 text-[13px] font-landing-sans text-ink focus:outline-none focus:ring-2 focus:ring-forest-400/30 resize-none" {...props} />
    </div>
  );
}

export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${widths[size]} p-6 relative max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-landing-sans font-bold text-[15px] text-ink">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-ink/[0.05] hover:bg-ink/[0.1] flex items-center justify-center text-mute">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Mini bar chart
export function MiniBarChart({ data, valueKey = 'amount', labelKey = 'day', color = '#1A7F4B' }) {
  const max = Math.max(...data.map(d => d[valueKey] || 0), 1);
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t-md transition-all duration-500" style={{ height: `${Math.max(4, (d[valueKey] / max) * 64)}px`, backgroundColor: i === data.length - 1 ? color : color + '55' }} />
          <span className="text-[9.5px] text-mute font-landing-sans">{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

// Star rating display
export function Stars({ n, size = 'sm' }) {
  const sz = size === 'sm' ? 'text-[13px]' : 'text-[18px]';
  return (
    <span className={`${sz} text-amber-400`}>
      {'★'.repeat(Math.round(n))}{'☆'.repeat(5 - Math.round(n))}
    </span>
  );
}

// Online/Offline dot
export function OnlineDot({ online }) {
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full ${online ? 'bg-forest-500 animate-pulse' : 'bg-ink/30'}`} />
  );
}
