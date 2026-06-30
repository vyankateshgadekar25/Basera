import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { Link } from 'react-router-dom';
import {
  Home, BedDouble, Calendar, IndianRupee, CreditCard, Star, CheckCircle, XCircle, Clock,
  AlertTriangle, ArrowRight, Building2, MapPin, Shield, Sparkles, MessageSquare,
  Upload, Eye, EyeOff, ChevronRight, User, DoorOpen
} from 'lucide-react';

export default function RenterDashboard() {
  const [stay, setStay] = useState(null);
  const [bills, setBills] = useState([]);
  const [archivedStays, setArchivedStays] = useState([]);
  const [activeTab, setActiveTab] = useState('stay');
  const [payModal, setPayModal] = useState(null);
  const [ratingModal, setRatingModal] = useState(null);
  const [showUtr, setShowUtr] = useState(false);
  const api = useApi();
  const { addToast } = useToast();

  const fetchStay = async () => {
    try {
      const res = await api.get('/renter/my-stay');
      setStay(res.data);
    } catch (err) {
      setStay(null);
    }
  };

  const fetchBills = async () => {
    const res = await api.get('/payments/my-bills');
    setBills(res.data);
  };

  const fetchArchived = async () => {
    const res = await api.get('/renter/my-archived-stays');
    setArchivedStays(res.data);
  };

  useEffect(() => {
    fetchStay();
    fetchBills();
    fetchArchived();
  }, []);

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      bill_id: payModal,
      amount_paid: parseFloat(form.amount_paid.value),
      utr: form.utr.value,
      proof_hash: form.proof_hash.value || undefined,
    };
    const res = await api.post('/payments/submit', data);
    setPayModal(null);
    fetchBills();
    addToast(res.data.message, 'success');
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      property_id: ratingModal.property_id,
      tenancy_id: ratingModal.id,
      cleanliness: parseInt(form.cleanliness.value),
      responsiveness: parseInt(form.responsiveness.value),
      safety: parseInt(form.safety.value),
      comment: form.comment.value || undefined,
    };
    await api.post('/ratings', data);
    setRatingModal(null);
    addToast('Rating submitted successfully', 'success');
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: <span className="badge badge-yellow flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>,
      submitted: <span className="badge badge-blue flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Under Review</span>,
      paid: <span className="badge badge-green flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Paid</span>,
      rejected: <span className="badge badge-red flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>,
    };
    return map[status] || <span className="badge badge-gray">{status}</span>;
  };

  const pendingCount = bills.filter(b => b.status === 'pending' || b.status === 'rejected').length;
  const paidCount = bills.filter(b => b.status === 'paid').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your stay, bills, and ratings</p>
          </div>
          <Link to="/" className="btn-secondary text-sm">
            <Building2 className="w-4 h-4" /> Browse Properties
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center mb-2">
              <CreditCard className="w-5 h-5 text-accent-600" />
            </div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending Bills</div>
          </div>
          <div className="stat-card">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="stat-value">{paidCount}</div>
            <div className="stat-label">Paid Bills</div>
          </div>
          <div className="stat-card">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-2">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div className="stat-value">{archivedStays.length}</div>
            <div className="stat-label">Past Stays</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-slate-200/60 w-fit">
          {[
            { id: 'stay', label: 'My Stay', icon: Home },
            { id: 'bills', label: 'Bills', icon: CreditCard },
            { id: 'history', label: 'History', icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

        {/* My Stay Tab */}
        {activeTab === 'stay' && (
          <div>
            {stay ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="card p-6 md:p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-50 rounded-2xl flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-accent-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">{stay.property_name}</h2>
                          <div className="flex items-center gap-1 text-slate-500 mt-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-sm">{stay.address}, {stay.city}</span>
                          </div>
                        </div>
                      </div>
                      <span className="badge badge-green flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <DoorOpen className="w-5 h-5 text-accent-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-slate-900">{stay.room_label}</div>
                        <div className="text-xs text-slate-500">Room</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <BedDouble className="w-5 h-5 text-accent-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-slate-900">{stay.bed_label}</div>
                        <div className="text-xs text-slate-500">Bed</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <IndianRupee className="w-5 h-5 text-emerald-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-slate-900">₹{stay.monthly_rent}</div>
                        <div className="text-xs text-slate-500">Monthly Rent</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <Calendar className="w-5 h-5 text-accent-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-slate-900">{stay.move_in_date}</div>
                        <div className="text-xs text-slate-500">Move-in Date</div>
                      </div>
                    </div>

                    {stay.deposit > 0 && (
                      <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-sm text-amber-800 flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Security deposit paid: <strong>₹{stay.deposit}</strong>
                        </p>
                      </div>
                    )}
                  </div>

                  {stay.rules && (
                    <div className="card p-6">
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-accent-600" /> Property Rules
                      </h3>
                      <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {stay.rules}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="card p-6 sticky top-24">
                    <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button onClick={() => setActiveTab('bills')} className="w-full btn-primary justify-between">
                        <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Pay Bills</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <Link to="/" className="w-full btn-secondary justify-between">
                        <span className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Browse More</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Home className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No active stay</h3>
                <p className="text-slate-500 mt-1 mb-6">You haven't checked into any property yet</p>
                <Link to="/" className="btn-primary">
                  <Building2 className="w-4 h-4" /> Find a PG/Hostel
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Bills Tab */}
        {activeTab === 'bills' && (
          <div className="space-y-6">
            <div>
              <h2 className="section-title">My Bills</h2>
              <p className="section-subtitle">View and pay your monthly rent bills</p>
            </div>

            <div className="space-y-4">
              {bills.map((bill) => (
                <div key={bill.id} className="card p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-accent-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{bill.property_name}</p>
                          <p className="text-sm text-slate-500">{bill.month} • Room {bill.room_label}, Bed {bill.bed_label}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-3">
                        <span className="text-sm flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                          Due: <strong className="text-slate-900">₹{bill.amount_due}</strong>
                        </span>
                        {bill.amount_paid && (
                          <span className="text-sm flex items-center gap-1">
                            <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                            Paid: <strong className="text-emerald-600">₹{bill.amount_paid}</strong>
                          </span>
                        )}
                        {bill.utr && (
                          <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded flex items-center gap-1">
                            UTR: {showUtr ? bill.utr : '••••••••'}
                            <button onClick={() => setShowUtr(!showUtr)} className="text-accent-600">
                              {showUtr ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </span>
                        )}
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
                      {bill.status === 'rejected' && (
                        <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                          <p className="text-sm text-red-700 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            Your payment was rejected. Please submit again with correct details.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(bill.status)}
                      {(bill.status === 'pending' || bill.status === 'rejected') && (
                        <button onClick={() => setPayModal(bill.id)} className="btn-primary text-sm mt-2">
                          <CreditCard className="w-4 h-4" /> Pay Now
                        </button>
                      )}
                      {bill.status === 'submitted' && (
                        <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Awaiting owner review
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pay Modal Inline */}
                  {payModal === bill.id && (
                    <form onSubmit={handleSubmitPayment} className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-amber-800">Important</p>
                          <p className="text-sm text-amber-700">This is not automatic proof. Your owner will review and confirm your payment.</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="label">Amount Paid (₹)</label>
                          <input name="amount_paid" type="number" className="input" placeholder={bill.amount_due} required />
                        </div>
                        <div>
                          <label className="label">UTR / Transaction ID</label>
                          <input name="utr" className="input" placeholder="e.g., UPI123456789" required />
                        </div>
                        <div>
                          <label className="label">Screenshot Hash (optional)</label>
                          <input name="proof_hash" className="input" placeholder="SHA256 hash" />
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button type="submit" className="btn-primary">
                          <Upload className="w-4 h-4" /> Submit Payment Proof
                        </button>
                        <button type="button" onClick={() => setPayModal(null)} className="btn-secondary">Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
              {bills.length === 0 && (
                <div className="card p-12 text-center">
                  <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900">No bills yet</h3>
                  <p className="text-slate-500 mt-1">Your owner will generate bills for your stay</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div>
              <h2 className="section-title">Past Stays</h2>
              <p className="section-subtitle">Rate properties you've stayed at</p>
            </div>

            <div className="space-y-4">
              {archivedStays.map((stay) => (
                <div key={stay.id} className="card p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl flex items-center justify-center">
                        <Building2 className="w-7 h-7 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{stay.property_name}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {stay.address}, {stay.city}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Room {stay.room_label}, Bed {stay.bed_label} • {stay.move_in_date} to {stay.move_out_date}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setRatingModal(stay)} className="btn-secondary text-sm">
                      <Star className="w-4 h-4" /> Rate Property
                    </button>
                  </div>

                  {ratingModal?.id === stay.id && (
                    <form onSubmit={handleSubmitRating} className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                      <h3 className="font-semibold text-slate-900">Rate {stay.property_name}</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { name: 'cleanliness', label: 'Cleanliness', icon: Sparkles },
                          { name: 'responsiveness', label: 'Responsiveness', icon: MessageSquare },
                          { name: 'safety', label: 'Safety', icon: Shield },
                        ].map((field) => (
                          <div key={field.name}>
                            <label className="label flex items-center gap-1.5">
                              <field.icon className="w-3.5 h-3.5 text-slate-400" /> {field.label}
                            </label>
                            <select name={field.name} className="input" required>
                              <option value="">Select</option>
                              {[5, 4, 3, 2, 1].map((n) => (
                                <option key={n} value={n}>{n} — {n === 5 ? 'Excellent' : n === 1 ? 'Poor' : 'Average'}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="label">Comment (optional)</label>
                        <textarea name="comment" className="input" rows="3" placeholder="Share your experience..." />
                      </div>
                      <div className="flex gap-3">
                        <button type="submit" className="btn-primary">
                          <Star className="w-4 h-4" /> Submit Rating
                        </button>
                        <button type="button" onClick={() => setRatingModal(null)} className="btn-secondary">Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
              {archivedStays.length === 0 && (
                <div className="card p-12 text-center">
                  <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900">No past stays</h3>
                  <p className="text-slate-500 mt-1">Complete a stay to rate the property</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
