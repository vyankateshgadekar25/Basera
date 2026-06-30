import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  Building2, Plus, Users, BedDouble, DollarSign, CheckCircle, XCircle, AlertTriangle,
  Search, Filter, ChevronDown, ChevronRight, Home, DoorOpen, Bed, ArrowRight,
  Calendar, Phone, IndianRupee, Trash2, Edit3, X, Star, TrendingUp, Clock,
  MapPin, LocateFixed, ExternalLink
} from 'lucide-react';

/* ---------- PropertyForm — extracted so we have local state for location ---------- */
function PropertyForm({ onSubmit, onCancel, addToast }) {
  const [coords, setCoords] = useState({ lat: '', lng: '' });
  const [locating, setLocating] = useState(false);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      addToast?.('Geolocation is not available in this browser', 'error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        });
        setLocating(false);
        addToast?.('Location captured', 'success');
      },
      (err) => {
        setLocating(false);
        addToast?.(err.code === 1 ? 'Permission denied — enable location for this site' : 'Could not read location', 'error');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Accept a paste from Google Maps (link or "lat, lng" text)
  const parseMapsInput = (text) => {
    if (!text) return null;
    // Match common patterns: @lat,lng,zoom / ?q=lat,lng / plain "lat, lng"
    const at = text.match(/@(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)/);
    const q  = text.match(/[?&]q=(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)/);
    const pl = text.match(/(-?\d{1,3}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/);
    const m = at || q || pl;
    if (!m) return null;
    return { lat: m[1], lng: m[2] };
  };

  const onPasteMaps = (e) => {
    const parsed = parseMapsInput(e.clipboardData.getData('text'));
    if (parsed) {
      setTimeout(() => setCoords(parsed), 0);
      addToast?.('Location extracted from link', 'success');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="label">Property Name</label>
          <input name="name" className="input" placeholder="e.g., Sunshine PG" required data-testid="prop-name" />
        </div>
        <div>
          <label className="label">City</label>
          <input name="city" className="input" placeholder="e.g., Mumbai" required data-testid="prop-city" />
        </div>
        <div>
          <label className="label">Gender Preference</label>
          <select name="gender_pref" className="input" required data-testid="prop-gender">
            <option value="any">Any</option>
            <option value="male">Male Only</option>
            <option value="female">Female Only</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="label">Address</label>
          <input name="address" className="input" placeholder="Full address" required data-testid="prop-address" />
        </div>
        <div className="md:col-span-2">
          <label className="label flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-accent-700" />
            Nearby landmark <span className="text-ink-700/50 font-normal">— helps tenants find it</span>
          </label>
          <input name="landmark" className="input" placeholder="e.g., Opposite Metro Pillar 42, near HDFC ATM" data-testid="prop-landmark" />
        </div>

        {/* Location block */}
        <div className="md:col-span-2 bg-accent-50/60 border border-accent-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 gap-3">
            <div>
              <p className="text-sm font-semibold text-ink-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-accent-700" /> Exact location
              </p>
              <p className="text-xs text-ink-700/60 mt-0.5">Tenants will see a map pin — no more wrong-address calls.</p>
            </div>
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="btn-secondary text-xs py-1.5 px-3"
              data-testid="use-my-location"
            >
              {locating ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-ink-900/30 border-t-ink-900 rounded-full animate-spin" />
                  Reading…
                </span>
              ) : (
                <><LocateFixed className="w-3.5 h-3.5" /> Use my location</>
              )}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-ink-700/70 mb-1 block">Latitude</label>
              <input
                name="latitude"
                value={coords.lat}
                onChange={(e) => setCoords({ ...coords, lat: e.target.value })}
                onPaste={onPasteMaps}
                placeholder="19.07609"
                className="input py-2 font-mono text-sm"
                inputMode="decimal"
                data-testid="prop-lat"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-700/70 mb-1 block">Longitude</label>
              <input
                name="longitude"
                value={coords.lng}
                onChange={(e) => setCoords({ ...coords, lng: e.target.value })}
                onPaste={onPasteMaps}
                placeholder="72.87775"
                className="input py-2 font-mono text-sm"
                inputMode="decimal"
                data-testid="prop-lng"
              />
            </div>
          </div>
          <p className="text-xs text-ink-700/60 mt-2">
            Or paste a Google Maps link into either field — we'll auto-extract the coordinates.
          </p>
          {coords.lat && coords.lng && (
            <div className="mt-3 rounded-lg overflow-hidden border border-ink-900/5 bg-white">
              <iframe
                title="Location preview"
                width="100%"
                height="180"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(coords.lng)-0.005}%2C${Number(coords.lat)-0.005}%2C${Number(coords.lng)+0.005}%2C${Number(coords.lat)+0.005}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`}
              />
              <a
                href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-1 py-2 text-xs font-medium text-accent-700 hover:bg-accent-50 transition-colors"
              >
                <ExternalLink className="w-3 h-3" /> Open in Google Maps
              </a>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="label">Rules & Guidelines</label>
          <textarea name="rules" className="input" rows="3" placeholder="Property rules…" data-testid="prop-rules" />
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="contact_visible" defaultChecked className="w-4 h-4 accent-accent-600 rounded" />
            <span className="text-sm text-ink-800">Show my contact on the public listing</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="btn-primary flex-1" data-testid="prop-submit">Add Property</button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  );
}

export default function OwnerDashboard() {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [bills, setBills] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const api = useApi();
  const { addToast } = useToast();

  const fetchProperties = async () => {
    const res = await api.get('/properties/mine');
    setProperties(res.data);
  };

  useEffect(() => { fetchProperties(); }, []);

  const fetchPropertyDetail = async (id) => {
    setLoading(true);
    const res = await api.get(`/properties/${id}`);
    setSelectedProperty(res.data);
    setLoading(false);
  };

  const fetchTenants = async (propertyId) => {
    const res = await api.get(`/tenancies/property/${propertyId}`);
    setTenants(res.data);
  };

  const fetchBills = async () => {
    const res = await api.get('/bills/owner');
    setBills(res.data);
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      name: form.name.value,
      address: form.address.value,
      city: form.city.value,
      gender_pref: form.gender_pref.value,
      rules: form.rules.value,
      contact_visible: form.contact_visible.checked,
      landmark: form.landmark?.value || undefined,
      latitude:  form.latitude?.value  || undefined,
      longitude: form.longitude?.value || undefined,
    };
    await api.post('/properties', data);
    setModal(null);
    fetchProperties();
    addToast('Property added successfully', 'success');
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    await api.post(`/properties/${selectedProperty.id}/rooms`, { label: e.target.label.value });
    setModal(null);
    fetchPropertyDetail(selectedProperty.id);
    addToast('Room added', 'success');
  };

  const handleAddBed = async (e) => {
    e.preventDefault();
    const roomId = e.target.room_id.value;
    await api.post(`/properties/${selectedProperty.id}/rooms/${roomId}/beds`, { label: e.target.label.value });
    setModal(null);
    fetchPropertyDetail(selectedProperty.id);
    addToast('Bed added', 'success');
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      bed_id: form.bed_id.value,
      renter_name: form.renter_name.value,
      renter_phone: form.renter_phone.value,
      monthly_rent: parseFloat(form.monthly_rent.value),
      deposit: parseFloat(form.deposit.value) || 0,
      move_in_date: form.move_in_date.value,
    };
    await api.post('/tenancies/checkin', data);
    setModal(null);
    fetchPropertyDetail(selectedProperty.id);
    fetchTenants(selectedProperty.id);
    addToast('Tenant checked in successfully', 'success');
  };

  const handleCheckOut = async (tenancyId) => {
    if (!confirm('Are you sure you want to check out this tenant?')) return;
    await api.post(`/tenancies/${tenancyId}/checkout`);
    fetchPropertyDetail(selectedProperty.id);
    fetchTenants(selectedProperty.id);
    addToast('Tenant checked out', 'info');
  };

  const handleGenerateBills = async (e) => {
    e.preventDefault();
    const month = e.target.month.value;
    const res = await api.post('/bills/generate', { month });
    setModal(null);
    fetchBills();
    addToast(res.data.message, 'success');
  };

  const handleReviewPayment = async (billId, action) => {
    await api.post(`/bills/${billId}/review`, { action });
    fetchBills();
    addToast(`Payment ${action}ed`, action === 'confirm' ? 'success' : 'info');
  };

  const vacantBeds = selectedProperty?.rooms?.flatMap(r => r.beds?.filter(b => !b.occupied) || []) || [];
  const totalBeds = properties.reduce((sum, p) => sum + (p.total_beds || 0), 0);
  const totalOccupied = properties.reduce((sum, p) => sum + (p.occupied_beds || 0), 0);
  const totalVacant = totalBeds - totalOccupied;
  const pendingBills = bills.filter(b => b.status === 'submitted').length;

  const getStatusBadge = (status) => {
    const map = {
      pending: <span className="badge badge-yellow flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>,
      submitted: <span className="badge badge-blue flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Submitted</span>,
      paid: <span className="badge badge-green flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Paid</span>,
      rejected: <span className="badge badge-red flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>,
    };
    return map[status] || <span className="badge badge-gray">{status}</span>;
  };

  const filteredProperties = properties.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Owner Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your properties, tenants, and payments</p>
          </div>
          <button onClick={() => setModal('addProperty')} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Property
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent-600" />
              </div>
            </div>
            <div className="stat-value">{properties.length}</div>
            <div className="stat-label">Properties</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <BedDouble className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="stat-value">{totalBeds}</div>
            <div className="stat-label">Total Beds</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="stat-value">{totalOccupied}</div>
            <div className="stat-label">Occupied</div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="stat-value">{pendingBills}</div>
            <div className="stat-label">Pending Reviews</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-slate-200/60 w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: Home },
            { id: 'tenants', label: 'Tenants', icon: Users },
            { id: 'bills', label: 'Payments', icon: DollarSign },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'bills') fetchBills();
                if (tab.id === 'tenants' && selectedProperty) fetchTenants(selectedProperty.id);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-accent-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProperties.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => { fetchPropertyDetail(prop.id); setActiveTab('tenants'); }}
                  className="card-hover p-6 cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-50 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-accent-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-accent-600 transition-colors">{prop.name}</h3>
                        <p className="text-sm text-slate-500">{prop.city}</p>
                      </div>
                    </div>
                    <span className="badge badge-gray capitalize text-xs">{prop.gender_pref}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-slate-900">{prop.total_beds || 0}</div>
                      <div className="text-xs text-slate-500">Total</div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-emerald-700">{prop.vacant_beds || 0}</div>
                      <div className="text-xs text-emerald-600">Vacant</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-amber-700">{prop.occupied_beds || 0}</div>
                      <div className="text-xs text-amber-600">Occupied</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{prop.address}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-accent-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="text-center py-16">
                <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900">No properties yet</h3>
                <p className="text-slate-500 mt-1">Add your first property to get started</p>
                <button onClick={() => setModal('addProperty')} className="btn-primary mt-4">
                  <Plus className="w-4 h-4" /> Add Property
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tenants Tab */}
        {activeTab === 'tenants' && selectedProperty && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="section-title">{selectedProperty.name}</h2>
                <p className="section-subtitle">Manage rooms, beds, and tenants</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setModal('addRoom')} className="btn-secondary text-sm">
                  <DoorOpen className="w-4 h-4" /> Add Room
                </button>
                <button onClick={() => setModal('addBed')} className="btn-secondary text-sm">
                  <Bed className="w-4 h-4" /> Add Bed
                </button>
                <button onClick={() => setModal('checkIn')} className="btn-primary text-sm">
                  <Users className="w-4 h-4" /> Check In
                </button>
              </div>
            </div>

            {/* Rooms & Beds */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedProperty.rooms?.map((room) => (
                <div key={room.id} className="card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <DoorOpen className="w-4 h-4 text-accent-600" />
                    <h3 className="font-semibold text-slate-900">Room {room.label}</h3>
                    <span className="text-xs text-slate-400 ml-auto">{room.beds?.length || 0} beds</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {room.beds?.map((bed) => (
                      <div
                        key={bed.id}
                        className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                          bed.occupied
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}
                        title={bed.occupied ? `${bed.tenant_name} — ${bed.move_in_date}` : 'Vacant'}
                      >
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-3.5 h-3.5" />
                          {bed.label}
                          {bed.occupied && <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />}
                        </div>
                      </div>
                    )) || <span className="text-sm text-slate-400">No beds added</span>}
                  </div>
                </div>
              )) || <p className="text-slate-500">No rooms yet. Add your first room.</p>}
            </div>

            {/* Active Tenants Table */}
            <div className="card overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent-600" /> Active Tenants
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="table-header">Tenant</th>
                      <th className="table-header">Contact</th>
                      <th className="table-header">Room / Bed</th>
                      <th className="table-header">Rent</th>
                      <th className="table-header">Since</th>
                      <th className="table-header">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-accent-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-accent-700">{t.renter_name?.[0]}</span>
                            </div>
                            <span className="font-medium">{t.renter_name}</span>
                          </div>
                        </td>
                        <td className="table-cell">{t.renter_phone}</td>
                        <td className="table-cell">
                          <span className="text-xs bg-slate-100 px-2 py-1 rounded-md">{t.room_label} / {t.bed_label}</span>
                        </td>
                        <td className="table-cell font-medium">₹{t.monthly_rent}</td>
                        <td className="table-cell text-slate-500">{t.move_in_date}</td>
                        <td className="table-cell">
                          <button onClick={() => handleCheckOut(t.id)} className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Check Out
                          </button>
                        </td>
                      </tr>
                    ))}
                    {tenants.length === 0 && (
                      <tr><td colSpan="6" className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        No active tenants
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tenants' && !selectedProperty && (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">Select a property</h3>
            <p className="text-slate-500 mt-1">Go to Overview and click on a property to manage tenants</p>
          </div>
        )}

        {/* Bills Tab */}
        {activeTab === 'bills' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="section-title">Payment Review</h2>
                <p className="section-subtitle">Review and confirm tenant payment proofs</p>
              </div>
              <button onClick={() => setModal('genBills')} className="btn-secondary">
                <Calendar className="w-4 h-4" /> Generate Bills
              </button>
            </div>

            {/* Pending Reviews */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Review ({bills.filter(b => b.status === 'submitted').length})</h3>
              {bills.filter(b => b.status === 'submitted').map((bill) => (
                <div key={bill.id} className="card p-6 border-l-4 border-accent-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
                          <span className="font-bold text-accent-700">{bill.renter_name?.[0]}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{bill.renter_name}</p>
                          <p className="text-sm text-slate-500">{bill.property_name} • {bill.room_label} / {bill.bed_label}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {bill.month}</span>
                        <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5 text-slate-400" /> Due: <strong>₹{bill.amount_due}</strong></span>
                        <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5 text-slate-400" /> Paid: <strong>₹{bill.amount_paid}</strong></span>
                        <span className="flex items-center gap-1"><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">UTR: {bill.utr}</span></span>
                      </div>
                      {bill.flags?.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {bill.flags.map((flag, i) => (
                            <span key={i} className="badge badge-red flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> {flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleReviewPayment(bill.id, 'confirm')} className="btn-primary text-sm">
                        <CheckCircle className="w-4 h-4" /> Confirm
                      </button>
                      <button onClick={() => handleReviewPayment(bill.id, 'reject')} className="btn-danger text-sm">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {bills.filter(b => b.status === 'submitted').length === 0 && (
                <div className="card p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-200 mx-auto mb-3" />
                  <p className="text-slate-500">All caught up! No pending payment reviews.</p>
                </div>
              )}
            </div>

            {/* All Bills */}
            <div className="card overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">All Bills</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="table-header">Tenant</th>
                      <th className="table-header">Property</th>
                      <th className="table-header">Month</th>
                      <th className="table-header">Amount</th>
                      <th className="table-header">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="table-cell font-medium">{bill.renter_name}</td>
                        <td className="table-cell">{bill.property_name}</td>
                        <td className="table-cell">{bill.month}</td>
                        <td className="table-cell font-medium">₹{bill.amount_due}</td>
                        <td className="table-cell">{getStatusBadge(bill.status)}</td>
                      </tr>
                    ))}
                    {bills.length === 0 && (
                      <tr><td colSpan="5" className="py-12 text-center text-slate-400">No bills generated yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal-content">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">
                {modal === 'addProperty' && 'Add New Property'}
                {modal === 'addRoom' && 'Add Room'}
                {modal === 'addBed' && 'Add Bed'}
                {modal === 'checkIn' && 'Check In Tenant'}
                {modal === 'genBills' && 'Generate Monthly Bills'}
              </h3>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6">
              {modal === 'addProperty' && (
                <PropertyForm
                  onSubmit={handleAddProperty}
                  onCancel={() => setModal(null)}
                  addToast={addToast}
                />
              )}

              {modal === 'addRoom' && (
                <form onSubmit={handleAddRoom} className="space-y-4">
                  <div>
                    <label className="label">Room Label</label>
                    <input name="label" className="input" placeholder="e.g., 101, A-Block" required />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="btn-primary flex-1">Add Room</button>
                    <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              )}

              {modal === 'addBed' && (
                <form onSubmit={handleAddBed} className="space-y-4">
                  <div>
                    <label className="label">Select Room</label>
                    <select name="room_id" className="input" required>
                      <option value="">Choose a room</option>
                      {selectedProperty?.rooms?.map(r => (
                        <option key={r.id} value={r.id}>Room {r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Bed Label</label>
                    <input name="label" className="input" placeholder="e.g., A1, Bed-1" required />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="btn-primary flex-1">Add Bed</button>
                    <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              )}

              {modal === 'checkIn' && (
                <form onSubmit={handleCheckIn} className="space-y-4">
                  <div>
                    <label className="label">Select Vacant Bed</label>
                    <select name="bed_id" className="input" required>
                      <option value="">Choose a bed</option>
                      {vacantBeds.map((bed) => {
                        const room = selectedProperty?.rooms?.find(r => r.beds?.some(b => b.id === bed.id));
                        return (
                          <option key={bed.id} value={bed.id}>
                            Room {room?.label} — Bed {bed.label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Tenant Name</label>
                      <input name="renter_name" className="input" placeholder="Full name" required />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input name="renter_phone" className="input" placeholder="10 digits" maxLength={10} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Monthly Rent (₹)</label>
                      <input name="monthly_rent" type="number" className="input" placeholder="5000" required />
                    </div>
                    <div>
                      <label className="label">Deposit (₹)</label>
                      <input name="deposit" type="number" className="input" placeholder="10000" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Move-in Date</label>
                    <input name="move_in_date" type="date" className="input" required />
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="btn-primary flex-1">Check In</button>
                    <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              )}

              {modal === 'genBills' && (
                <form onSubmit={handleGenerateBills} className="space-y-4">
                  <div>
                    <label className="label">Select Month</label>
                    <input name="month" type="month" className="input" required />
                  </div>
                  <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                    This will generate bills for all active tenants for the selected month.
                  </p>
                  <div className="flex gap-3">
                    <button type="submit" className="btn-primary flex-1">Generate Bills</button>
                    <button type="button" onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
