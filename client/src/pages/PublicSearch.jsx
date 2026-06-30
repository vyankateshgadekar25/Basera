import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import { Search, MapPin, Users, Star, SlidersHorizontal, BedDouble, ChevronRight, Home, X } from 'lucide-react';

/* ---------- Helpers ---------- */
function useStaggerOnMount(deps) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const items = ref.current.querySelectorAll('[data-stagger]');
    items.forEach((el, i) => {
      // Cap total delay at 300ms; ~60ms per item
      const delay = Math.min(i * 60, 300);
      el.style.transitionDelay = `${delay}ms`;
    });
    // IntersectionObserver — only animates first time in viewport, doesn't replay
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

function getRatingColor(rating) {
  const r = parseFloat(rating);
  if (r >= 4.5) return 'bg-accent-600 text-white';
  if (r >= 4)   return 'bg-accent-500 text-white';
  if (r >= 3)   return 'bg-amber-400 text-white';
  return 'bg-ink-900/40 text-white';
}

/* ---------- Skeleton card (matches real card dimensions) ---------- */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-ink-900/5 overflow-hidden" data-testid="skeleton-card">
      <div className="h-48 skeleton rounded-none" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start gap-3">
          <div className="skeleton h-5 w-2/3" />
          <div className="skeleton h-6 w-12" />
        </div>
        <div className="skeleton h-4 w-1/2" />
        <div className="pt-3 border-t border-ink-900/5 flex justify-between">
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-4 w-6" />
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function PublicSearch() {
  const initialFilters = { city: '', gender_pref: '', vacancy_only: false, min_rating: '' };
  const [filters, setFilters] = useState(initialFilters);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState('initial'); // 'initial' | 'loading' | 'ready'
  const [showFilters, setShowFilters] = useState(false);
  const api = useApi();
  const hasFilters =
    !!filters.city || !!filters.gender_pref || !!filters.min_rating || filters.vacancy_only;

  const search = useCallback(async (filtersOverride) => {
    const f = filtersOverride ?? filters;
    setPhase('loading');
    try {
      const params = new URLSearchParams();
      if (f.city)         params.append('city', f.city);
      if (f.gender_pref)  params.append('gender_pref', f.gender_pref);
      if (f.vacancy_only) params.append('vacancy_only', 'true');
      if (f.min_rating)   params.append('min_rating', f.min_rating);
      const res = await api.get(`/search?${params.toString()}`);
      // Brief 150ms fade-out is implied by phase swap; let real results paint after a tick
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      // Small delay so the skeleton doesn't flash on fast responses
      setTimeout(() => setPhase('ready'), 180);
    }
  }, [api, filters]);

  // First load
  useEffect(() => { search(initialFilters); /* eslint-disable-next-line */ }, []);

  const clearFilters = () => {
    setFilters(initialFilters);
    setShowFilters(false);
    search(initialFilters);
  };

  // Stagger only when results change to a "ready" set
  const gridRef = useStaggerOnMount([phase === 'ready' ? results.length : 0]);

  return (
    <div className="min-h-screen">
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-800 to-accent-900" />
          <div className="absolute -top-32 -right-20 w-[480px] h-[480px] rounded-full bg-accent-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-32 w-[520px] h-[520px] rounded-full bg-cream-200/10 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28 text-white">
          <p
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-accent-200/80 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 animate-fade-up"
            style={{ animationDelay: '40ms' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
            Verified PGs · Hostels · Co-living
          </p>

          <h1
            className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05] max-w-3xl animate-fade-up"
            style={{ animationDelay: '120ms' }}
          >
            Find a place that feels<br />
            <span className="italic text-accent-300">like home</span>, not a listing.
          </h1>
          <p
            className="mt-5 text-base sm:text-lg text-white/70 max-w-xl animate-fade-up"
            style={{ animationDelay: '200ms' }}
          >
            Browse rated PGs and hostels across India. Filter by city, gender preference,
            ratings, and live availability — no broker calls.
          </p>

          {/* Search card */}
          <div
            className="mt-10 bg-white rounded-2xl shadow-2xl p-2 max-w-2xl animate-fade-up"
            style={{ animationDelay: '280ms' }}
            data-testid="hero-search-card"
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-3 px-4">
                <Search className="w-5 h-5 text-ink-900/40" />
                <input
                  type="text"
                  placeholder="Search by city, area, or property name…"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && search()}
                  className="w-full py-3 outline-none text-ink-900 placeholder:text-ink-900/35 bg-transparent border-0 focus:ring-0"
                  data-testid="search-city-input"
                  aria-label="Search by city"
                />
              </div>
              <button
                onClick={() => setShowFilters((s) => !s)}
                aria-expanded={showFilters}
                aria-controls="filters-panel"
                className="p-3 text-ink-700 hover:bg-cream-100 rounded-xl transition-colors duration-150"
                data-testid="toggle-filters-button"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
              <button
                onClick={() => search()}
                disabled={phase === 'loading'}
                className="btn-primary rounded-xl py-3 px-6 min-w-[120px]"
                data-testid="search-submit-button"
              >
                {phase === 'loading' ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce" />
                  </span>
                ) : 'Search'}
              </button>
            </div>

            {showFilters && (
              <div
                id="filters-panel"
                className="border-t border-ink-900/5 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up"
                data-testid="filters-panel"
              >
                <div>
                  <label className="text-[11px] font-semibold text-ink-700/60 uppercase tracking-wider mb-1.5 block">
                    Gender Preference
                  </label>
                  <select
                    value={filters.gender_pref}
                    onChange={(e) => setFilters({ ...filters, gender_pref: e.target.value })}
                    className="input py-2"
                    data-testid="filter-gender"
                  >
                    <option value="">Any</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-ink-700/60 uppercase tracking-wider mb-1.5 block">
                    Min Rating
                  </label>
                  <select
                    value={filters.min_rating}
                    onChange={(e) => setFilters({ ...filters, min_rating: e.target.value })}
                    className="input py-2"
                    data-testid="filter-rating"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filters.vacancy_only}
                      onChange={(e) => setFilters({ ...filters, vacancy_only: e.target.checked })}
                      className="w-4 h-4 accent-accent-600 rounded"
                      data-testid="filter-vacancy"
                    />
                    <span className="text-sm text-ink-800 font-medium">Only show with vacancies</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Quick stat strip */}
          <div
            className="mt-10 flex flex-wrap gap-x-10 gap-y-3 text-white/70 text-sm animate-fade-up"
            style={{ animationDelay: '360ms' }}
          >
            <span className="flex items-center gap-2"><span className="font-display text-white text-xl font-semibold">12K+</span> verified beds</span>
            <span className="flex items-center gap-2"><span className="font-display text-white text-xl font-semibold">80+</span> cities</span>
            <span className="flex items-center gap-2"><span className="font-display text-white text-xl font-semibold">4.6★</span> avg owner rating</span>
          </div>
        </div>
      </section>

      {/* ===== Results ===== */}
      <section className="page-container">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink-900 tracking-tight">
              {phase === 'loading' ? 'Searching…' : `${results.length} ${results.length === 1 ? 'property' : 'properties'} found`}
            </h2>
            <p className="text-sm text-ink-700/60 mt-1">
              Hand-checked PGs & hostels. Tap a card for full ratings, rules and vacancy.
            </p>
          </div>
          {hasFilters && phase !== 'loading' && (
            <button onClick={clearFilters} className="btn-ghost text-sm" data-testid="clear-filters-inline">
              <X className="w-4 h-4" /> Clear filters
            </button>
          )}
        </div>

        {/* Loading: skeleton grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${
            phase === 'loading' ? 'opacity-100' : 'opacity-0 absolute pointer-events-none -z-10'
          }`}
          aria-hidden={phase !== 'loading'}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
        </div>

        {/* Ready: real results with stagger entry */}
        {phase === 'ready' && results.length > 0 && (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in"
            data-testid="results-grid"
          >
            {results.map((prop) => (
              <Link
                to={`/property/${prop.id}`}
                key={prop.id}
                className="card-hover group overflow-hidden stagger-item"
                data-stagger
                data-testid={`property-card-${prop.id}`}
              >
                {/* Image */}
                <div className="h-48 relative overflow-hidden bg-gradient-to-br from-accent-100 via-cream-100 to-accent-50">
                  <div
                    className="absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-[1.05]"
                  >
                    <Home className="w-14 h-14 text-accent-700/35" strokeWidth={1.5} />
                  </div>
                  {prop.vacant_beds > 0 && (
                    <span className="absolute top-3 right-3 badge bg-white/95 text-accent-700 border border-accent-200 backdrop-blur">
                      {prop.vacant_beds} {prop.vacant_beds === 1 ? 'bed' : 'beds'} open
                    </span>
                  )}
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-ink-800 capitalize flex items-center gap-1">
                      <Users className="w-3 h-3" /> {prop.gender_pref}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <h3 className="font-display font-semibold text-lg text-ink-900 group-hover:text-accent-700 transition-colors line-clamp-1">
                      {prop.name}
                    </h3>
                    {prop.avg_rating > 0 && (
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold shrink-0 ${getRatingColor(prop.avg_rating)}`}>
                        <Star className="w-3 h-3 fill-current" />
                        {parseFloat(prop.avg_rating).toFixed(1)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-ink-700/70 mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">
                      {prop.address}, {prop.city}
                      {prop.landmark && <span className="text-ink-700/50"> · near {prop.landmark}</span>}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-ink-900/5">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1 text-ink-800">
                        <BedDouble className="w-4 h-4 text-ink-900/40" />
                        {prop.total_beds} beds
                      </span>
                      <span className="text-ink-900/20">·</span>
                      <span className="text-accent-700 font-semibold">{prop.vacant_beds} vacant</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-ink-900/25 group-hover:text-accent-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>

                  {prop.rules && (
                    <p className="text-xs text-ink-700/50 mt-3 line-clamp-2">{prop.rules}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {phase === 'ready' && results.length === 0 && (
          <div
            className="text-center py-20 animate-pop-in"
            data-testid="empty-state"
          >
            <div className="inline-flex animate-idle-float">
              <div className="w-20 h-20 bg-white border border-ink-900/5 rounded-full flex items-center justify-center shadow-ambient">
                <Search className="w-8 h-8 text-accent-600" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="mt-6 font-display text-xl font-semibold text-ink-900">No properties match those filters</h3>
            <p className="text-ink-700/60 mt-1 max-w-md mx-auto">
              Try widening the search — different city, lower minimum rating, or include properties without vacancies.
            </p>
            <button onClick={clearFilters} className="btn-primary mt-6" data-testid="clear-filters-empty">
              <X className="w-4 h-4" /> Clear filters
            </button>
          </div>
        )}
      </section>

      {/* ===== Footer ===== */}
      <footer className="mt-16 border-t border-ink-900/5 bg-white/60 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-700/60">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-ink-900">Basera</span>
            <span>· A calmer way to find your next stay.</span>
          </div>
          <div className="flex items-center gap-5">
            <a className="hover:text-accent-700 transition-colors" href="#">About</a>
            <a className="hover:text-accent-700 transition-colors" href="#">Owners</a>
            <a className="hover:text-accent-700 transition-colors" href="#">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
