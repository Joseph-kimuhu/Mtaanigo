import { useEffect, useRef, useState } from 'react';

// ─── Formatters ───────────────────────────────────────────────────────────────
export function fmtKES(amount) {
  try {
    return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(amount || 0);
  } catch {
    return `KSh ${Math.round(amount || 0).toLocaleString()}`;
  }
}

// ─── Animated count-up hook ───────────────────────────────────────────────────
function useCountUp(target, duration = 900) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const num = parseFloat(String(target).replace(/[^0-9.]/g, ''));
    if (isNaN(num)) { setDisplay(target); return; }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(ease * num));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return display;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ w = 'w-full', h = 'h-4', className = '' }) {
  return <div className={`skeleton ${w} ${h} ${className}`} />;
}

// ─── StatusDot ────────────────────────────────────────────────────────────────
export function StatusDot({ color, pulse }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${pulse ? 'pulse-dot' : ''}`}
      style={{ backgroundColor: color }}
    />
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ label, color = 'gray' }) {
  const map = {
    green:  'bg-forest-50 text-forest-700 ring-1 ring-forest-200/60',
    red:    'bg-red-50 text-red-700 ring-1 ring-red-200/60',
    yellow: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
    blue:   'bg-blue-50 text-blue-700 ring-1 ring-blue-200/60',
    gray:   'bg-ink/[0.05] text-ink/55 ring-1 ring-ink/[0.08]',
    purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200/60',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold font-landing-sans ${map[color] || map.gray}`}>
      {label}
    </span>
  );
}

// ─── Status helpers ───────────────────────────────────────────────────────────
export function statusColor(s) {
  const v = (s || '').toLowerCase();
  if (['completed','verified','approved','active','online','resolved','paid'].includes(v)) return '#1A7F4B';
  if (['pending','investigating','offline'].includes(v)) return '#D97A3D';
  if (['cancelled','disputed','suspended','rejected','refunded','open'].includes(v)) return '#E24B4A';
  return '#6b6b64';
}

export function statusBadgeColor(s) {
  const v = (s || '').toLowerCase();
  if (['completed','verified','approved','active','online','resolved','paid'].includes(v)) return 'green';
  if (['pending','investigating','offline'].includes(v)) return 'yellow';
  if (['cancelled','disputed','suspended','rejected','refunded','open'].includes(v)) return 'red';
  return 'gray';
}

// ─── StatCard with count-up animation ────────────────────────────────────────
export function StatCard({ label, value, sub, accent, icon, trend, loading }) {
  const raw = String(value || '0').replace(/[^0-9.]/g, '');
  const isNum = !isNaN(parseFloat(raw)) && raw !== '';
  const counted = useCountUp(isNum ? parseFloat(raw) : 0);

  const displayVal = loading
    ? null
    : isNum
      ? (value?.toString().includes('KES') || value?.toString().includes('KSh')
          ? fmtKES(counted)
          : counted.toLocaleString())
      : value;

  return (
    <div className={`relative rounded-2xl border px-5 py-4 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
      accent
        ? 'bg-forest-900 border-forest-700 text-white'
        : 'bg-white border-ink/[0.06]'
    }`}>
      {/* Background decoration */}
      {!accent && (
        <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full opacity-[0.04] bg-forest-500" />
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-[11.5px] mb-2 font-landing-sans font-medium uppercase tracking-wide ${accent ? 'text-white/50' : 'text-mute'}`}>
            {label}
          </p>
          {loading ? (
            <Skeleton h="h-7" w="w-24" />
          ) : (
            <p className={`font-landing-display text-[24px] font-semibold leading-none count-up ${accent ? 'text-white' : 'text-ink'}`}>
              {displayVal}
            </p>
          )}
          {sub && !loading && (
            <p className={`text-[11px] mt-1.5 font-landing-sans ${accent ? 'text-white/40' : 'text-mute'}`}>{sub}</p>
          )}
        </div>
        {icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent ? 'bg-white/10' : 'bg-forest-50'}`}>
            <span className={`text-[16px] ${accent ? 'text-white/70' : 'text-forest-600'}`}>{icon}</span>
          </div>
        )}
      </div>
      {trend !== undefined && !loading && (
        <div className={`flex items-center gap-1 mt-2.5 text-[11px] font-landing-sans font-semibold ${trend >= 0 ? 'text-forest-600' : 'text-red-500'}`}>
          <span>{trend >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend)}% vs last month</span>
        </div>
      )}
    </div>
  );
}

// ─── Table with skeleton rows ─────────────────────────────────────────────────
export function Table({ headers, children, loading, empty, skeletonRows = 5 }) {
  return (
    <div className="rounded-2xl border border-ink/[0.06] bg-white overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left border-b border-ink/[0.06] bg-sand-50/60">
            {headers.map((h) => (
              <th key={h} className="font-landing-sans font-semibold text-ink/50 text-[11.5px] uppercase tracking-wide px-5 py-3 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/[0.04]">
          {loading
            ? Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i}>
                  {headers.map((h) => (
                    <td key={h} className="px-5 py-3.5">
                      <Skeleton h="h-3.5" w={h === headers[0] ? 'w-32' : 'w-20'} />
                    </td>
                  ))}
                </tr>
              ))
            : children
          }
        </tbody>
      </table>
      {!loading && empty && (
        <div className="px-5 py-12 text-center">
          <p className="text-mute text-sm font-landing-sans">{empty}</p>
        </div>
      )}
    </div>
  );
}

// ─── ActionBtn ────────────────────────────────────────────────────────────────
export function ActionBtn({ onClick, label, variant = 'default', disabled, icon }) {
  const base = 'inline-flex items-center gap-1.5 text-[11.5px] font-landing-sans font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 disabled:opacity-40 active:scale-95';
  const variants = {
    default: 'bg-ink/[0.05] text-ink/65 hover:bg-ink/[0.1]',
    green:   'bg-forest-50 text-forest-700 hover:bg-forest-100',
    red:     'bg-red-50 text-red-700 hover:bg-red-100',
    blue:    'bg-blue-50 text-blue-700 hover:bg-blue-100',
    yellow:  'bg-amber-50 text-amber-700 hover:bg-amber-100',
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant] || variants.default}`}>
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ title, action, sub }) {
  return (
    <div className="flex items-start justify-between mb-5 gap-4">
      <div>
        <h2 className="font-landing-sans font-semibold text-[15px] text-ink">{title}</h2>
        {sub && <p className="text-[12px] text-mute font-landing-sans mt-0.5">{sub}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${widths[size] || widths.md} p-6 relative pop-in max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-landing-sans font-semibold text-[15px] text-ink">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-ink/[0.05] hover:bg-ink/[0.1] flex items-center justify-center text-mute hover:text-ink transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-[12px] font-landing-sans font-medium text-ink/70 mb-1.5">{label}</label>}
      <input
        className={`w-full border rounded-xl px-3.5 py-2.5 text-[13px] font-landing-sans text-ink focus:outline-none focus:ring-2 transition-colors ${
          error
            ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
            : 'border-ink/[0.12] focus:ring-forest-400/30 focus:border-forest-400'
        }`}
        {...props}
      />
      {error && <p className="text-[11.5px] text-red-600 font-landing-sans mt-1">{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, children, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-[12px] font-landing-sans font-medium text-ink/70 mb-1.5">{label}</label>}
      <select
        className="w-full border border-ink/[0.12] rounded-xl px-3.5 py-2.5 text-[13px] font-landing-sans text-ink focus:outline-none focus:ring-2 focus:ring-forest-400/30 focus:border-forest-400 bg-white transition-colors"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ label, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-[12px] font-landing-sans font-medium text-ink/70 mb-1.5">{label}</label>}
      <textarea
        rows={3}
        className="w-full border border-ink/[0.12] rounded-xl px-3.5 py-2.5 text-[13px] font-landing-sans text-ink focus:outline-none focus:ring-2 focus:ring-forest-400/30 focus:border-forest-400 resize-none transition-colors"
        {...props}
      />
    </div>
  );
}

// ─── PrimaryBtn ───────────────────────────────────────────────────────────────
export function PrimaryBtn({ children, onClick, type = 'button', disabled, className = '', loading: isLoading }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 bg-forest-500 hover:bg-forest-600 active:bg-forest-700 text-white font-landing-sans font-semibold text-[13px] px-5 py-2.5 rounded-xl transition-all duration-150 disabled:opacity-50 active:scale-[.98] ${className}`}
    >
      {isLoading && (
        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ─── SearchBar ────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-mute pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2 border border-ink/[0.1] rounded-xl text-[13px] font-landing-sans text-ink focus:outline-none focus:ring-2 focus:ring-forest-400/30 focus:border-forest-400 bg-white w-64 transition-colors"
      />
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📭', title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="font-landing-sans font-semibold text-ink/70 text-[14px]">{title}</p>
      {sub && <p className="text-mute text-[12.5px] font-landing-sans mt-1">{sub}</p>}
    </div>
  );
}

// ─── FilterPills ──────────────────────────────────────────────────────────────
export function FilterPills({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(o => {
        const label = typeof o === 'string' ? o : o.label;
        const val   = typeof o === 'string' ? o : o.value;
        return (
          <button
            key={val}
            onClick={() => onChange(val)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-landing-sans font-medium capitalize transition-all duration-150 ${
              value === val
                ? 'bg-forest-500 text-white shadow-sm'
                : 'bg-white border border-ink/[0.1] text-ink/60 hover:bg-sand-100 hover:border-ink/[0.15]'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
