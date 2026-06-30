import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi.js';
import { MapPin, Star, BedDouble, Users, ArrowLeft, Home, MessageSquare, Shield, Sparkles, ExternalLink, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    api.get(`/search/property/${id}`).then((res) => {
      setProperty(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="page-container">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  );

  if (!property) return (
    <div className="page-container text-center py-20">
      <h2 className="text-2xl font-bold text-slate-900">Property not found</h2>
      <Link to="/" className="btn-primary mt-4 inline-flex">Go Home</Link>
    </div>
  );

  const overall = parseFloat(property.rating_summary?.avg_overall || 0).toFixed(1);
  const totalRatings = property.rating_summary?.total_ratings || 0;

  const getScoreColor = (score) => {
    const s = parseFloat(score);
    if (s >= 4.5) return 'text-emerald-600';
    if (s >= 4) return 'text-emerald-500';
    if (s >= 3) return 'text-amber-500';
    return 'text-slate-500';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Image */}
      <div className="h-64 md:h-80 bg-gradient-to-br from-accent-100 via-slate-100 to-accent-50 flex items-center justify-center relative">
        <Home className="w-20 h-20 text-accent-200" />
        <Link to="/" className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-2 rounded-xl hover:bg-white transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
      </div>

      <div className="page-container -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{property.name}</h1>
                  <div className="flex items-center gap-1.5 text-slate-500 mt-2">
                    <MapPin className="w-4 h-4" />
                    <span>{property.address}, {property.city}</span>
                  </div>
                </div>
                {overall > 0 && (
                  <div className="flex items-center gap-2 bg-accent-50 px-4 py-2 rounded-xl">
                    <Star className="w-5 h-5 text-accent-600 fill-accent-600" />
                    <span className="text-2xl font-bold text-accent-700">{overall}</span>
                    <span className="text-sm text-accent-500">/ 5</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="badge badge-gray capitalize flex items-center gap-1">
                  <Users className="w-3 h-3" /> {property.gender_pref}
                </span>
                {property.contact_visible && (
                  <span className="badge badge-blue flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Contact Available
                  </span>
                )}
                {property.landmark && (
                  <span className="badge badge-gray flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> Near {property.landmark}
                  </span>
                )}
              </div>
            </div>

            {/* Location / Map */}
            {property.latitude && property.longitude && (
              <div className="card overflow-hidden" data-testid="property-map">
                <div className="p-5 border-b border-ink-900/5 flex items-center justify-between">
                  <h3 className="section-title flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent-700" /> Exact location
                  </h3>
                  <a
                    href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                    target="_blank" rel="noreferrer"
                    className="text-sm text-accent-700 hover:text-accent-800 flex items-center gap-1 transition-colors"
                    data-testid="open-in-gmaps"
                  >
                    Open in Google Maps <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <iframe
                  title="Property location"
                  width="100%"
                  height="320"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(property.longitude)-0.005}%2C${Number(property.latitude)-0.005}%2C${Number(property.longitude)+0.005}%2C${Number(property.latitude)+0.005}&layer=mapnik&marker=${property.latitude}%2C${property.longitude}`}
                />
                {property.landmark && (
                  <div className="px-5 py-3 bg-cream-50 text-sm text-ink-800 flex items-center gap-2 border-t border-ink-900/5">
                    <Navigation className="w-4 h-4 text-accent-700" />
                    <span><strong>Nearby:</strong> {property.landmark}</span>
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="stat-card text-center">
                <div className="stat-value">{property.vacancy?.total_beds || 0}</div>
                <div className="stat-label flex items-center justify-center gap-1">
                  <BedDouble className="w-3.5 h-3.5" /> Total Beds
                </div>
              </div>
              <div className="stat-card text-center">
                <div className="stat-value text-emerald-600">{property.vacancy?.vacant_beds || 0}</div>
                <div className="stat-label">Vacant</div>
              </div>
              <div className="stat-card text-center">
                <div className="stat-value">{totalRatings}</div>
                <div className="stat-label flex items-center justify-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> Reviews
                </div>
              </div>
            </div>

            {/* Rules */}
            {property.rules && (
              <div className="card p-6">
                <h3 className="section-title flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-accent-600" /> Rules & Guidelines
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {property.rules}
                </div>
              </div>
            )}

            {/* Ratings Breakdown */}
            {totalRatings > 0 && (
              <div className="card p-6">
                <h3 className="section-title mb-6">Rating Breakdown</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Cleanliness', value: property.rating_summary.avg_cleanliness, icon: Sparkles },
                    { label: 'Responsiveness', value: property.rating_summary.avg_responsiveness, icon: MessageSquare },
                    { label: 'Safety', value: property.rating_summary.avg_safety, icon: Shield },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-4 bg-slate-50 rounded-xl">
                      <item.icon className={`w-6 h-6 mx-auto mb-2 ${getScoreColor(item.value)}`} />
                      <div className={`text-2xl font-bold ${getScoreColor(item.value)}`}>
                        {parseFloat(item.value || 0).toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{item.label}</div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-accent-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${(parseFloat(item.value || 0) / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card p-6">
              <h3 className="section-title flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-accent-600" /> Reviews
              </h3>
              {property.ratings?.length > 0 ? (
                <div className="space-y-4">
                  {property.ratings.map((rating) => {
                    const avg = ((rating.cleanliness + rating.responsiveness + rating.safety) / 3).toFixed(1);
                    return (
                      <div key={rating.id} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-slate-900">{rating.renter_name}</p>
                            <div className="flex gap-2 mt-1">
                              {['cleanliness', 'responsiveness', 'safety'].map((k) => (
                                <span key={k} className="text-xs bg-slate-100 px-2 py-0.5 rounded-md capitalize text-slate-600">
                                  {k}: {rating[k]}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className={`text-lg font-bold ${getScoreColor(avg)}`}>{avg}</span>
                        </div>
                        {rating.comment && <p className="text-sm text-slate-600 mt-2">{rating.comment}</p>}
                        {rating.owner_reply && (
                          <div className="mt-3 bg-accent-50 p-3 rounded-xl text-sm">
                            <span className="font-semibold text-accent-700">Owner reply:</span>{' '}
                            <span className="text-accent-600">{rating.owner_reply}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No reviews yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Interested?</h3>
              <p className="text-sm text-slate-500 mb-4">
                Contact the property owner to book your stay. Availability is updated in real-time.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <BedDouble className="w-5 h-5 text-accent-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{property.vacancy?.vacant_beds || 0} beds available</p>
                    <p className="text-xs text-slate-500">Out of {property.vacancy?.total_beds || 0} total</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <Users className="w-5 h-5 text-accent-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 capitalize">{property.gender_pref}</p>
                    <p className="text-xs text-slate-500">Gender preference</p>
                  </div>
                </div>
              </div>
              <Link to="/login" className="btn-primary w-full mt-4">
                Login to Book
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
