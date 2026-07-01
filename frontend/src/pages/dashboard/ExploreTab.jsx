import { useState, useEffect } from 'react';
import { categoryService } from '../../services/categoryService';

export default function ExploreTab() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Nairobi, Kenya');
  const [priceRange, setPriceRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const allServices = categories.flatMap((cat) => (cat.services || []).map((s) => ({ ...s, categoryName: cat.name, categoryId: cat.id })));

  const filtered = allServices.filter((s) => {
    const matchesQuery = !query || s.name?.toLowerCase().includes(query.toLowerCase()) || s.categoryName?.toLowerCase().includes(query.toLowerCase());
    const matchesPrice = priceRange === 'all' || (priceRange === 'low' && (s.base_price || 0) < 1000) || (priceRange === 'mid' && (s.base_price || 0) >= 1000 && (s.base_price || 0) <= 3000) || (priceRange === 'high' && (s.base_price || 0) > 3000);
    return matchesQuery && matchesPrice;
  });

  return (
    <div>
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="font-landing-display text-[26px] font-medium text-ink">Explore services</h1>
          <p className="text-mute text-[14.5px] mt-1 font-landing-sans">Find professionals for any job near you.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex items-center gap-3 rounded-2xl bg-white border border-ink/[0.07] px-5 py-3.5 shadow-sm flex-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B6760" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input
            type="text"
            placeholder="Search services or categories…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[14.5px] font-landing-sans placeholder:text-mute focus:outline-none text-ink"
          />
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white border border-ink/[0.07] px-5 py-3.5 shadow-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B6760" strokeWidth="2"><path d="M12 21s7-7.4 7-12a7 7 0 10-14 0c0 4.6 7 12 7 12z" /><circle cx="12" cy="9" r="2.4" /></svg>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full sm:w-40 bg-transparent text-[14.5px] font-landing-sans placeholder:text-mute focus:outline-none text-ink"
          />
        </div>
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="rounded-2xl bg-white border border-ink/[0.07] px-5 py-3.5 text-[14.5px] font-landing-sans text-ink outline-none shadow-sm"
        >
          <option value="all">All prices</option>
          <option value="low">Under KSh 1,000</option>
          <option value="mid">KSh 1,000 – 3,000</option>
          <option value="high">Over KSh 3,000</option>
        </select>
      </div>

      <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">Service Categories</h2>
      {loading ? (
        <div className="text-center py-12 text-mute text-sm">Loading services…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-mute text-sm">No services found. Try adjusting your filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div key={s.id} className="rounded-2xl border border-ink/[0.06] bg-white p-5 hover:shadow-md hover:shadow-forest-900/5 hover:-translate-y-0.5 transition-all">
              <p className="text-[13.5px] font-landing-sans font-semibold text-forest-600 mb-1">{s.categoryName}</p>
              <h3 className="font-landing-display text-[18px] font-medium text-ink mb-2">{s.name}</h3>
              {s.description && <p className="text-[13px] text-mute font-landing-sans leading-relaxed mb-3">{s.description}</p>}
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-landing-sans font-semibold text-ink">
                  {s.base_price ? `From KSh ${Number(s.base_price).toLocaleString()}` : 'Contact for price'}
                </span>
                <span className="text-[12px] text-mute font-landing-sans">{location}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
