import { useState, useEffect, useMemo } from 'react';
import { categoryService } from '../../services/categoryService';
import { getCustomerLocation, DEFAULT_LOCATION } from '../../services/location';

const PRICE_RANGES = {
  all: { label: 'All prices', min: 0, max: Infinity },
  low: { label: 'Under KSh 1,000', min: 0, max: 1000 },
  mid: { label: 'KSh 1,000 – 3,000', min: 1000, max: 3000 },
  high: { label: 'Over KSh 3,000', min: 3000, max: Infinity },
};

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating', label: 'Top rated' },
  { value: 'distance', label: 'Nearest' },
];

function formatPrice(value) {
  if (value == null) return null;
  return `KSh ${Number(value).toLocaleString()}`;
}

function ProviderDetail({ provider, onClose, onBook }) {
  if (!provider) return null;
  const price = provider.services?.[0]?.price_per_hour ?? provider.base_price;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/40 px-0 sm:px-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-forest-100 flex items-center justify-center text-[15px] font-bold text-forest-700 overflow-hidden">
                {provider.profile_photo ? (
                  <img src={provider.profile_photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  (provider.full_name?.charAt(0)?.toUpperCase() || 'P')
                )}
              </div>
              <div>
                <p className="text-[16px] font-landing-sans font-semibold text-ink">{provider.display_name || provider.full_name}</p>
                <p className="text-[12.5px] text-amber-600 font-medium">★ {Number(provider.rating || 0).toFixed(1)} ({provider.total_ratings || 0} reviews)</p>
              </div>
            </div>
            <button onClick={onClose} className="text-ink/40 hover:text-ink text-2xl leading-none">×</button>
          </div>

          <div className="flex items-center gap-3 text-[12.5px] text-mute font-landing-sans mb-4">
            <span className={
              provider.status === 'online' ? 'text-forest-600 font-semibold' :
              provider.status === 'busy' ? 'text-clay-600 font-semibold' : 'text-ink/60'
            }>
              {provider.status === 'online' ? '🟢 Available now' : provider.status === 'busy' ? '🔴 Busy' : '🟡 Offline'}
            </span>
            {provider.distance_km != null && <span>· {provider.distance_km} km away</span>}
            {provider.total_jobs != null && <span>· {provider.total_jobs} jobs done</span>}
          </div>

          {provider.bio && <p className="text-[13.5px] text-ink/80 font-landing-sans leading-relaxed mb-5">{provider.bio}</p>}

          <h3 className="text-[13px] font-landing-sans font-semibold text-ink/80 mb-3">Services & pricing</h3>
          <div className="flex flex-col gap-2 mb-5">
            {provider.services?.length ? (
              provider.services.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-ink/[0.06] px-4 py-3">
                  <div>
                    <p className="text-[13.5px] font-landing-sans font-semibold text-ink">{s.category_icon ? `${s.category_icon} ` : ''}{s.category_name}</p>
                    {s.description && <p className="text-[12px] text-mute font-landing-sans truncate max-w-[260px]">{s.description}</p>}
                  </div>
                  <span className="text-[13.5px] font-landing-sans font-semibold text-ink whitespace-nowrap">
                    {formatPrice(s.price_per_hour)}<span className="text-[11px] text-mute font-normal">/hr</span>
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[12.5px] text-mute font-landing-sans">Contact for pricing.</p>
            )}
          </div>

          {provider.reviews?.length > 0 && (
            <>
              <h3 className="text-[13px] font-landing-sans font-semibold text-ink/80 mb-3">Recent reviews</h3>
              <div className="flex flex-col gap-3 mb-5">
                {provider.reviews.map((r) => (
                  <div key={r.id} className="rounded-xl bg-sand-50 px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[12.5px] font-landing-sans font-semibold text-ink">{r.customer_name}</p>
                      <span className="text-[12px] text-amber-600 font-medium">★ {r.rating}</span>
                    </div>
                    {r.comment && <p className="text-[12.5px] text-mute font-landing-sans leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          <button
            onClick={() => onBook(provider)}
            className="w-full rounded-full bg-forest-500 hover:bg-forest-600 text-white text-[14px] font-landing-sans font-semibold py-3 transition-colors"
          >
            Book {provider.services?.[0]?.category_name || 'service'}
            {price != null && ` · from ${formatPrice(price)}/hr`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExploreTab({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [sort, setSort] = useState('recommended');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [locationLabel, setLocationLabel] = useState('Nairobi, Kenya');
  const [customerLoc, setCustomerLoc] = useState(DEFAULT_LOCATION);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  const [detailProvider, setDetailProvider] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

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
    getCustomerLocation().then((loc) => {
      if (loc && (loc.lat !== DEFAULT_LOCATION.lat || loc.lon !== DEFAULT_LOCATION.lon)) {
        setCustomerLoc(loc);
        setLocationLabel('Using my location');
      }
    });
  }, []);

  const openCategory = async (cat) => {
    setSelectedCategory(cat);
    setLoadingProviders(true);
    try {
      const data = await categoryService.getProvidersByCategory(cat.id, {
        sort,
        lat: customerLoc.lat,
        lon: customerLoc.lon,
      });
      setProviders(data);
    } catch (e) {
      console.error(e);
      setProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  };

  // Re-fetch providers when sort changes while viewing a category.
  useEffect(() => {
    if (selectedCategory) {
      openCategory(selectedCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const openProviderDetail = async (provider) => {
    setLoadingDetail(true);
    setDetailProvider(provider);
    try {
      const detail = await categoryService.getProviderDetail(
        provider.id,
        customerLoc.lat,
        customerLoc.lon
      );
      setDetailProvider(detail);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const bookProvider = (provider) => {
    const params = new URLSearchParams({
      category: String(selectedCategory.id),
      provider: String(provider.id),
    });
    window.location.href = `/request?${params.toString()}`;
  };

  const matchesPrice = (p) => {
    const range = PRICE_RANGES[priceRange];
    const price = p.price_per_hour ?? p.base_price ?? 0;
    return price >= range.min && price <= range.max;
  };

  const filteredProviders = useMemo(() => {
    if (!selectedCategory) return [];
    const list = providers.filter((p) => priceRange === 'all' || matchesPrice(p));
    return list;
  }, [providers, priceRange, selectedCategory]);

  if (selectedCategory) {
    const categoryPrice = PRICE_RANGES[priceRange];
    return (
      <div>
        <button
          onClick={() => setSelectedCategory(null)}
          className="mb-5 text-[13.5px] font-landing-sans font-semibold text-forest-600 hover:text-forest-700"
        >
          ← Back to categories
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h1 className="font-landing-display text-[24px] font-medium text-ink mb-1">
              {selectedCategory.icon} {selectedCategory.name}s near you
            </h1>
            <p className="text-mute text-[14px] font-landing-sans">
              {locationLabel}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white border border-ink/[0.07] px-4 py-2.5 shadow-sm">
            <span className="text-[12.5px] text-mute font-landing-sans">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-[13.5px] font-landing-sans text-ink outline-none bg-transparent"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price filter for the open category */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(PRICE_RANGES).map(([key, r]) => (
            <button
              key={key}
              onClick={() => setPriceRange(key)}
              className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-landing-sans font-medium transition-colors ${
                priceRange === key
                  ? 'bg-forest-500 text-white'
                  : 'bg-white border border-ink/[0.07] text-ink/70 hover:border-forest-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {loadingProviders ? (
          <div className="text-center py-12 text-mute text-sm">Finding providers…</div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12 text-mute text-sm">
            {providers.length === 0
              ? `No ${selectedCategory.name.toLowerCase()}s are available right now. Try another category or check back later.`
              : `No ${selectedCategory.name.toLowerCase()}s match "${categoryPrice.label}". Try another price range.`}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProviders.map((p) => {
              const price = p.price_per_hour ?? p.base_price;
              return (
                <div key={p.id} className="rounded-2xl border border-ink/[0.06] bg-white p-5 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-full bg-forest-100 flex items-center justify-center text-[12px] font-bold text-forest-700 overflow-hidden">
                      {p.profile_photo ? (
                        <img src={p.profile_photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        (p.full_name?.charAt(0)?.toUpperCase() || 'P')
                      )}
                    </div>
                    <div>
                      <p className="text-[14.5px] font-landing-sans font-semibold text-ink">{p.display_name || p.full_name}</p>
                      <p className="text-[12px] text-amber-600 font-medium">★ {Number(p.rating || 0).toFixed(1)} ({p.total_ratings || 0})</p>
                    </div>
                  </div>
                  <p className="text-[12.5px] text-mute font-landing-sans mb-1">
                    {p.status === 'online' ? '🟢 Available now' : p.status === 'busy' ? '🔴 Busy' : '🟡 Offline'}
                    {p.distance_km != null && ` · ${p.distance_km} km`}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    {price != null ? (
                      <span className="text-[13.5px] font-landing-sans font-semibold text-ink">
                        {formatPrice(price)}<span className="text-[11px] text-mute font-normal">/hr</span>
                      </span>
                    ) : (
                      <span className="text-[13.5px] text-mute font-landing-sans">Contact for price</span>
                    )}
                    {p.total_jobs != null && (
                      <span className="text-[11.5px] text-mute font-landing-sans">{p.total_jobs} jobs</span>
                    )}
                  </div>
                  {p.address && <p className="text-[12.5px] text-mute font-landing-sans mb-3 truncate">{p.address}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openProviderDetail(p)}
                      className="flex-1 rounded-full border border-forest-200 text-forest-700 text-[13px] font-landing-sans font-semibold py-2.5 hover:bg-forest-50 transition-colors"
                    >
                      View profile
                    </button>
                    <button
                      onClick={() => bookProvider(p)}
                      className="flex-1 rounded-full bg-forest-500 hover:bg-forest-600 text-white text-[13px] font-landing-sans font-semibold py-2.5 transition-colors"
                    >
                      Book
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {detailProvider && (
          <ProviderDetail
            provider={loadingDetail ? null : detailProvider}
            onClose={() => setDetailProvider(null)}
            onBook={bookProvider}
          />
        )}
      </div>
    );
  }

  const filtered = categories.filter((cat) => {
    const matchesQuery = !query || cat.name?.toLowerCase().includes(query.toLowerCase()) || cat.description?.toLowerCase().includes(query.toLowerCase());
    return matchesQuery;
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
          <span className="text-[14.5px] font-landing-sans text-ink">{locationLabel}</span>
        </div>
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          className="rounded-2xl bg-white border border-ink/[0.07] px-5 py-3.5 text-[14.5px] font-landing-sans text-ink outline-none shadow-sm"
        >
          {Object.entries(PRICE_RANGES).map(([key, r]) => (
            <option key={key} value={key}>{r.label}</option>
          ))}
        </select>
      </div>

      <h2 className="text-[14px] font-landing-sans font-semibold text-ink/80 mb-4">Service Categories</h2>
      {loading ? (
        <div className="text-center py-12 text-mute text-sm">Loading services…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-mute text-sm">No services found. Try adjusting your filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat) => (
            <div key={cat.id} className="rounded-2xl border border-ink/[0.06] bg-white p-5 hover:shadow-md hover:shadow-forest-900/5 hover:-translate-y-0.5 transition-all">
              <p className="text-[13.5px] font-landing-sans font-semibold text-forest-600 mb-1">Service</p>
              <h3 className="font-landing-display text-[18px] font-medium text-ink mb-2">
                {cat.icon ? `${cat.icon} ` : ''}{cat.name}
              </h3>
              {cat.description && <p className="text-[13px] text-mute font-landing-sans leading-relaxed mb-3">{cat.description}</p>}
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-landing-sans font-semibold text-ink">Contact for price</span>
                <button
                  onClick={() => openCategory(cat)}
                  className="text-[12px] text-forest-600 font-landing-sans font-semibold hover:underline"
                >
                  View providers →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
