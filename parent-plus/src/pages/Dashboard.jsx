import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  FileText, 
  Pill, 
  Clock, 
  MapPin, 
  User, 
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Plus,
  Phone,
  Power,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Stethoscope
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '';

const Dashboard = () => {
  const { user, token, updateAvailability } = useContext(AuthContext);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Caretaker input fields for finishing a visit
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [visitSummary, setVisitSummary] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmittingSummary, setIsSubmittingSummary] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      // Determine endpoint based on role
      const endpoint = user.role === 'caretaker' ? `${API_URL}/api/bookings/caretaker` : `${API_URL}/api/bookings`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Server connection error: Received non-JSON response (HTTP ${response.status})`);
      }

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard bookings.');
      }

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Could not sync booking history from cloud db.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      fetchBookings();
    }
  }, [token, user?.role]);

  // Handle availability toggle
  const handleAvailabilityToggle = async () => {
    const nextStatus = !user.isAvailable;
    const result = await updateAvailability(nextStatus);
    if (!result.success) {
      setError(result.message || 'Failed to update availability status.');
    }
  };

  // Handle caretaker booking completion
  const handleCompleteBooking = async (e, bookingId) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!prescriptionText && !visitSummary) {
      setSubmitError('Please enter a prescription list or a general summary.');
      return;
    }

    setIsSubmittingSummary(true);
    try {
      const response = await fetch(`${API_URL}/api/bookings/${bookingId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prescriptionText,
          visitSummary,
        }),
      });

      const contentType = response.headers.get('content-type');
      let data = null;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error(`Server connection error: Check if backend is running (HTTP ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to complete booking.');
      }

      // Reset inputs & close drawer
      setPrescriptionText('');
      setVisitSummary('');
      setExpandedBookingId(null);
      
      // Refresh list
      fetchBookings();
    } catch (err) {
      console.error('Submit summary error:', err);
      setSubmitError(err.message || 'An error occurred while submitting.');
    } finally {
      setIsSubmittingSummary(false);
    }
  };

  // Handle booking cancellation (Parent)
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get('content-type');
      let data = null;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error(`Server connection error: Check if backend is running (HTTP ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to cancel booking.');
      }

      // Refresh list
      fetchBookings();
    } catch (err) {
      console.error('Cancel booking error:', err);
      setError(err.message || 'Failed to cancel the booking.');
      setLoading(false);
    }
  };

  // Format date display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // Format time display
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = timeStr.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHours = h % 12 || 12;
      return `${displayHours}:${minutes} ${ampm}`;
    } catch (err) {
      return timeStr;
    }
  };

  // Get status color coding
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'rgba(16, 185, 129, 0.1)',
          color: 'var(--success)',
          text: 'Completed'
        };
      case 'assigned':
        return {
          bg: 'rgba(79, 70, 229, 0.1)',
          color: 'var(--secondary)',
          text: 'Helper Assigned'
        };
      case 'cancelled':
        return {
          bg: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--error)',
          text: 'Cancelled'
        };
      default:
        return {
          bg: 'rgba(245, 158, 11, 0.1)',
          color: 'var(--accent)',
          text: 'Searching...'
        };
    }
  };

  // ----------------------------------------------------
  // RENDER DUAL DASHBOARDS BASED ON USER ROLE
  // ----------------------------------------------------

  // 1. CARETAKER DASHBOARD
  const renderCaretakerDashboard = () => {
    const activeJobs = bookings.filter(b => b.status === 'assigned');
    const completedJobs = bookings.filter(b => b.status === 'completed');

    return (
      <div className="animate-fade-in">
        {/* Availability Control panel */}
        <div className="glass-panel" style={{ 
          padding: '2rem', 
          borderRadius: 'var(--radius-lg)', 
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 100%)',
          border: '1px solid var(--border)'
        }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Caretaker Portal, {user?.name}!
            </h1>
            <p className="text-muted" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Availability Status: 
              <span style={{ 
                fontWeight: 700, 
                color: user?.isAvailable ? 'var(--success)' : 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: user?.isAvailable ? 'var(--success)' : '#94a3b8', display: 'inline-block' }}></span>
                {user?.isAvailable ? 'AVAILABLE FOR ASSIGNMENTS' : 'OFFLINE'}
              </span>
            </p>
          </div>
          
          <button 
            onClick={handleAvailabilityToggle} 
            className="btn"
            style={{ 
              backgroundColor: user?.isAvailable ? 'rgba(239, 68, 68, 0.1)' : 'var(--success)', 
              color: user?.isAvailable ? 'var(--error)' : 'white',
              border: user?.isAvailable ? '1px solid #fecaca' : 'none',
              padding: '0.75rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600
            }}
          >
            <Power size={18} />
            {user?.isAvailable ? 'Go Offline' : 'Go Available'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6" style={{ marginBottom: '2.5rem' }}>
          <div className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--secondary-light)', color: 'var(--secondary)', borderRadius: 'var(--radius-md)' }}>
              <Clock size={24} />
            </div>
            <div>
              <h4 className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Assigned Jobs</h4>
              <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{activeJobs.length}</span>
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <h4 className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Completed Care</h4>
              <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{completedJobs.length}</span>
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
              <Activity size={24} />
            </div>
            <div>
              <h4 className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Earnings</h4>
              <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>${(completedJobs.reduce((acc, job) => acc + job.estimatedCost, 0)).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid split */}
        <div className="dashboard-grid">
          {/* Sidebar Nav */}
          <div className="card glass-panel" style={{ height: 'fit-content', padding: '1rem', background: 'rgba(255,255,255,0.7)' }}>
            <nav className="sidebar-nav">
              <button 
                className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <Activity size={18} />
                <span>Active Assignments</span>
              </button>
              <button 
                className={`sidebar-link ${activeTab === 'prescriptions' ? 'active' : ''}`}
                onClick={() => setActiveTab('prescriptions')}
              >
                <FileCheck size={18} />
                <span>Uploaded History</span>
              </button>
              <button 
                className={`sidebar-link ${activeTab === 'medicines' ? 'active' : ''}`}
                onClick={() => setActiveTab('medicines')}
              >
                <Pill size={18} />
                <span>Medicine Guides</span>
              </button>
            </nav>
          </div>

          {/* Main content display */}
          <div className="card glass-panel" style={{ minHeight: '480px', padding: '2rem' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '350px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid var(--border)',
                  borderTop: '3px solid var(--primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '1rem'
                }}></div>
                <p className="text-muted">Fetching assigned jobs...</p>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="animate-fade-in">
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Assigned Visits ({activeJobs.length})</h2>

                    {activeJobs.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <HelpCircle size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Active Assignments</h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                          Toggle your availability to "Available" and check back shortly as customers make bookings.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {activeJobs.map((booking) => (
                          <div key={booking._id} style={{ 
                            border: '1px solid var(--border)', 
                            borderRadius: 'var(--radius-md)', 
                            padding: '1.5rem', 
                            background: 'var(--surface)',
                          }}>
                            <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <div>
                                <span style={{ padding: '0.2rem 0.6rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', fontWeight: 600, display: 'inline-block', marginBottom: '0.5rem' }}>
                                  {booking.serviceType}
                                </span>
                                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Client: {booking.userId?.name}</h3>
                                <div className="flex items-center gap-4 text-muted" style={{ fontSize: '0.85rem', flexWrap: 'wrap' }}>
                                  <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(booking.date)}</span>
                                  <span className="flex items-center gap-1"><Clock size={14} /> {formatTime(booking.time)}</span>
                                  <span className="flex items-center gap-1"><MapPin size={14} /> {booking.location}</span>
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => setExpandedBookingId(expandedBookingId === booking._id ? null : booking._id)}
                                className="btn btn-outline" 
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                              >
                                {expandedBookingId === booking._id ? 'Close Drawer' : 'Complete Visit'}
                                {expandedBookingId === booking._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </div>

                            {/* Client Phone details */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>
                              <Phone size={14} style={{ color: 'var(--secondary)' }} />
                              <span>Contact Client: <strong>{booking.userId?.phone || 'No phone provided'}</strong></span>
                            </div>

                            {/* EXPANDED COMPLETION FORM Drawer */}
                            {expandedBookingId === booking._id && (
                              <div className="animate-fade-in" style={{ 
                                marginTop: '1.5rem', 
                                borderTop: '1px solid var(--border)', 
                                paddingTop: '1.5rem',
                              }}>
                                <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <FileText size={18} style={{ color: 'var(--primary)' }} />
                                  Log Visit Report & Prescriptions
                                </h4>

                                {submitError && (
                                  <div className="alert alert-danger" style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}>
                                    <AlertCircle size={16} />
                                    <span>{submitError}</span>
                                  </div>
                                )}

                                <form onSubmit={(e) => handleCompleteBooking(e, booking._id)}>
                                  <div className="form-group">
                                    <label className="form-label">Consultation / Visit Summary Notes</label>
                                    <textarea
                                      className="form-input"
                                      style={{ minHeight: '90px', padding: '0.75rem', resize: 'vertical' }}
                                      placeholder="e.g. Accompanyed mother to Cardiology consultation. Doctor suggested regular ECG checks and revised BP tablets."
                                      value={visitSummary}
                                      onChange={(e) => setVisitSummary(e.target.value)}
                                      required
                                    />
                                  </div>

                                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label">Prescription Medicines List (Dosage & Instructions)</label>
                                    <textarea
                                      className="form-input"
                                      style={{ minHeight: '90px', padding: '0.75rem', resize: 'vertical' }}
                                      placeholder="e.g. 1. Amlodipine 5mg (1 Tab - Morning after breakfast)&#10;2. Telmisartan 40mg (1 Tab - Night after dinner)"
                                      value={prescriptionText}
                                      onChange={(e) => setPrescriptionText(e.target.value)}
                                      required
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <button 
                                      type="button" 
                                      className="btn btn-ghost" 
                                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                      onClick={() => {
                                        setExpandedBookingId(null);
                                        setPrescriptionText('');
                                        setVisitSummary('');
                                      }}
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      type="submit" 
                                      className="btn btn-secondary" 
                                      style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}
                                      disabled={isSubmittingSummary}
                                    >
                                      {isSubmittingSummary ? 'Submitting...' : 'Upload Prescription & Complete Job'}
                                    </button>
                                  </div>
                                </form>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'prescriptions' && (
                  <div className="animate-fade-in">
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Completed Log History ({completedJobs.length})</h2>

                    {completedJobs.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <FileCheck size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Reports Uploaded</h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                          Upload reports for assigned jobs to see your log history.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {completedJobs.map((booking) => (
                          <div key={booking._id} style={{ 
                            border: '1px solid var(--border)', 
                            borderRadius: 'var(--radius-md)', 
                            padding: '1.5rem', 
                            background: 'rgba(16, 185, 129, 0.01)'
                          }}>
                            <div className="flex justify-between items-start" style={{ flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                              <div>
                                <h4 style={{ fontSize: '1.1rem', margin: 0 }}>Client: {booking.userId?.name}</h4>
                                <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                                  {booking.serviceType} completed on {formatDate(booking.date)}
                                </p>
                              </div>
                              <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(16,185,129,0.1)', color: 'var(--success)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
                                Uploaded & Confirmed
                              </span>
                            </div>

                            <div style={{ background: 'var(--surface)', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}>
                              <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Visit Summary:</strong>
                              <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{booking.visitSummary}</p>
                            </div>

                            <div style={{ background: 'var(--surface)', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                              <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Prescribed Medicines:</strong>
                              <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{booking.prescriptionText}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'medicines' && (
                  <div className="animate-fade-in">
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Medicine Setup Guidelines</h2>
                    <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                      Standard procedures for managing patient medicines during visits:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 600 }}>1. Prescription Verification</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          Always confirm that tablet brands and dosages match the physical doctor's printout before filling pill boxes. If there is a change, log it immediately in the dashboard summary.
                        </p>
                      </div>
                      <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                        <h4 style={{ color: 'var(--secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>2. Safe Storage Protocols</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          Verify that temperature-sensitive medications (like insulin) are stored in the refrigerator, and children/pet access points are secured.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 2. PARENT CLIENT DASHBOARD
  const renderParentDashboard = () => {
    return (
      <div className="animate-fade-in">
        {/* Header Profile Greeting */}
        <div className="glass-panel" style={{ 
          padding: '2rem', 
          borderRadius: 'var(--radius-lg)', 
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 100%)',
          border: '1px solid var(--border)'
        }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Welcome back, {user?.name}!
            </h1>
            <p className="text-muted" style={{ fontSize: '1rem' }}>
              Remotely monitoring and companion planning for your family's healthcare checkups.
            </p>
          </div>
          <Link to="/booking" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
            <Plus size={18} />
            Book New Caretaker
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6" style={{ marginBottom: '2.5rem' }}>
          <div className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
              <Calendar size={24} />
            </div>
            <div>
              <h4 className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Active Bookings</h4>
              <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{bookings.filter(b => b.status === 'assigned' || b.status === 'pending').length}</span>
            </div>
          </div>
          
          <div className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem', background: 'var(--secondary-light)', color: 'var(--secondary)', borderRadius: 'var(--radius-md)' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Assigned Caretakers</h4>
              <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>
                {new Set(bookings.filter(b => b.caretakerId).map(b => b.caretakerId?._id)).size}
              </span>
            </div>
          </div>

          <div className="card glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <h4 className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Visits Completed</h4>
              <span style={{ fontSize: '1.75rem', fontWeight: 700 }}>{bookings.filter(b => b.status === 'completed').length}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid animate-fade-in delay-200">
          {/* Sidebar Nav */}
          <div className="card glass-panel" style={{ height: 'fit-content', padding: '1rem', background: 'rgba(255,255,255,0.7)' }}>
            <nav className="sidebar-nav">
              <button 
                className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <Activity size={18} />
                <span>Timeline Activity</span>
              </button>
              <button 
                className={`sidebar-link ${activeTab === 'appointments' ? 'active' : ''}`}
                onClick={() => setActiveTab('appointments')}
              >
                <Calendar size={18} />
                <span>Appointments</span>
              </button>
              <button 
                className={`sidebar-link ${activeTab === 'prescriptions' ? 'active' : ''}`}
                onClick={() => setActiveTab('prescriptions')}
              >
                <FileText size={18} />
                <span>Prescriptions</span>
              </button>
              <button 
                className={`sidebar-link ${activeTab === 'medicines' ? 'active' : ''}`}
                onClick={() => setActiveTab('medicines')}
              >
                <Pill size={18} />
                <span>Medicines</span>
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="card glass-panel" style={{ minHeight: '480px', padding: '2rem' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '350px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid var(--border)',
                  borderTop: '3px solid var(--primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '1rem'
                }}></div>
                <p className="text-muted">Fetching healthcare metrics...</p>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <div className="animate-fade-in">
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1.75rem' }}>Recent Timeline Activity</h2>
                    
                    {bookings.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <HelpCircle size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Activity Logged</h3>
                        <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                          Your parents do not have any logged caretaker activities yet.
                        </p>
                        <Link to="/booking" className="btn btn-outline" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                          Schedule a Visit
                        </Link>
                      </div>
                    ) : (
                      <div className="timeline">
                        {bookings.map((booking) => {
                          const statusBadge = getStatusBadge(booking.status);
                          return (
                            <div key={booking._id} className="timeline-item">
                              <div className={`timeline-icon ${booking.status === 'completed' ? 'completed' : booking.status === 'assigned' ? 'assigned' : 'pending'}`}>
                              </div>
                              <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.4)', border: '1px solid var(--border)' }}>
                                <div className="flex justify-between items-start mb-2" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                                  <h4 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 600 }}>{booking.serviceType}</h4>
                                  <span style={{ 
                                    padding: '0.2rem 0.6rem', 
                                    background: statusBadge.bg, 
                                    color: statusBadge.color, 
                                    borderRadius: 'var(--radius-full)', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 600 
                                  }}>
                                    {statusBadge.text}
                                  </span>
                                </div>
                                <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                                  Scheduled for {formatDate(booking.date)} at {formatTime(booking.time)} at {booking.location}.
                                </p>
                                
                                {/* Caretaker info showing contact phone number */}
                                {booking.caretakerId && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', background: 'var(--surface-alt)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', width: 'fit-content' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                      <User size={14} style={{ color: 'var(--primary)' }} />
                                      <span>Assigned Companion: <strong>{booking.caretakerId.name}</strong></span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                      <Phone size={14} style={{ color: 'var(--secondary)' }} />
                                      <span>Contact Caretaker: <strong>{booking.caretakerId.phone || 'N/A'}</strong></span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'appointments' && (
                  <div className="animate-fade-in">
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1.75rem' }}>Scheduled Appointments</h2>
                    
                    {bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <Calendar size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Upcoming Visits</h3>
                        <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                          There are no upcoming healthcare appointments scheduled.
                        </p>
                        <Link to="/booking" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
                          Book Appointment
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {bookings
                          .filter(b => b.status !== 'completed' && b.status !== 'cancelled')
                          .map((booking) => {
                            const statusBadge = getStatusBadge(booking.status);
                            return (
                              <div key={booking._id} style={{ 
                                border: '1px solid var(--border)', 
                                borderRadius: 'var(--radius-md)', 
                                padding: '1.5rem', 
                                background: 'var(--surface)', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '1rem',
                              }} className="appointment-card">
                                <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                                  <div>
                                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>{booking.serviceType}</h3>
                                    <div className="flex items-center gap-4 text-muted" style={{ fontSize: '0.85rem', flexWrap: 'wrap' }}>
                                      <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(booking.date)}</span>
                                      <span className="flex items-center gap-1"><Clock size={14} /> {formatTime(booking.time)}</span>
                                      <span className="flex items-center gap-1"><MapPin size={14} /> {booking.location}</span>
                                    </div>
                                  </div>
                                  <span style={{ 
                                    padding: '0.25rem 0.75rem', 
                                    background: statusBadge.bg, 
                                    color: statusBadge.color, 
                                    borderRadius: 'var(--radius-full)', 
                                    fontSize: '0.8rem', 
                                    fontWeight: 600 
                                  }}>
                                    {statusBadge.text}
                                  </span>
                                </div>
                                
                                {/* Caretaker info with contact phone */}
                                {booking.caretakerId && (
                                  <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    borderTop: '1px solid var(--border)',
                                    paddingTop: '0.75rem',
                                    fontSize: '0.85rem',
                                    flexWrap: 'wrap',
                                    gap: '0.5rem'
                                  }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Assigned Healthcare Companion:</span>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                      <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <User size={14} style={{ color: 'var(--primary)' }} />
                                        {booking.caretakerId.name}
                                      </span>
                                      <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Phone size={14} style={{ color: 'var(--secondary)' }} />
                                        Contact: {booking.caretakerId.phone || 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                )}
                                <div style={{ 
                                  display: 'flex', 
                                  justifyContent: 'flex-end', 
                                  borderTop: '1px solid var(--border)', 
                                  paddingTop: '0.75rem',
                                  marginTop: '0.5rem'
                                }}>
                                  <button
                                    onClick={() => handleCancelBooking(booking._id)}
                                    className="btn"
                                    style={{
                                      padding: '0.4rem 1rem',
                                      fontSize: '0.8rem',
                                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                                      color: 'var(--error)',
                                      border: '1px solid #fecaca',
                                      borderRadius: 'var(--radius-sm)',
                                      fontWeight: 600
                                    }}
                                  >
                                    Cancel Booking
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'prescriptions' && (
                  <div className="animate-fade-in">
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1.75rem' }}>Uploaded Caretaker Reports</h2>
                    
                    {bookings.filter(b => b.status === 'completed' && (b.prescriptionText || b.visitSummary)).length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <FileText size={48} style={{ color: 'var(--text-muted)', opacity: 0.5, marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Reports Uploaded</h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
                          Caretakers will upload prescriptions and visit summary notes directly after completing visits. You will see dosage directions and reports here.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {bookings
                          .filter(b => b.status === 'completed' && (b.prescriptionText || b.visitSummary))
                          .map((booking) => (
                            <div key={booking._id} style={{ 
                              border: '1px solid var(--border)', 
                              borderRadius: 'var(--radius-md)', 
                              padding: '1.5rem',
                              background: 'var(--surface)'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                  <h4 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--primary)' }}>{booking.serviceType}</h4>
                                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                    Completed by {booking.caretakerId?.name || booking.caretakerName} on {formatDate(booking.date)}
                                  </span>
                                </div>
                                <span style={{ padding: '0.2rem 0.6rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
                                  Visit Completed
                                </span>
                              </div>

                              {booking.visitSummary && (
                                <div style={{ marginBottom: '1rem', background: 'var(--surface-alt)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Visit Summary / Doctor Feedbacks:</span>
                                  <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-line', color: 'var(--text-main)' }}>{booking.visitSummary}</p>
                                </div>
                              )}

                              {booking.prescriptionText && (
                                <div style={{ background: 'rgba(13,148,136,0.02)', padding: '1rem', border: '1px dashed var(--primary)', borderRadius: 'var(--radius-sm)' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Prescribed Medications Logged:</span>
                                  <p style={{ fontSize: '0.9rem', whiteSpace: 'pre-line', color: 'var(--text-main)', fontFamily: 'var(--font-sans)', lineHeight: '1.7' }}>{booking.prescriptionText}</p>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'medicines' && (
                  <div className="animate-fade-in">
                    <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Organized Medicine Schedule</h2>
                    <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                      Syncs weekly pill box distribution updates logged by medicine caretakers.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'rgba(13,148,136,0.02)' }}>
                        <h4 style={{ color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                          <Clock size={16} />
                          Morning (8:00 AM)
                        </h4>
                        <ul className="text-muted" style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', lineHeight: '1.8' }}>
                          <li>Amlodipine 5mg (Blood Pressure - 1 Tab after food)</li>
                          <li>Vitamin D3 (Bone strength - 1 Capsule after food)</li>
                        </ul>
                      </div>
                      <div style={{ padding: '1.25rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'rgba(79,70,229,0.02)' }}>
                        <h4 style={{ color: 'var(--secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                          <Clock size={16} />
                          Night (8:00 PM)
                        </h4>
                        <ul className="text-muted" style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', lineHeight: '1.8' }}>
                          <li>Atorvastatin 10mg (Cholesterol control - 1 Tab after dinner)</li>
                          <li>Multi-Vitamin (1 Tab before sleeping)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container" style={{ padding: '9rem 1.5rem 5rem' }}>
      {error && (
        <div className="alert alert-danger animate-fade-in" style={{ marginBottom: '2rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {user?.role === 'caretaker' ? renderCaretakerDashboard() : renderParentDashboard()}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
