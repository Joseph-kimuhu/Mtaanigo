import { useState, useEffect } from 'react';

const mockProviders = [
  { id: 1, name: 'John Kamau', role: 'Electrician', rating: 4.8, reviews: 230, distance: '2.3 km' },
  { id: 2, name: 'Peter Mwangi', role: 'Plumber', rating: 4.9, reviews: 310, distance: '1.7 km' },
  { id: 3, name: 'Mary Wanjiku', role: 'Cleaner', rating: 4.7, reviews: 150, distance: '1.5 km' },
  { id: 4, name: 'David Mutua', role: 'Carpenter', rating: 4.8, reviews: 185, distance: '3.1 km' },
];

export default function FavoritesTab({ onNavigate }) {
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mtaanigo_favorites') || '[]'); } catch { return mockProviders; }
  });

  useEffect(() => {
    localStorage.setItem('mtaanigo_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (provider) => {
    setFavorites((prev) => {
      const exists = prev.find((p) => p.id === provider.id);
      if (exists) {
        return prev.filter((p) => p.id !== provider.id);
      }
      return [...prev, provider];
    });
  };

  return (
    <div>
      <h1 className="font-landing-display text-[26px] font-medium text-ink mb-2">Favorites</h1>
      <p className="text-mute text-[14px] font-landing-sans mb-6">Professionals you have saved for quick booking.</p>

      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-ink/[0.06] bg-white px-5 py-12 text-center">
          <p className="text-mute font-landing-sans text-sm mb-3">No saved professionals yet.</p>
          <button onClick={() => onNavigate('explore')} className="rounded-full bg-forest-500 hover:bg-forest-600 text-white text-[13px] font-landing-sans font-semibold px-5 py-2.5 transition-colors">Explore services</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((pro) => (
            <div key={pro.id} className="rounded-2xl border border-ink/[0.06] bg-white p-5 hover:shadow-md hover:shadow-forest-900/5 hover:-translate-y-0.5 transition-all group">
              <div className="w-14 h-14 rounded-full bg-forest-100 mb-3 group-hover:scale-105 transition-transform" />
              <p className="text-[14px] font-landing-sans font-semibold text-ink">{pro.name}</p>
              <p className="text-[12px] text-mute font-landing-sans mb-2">{pro.role}</p>
              <div className="flex items-center justify-between text-[11.5px] text-mute font-landing-sans mb-4">
                <span className="flex items-center gap-1 text-amber-600 font-medium">★ {pro.rating} ({pro.reviews})</span>
                <span className="flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s7-7.4 7-12a7 7 0 10-14 0c0 4.6 7 12 7 12z" /><circle cx="12" cy="9" r="2.4" /></svg>
                  {pro.distance}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onNavigate('explore')} className="flex-1 rounded-full bg-forest-500 text-white py-2 text-[13px] font-landing-sans font-semibold hover:bg-forest-600 transition-colors">Book again</button>
                <button onClick={() => toggleFavorite(pro)} className="rounded-full border border-red-200 text-red-600 py-2 px-3 text-[12px] font-landing-sans font-medium hover:bg-red-50 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 000-7.8z" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
