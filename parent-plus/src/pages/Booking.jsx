import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, MapPin, Stethoscope, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Booking = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState('Hospital Visit Assistance');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [caretakers, setCaretakers] = useState([]);
  const [selectedCaretakerId, setSelectedCaretakerId] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Fetch available caretakers list
  useEffect(() => {
    const fetchAvailableCaretakers = async () => {
      try {
        const response = await fetch('/api/bookings/caretakers/available', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCaretakers(data);
        }
      } catch (err) {
        console.error('Error fetching available caretakers:', err);
      }
    };

    if (token) {
      fetchAvailableCaretakers();
    }
  }, [token]);

  const handleNext = (e) => {
    e.preventDefault();
    setError('');

    if (!location) {
      setError('Please provide the hospital or appointment location.');
      return;
    }
    if (!date || !time) {
      setError('Please select a valid date and time.');
      return;
    }
    
    setStep(2);
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceType,
          location,
          date,
          time,
          caretakerId: selectedCaretakerId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit booking.');
      }

      setConfirmedBooking(data);
      setStep(3);
    } catch (err) {
      console.error('Booking submission error:', err);
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to calculate cost display on UI
  const getCostEstimate = () => {
    switch (serviceType) {
      case 'Hospital Visit Assistance':
        return 45.00;
      case 'Medicine Management':
        return 30.00;
      case 'Routine Checkup':
        return 25.00;
      default:
        return 40.00;
    }
  };

  // Format date display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
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

  const getSelectedCaretakerName = () => {
    if (!selectedCaretakerId) return 'Assign Automatically (First Available)';
    const chosen = caretakers.find(c => c._id === selectedCaretakerId);
    return chosen ? `${chosen.name} (${chosen.phone || 'No phone'})` : 'Auto-Assign';
  };

  return (
    <div className="container" style={{ padding: '9rem 1.5rem 5rem', maxWidth: '800px' }}>
      <div className="text-center mb-8">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Book a Caretaker</h1>
        <p className="text-muted" style={{ fontSize: '1.1rem' }}>Schedule real-time assistance and companion care for your parents.</p>
      </div>

      {error && (
        <div className="alert alert-danger animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="card glass-panel animate-fade-in" style={{ padding: '2.5rem', boxShadow: 'var(--shadow-md)', maxWidth: '650px', margin: '0 auto' }}>
        {step === 1 && (
          <form onSubmit={handleNext}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} style={{ color: 'var(--primary)' }} />
              Service Details
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Service Type</label>
                <select 
                  className="form-select"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                >
                  <option>Hospital Visit Assistance</option>
                  <option>Medicine Management</option>
                  <option>Routine Checkup</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Location / Address</label>
                <div className="input-wrapper">
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Apollo Hospital" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                  <MapPin className="input-icon" size={18} />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Date</label>
                <div className="input-wrapper">
                  <input 
                    type="date" 
                    className="form-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                  <CalendarIcon className="input-icon" size={18} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Time</label>
                <div className="input-wrapper">
                  <input 
                    type="time" 
                    className="form-input"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                  <Clock className="input-icon" size={18} />
                </div>
              </div>
            </div>

            {/* Caretaker Selection Dropdown */}
            <div className="form-group" style={{ marginBottom: '2.5rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <UserCheck size={16} style={{ color: 'var(--primary)' }} />
                Select Companion Caretaker (Choose Preferred)
              </label>
              <select
                className="form-select"
                value={selectedCaretakerId}
                onChange={(e) => setSelectedCaretakerId(e.target.value)}
              >
                <option value="">Auto-Assign Best Available Caretaker</option>
                {caretakers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} (Contact: {c.phone || 'No Phone'})
                  </option>
                ))}
              </select>
              <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.4rem', paddingLeft: '0.2rem' }}>
                * Select one of our active online caretakers. If you choose auto-assign, the system will allocate our closest available partner.
              </p>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
              Continue
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
             <h2 style={{ fontSize: '1.35rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem' }}>
              Review Booking
            </h2>
            <div className="glass-panel" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)', marginBottom: '2.25rem', background: 'rgba(255, 255, 255, 0.4)' }}>
              <div className="details-list">
                <div className="details-row">
                  <span className="text-muted">Requested Service</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{serviceType}</span>
                </div>
                <div className="details-row">
                  <span className="text-muted">Target Location</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{location}</span>
                </div>
                <div className="details-row">
                  <span className="text-muted">Date</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatDate(date)}</span>
                </div>
                <div className="details-row">
                  <span className="text-muted">Start Time</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatTime(time)}</span>
                </div>
                <div className="details-row">
                  <span className="text-muted">Chosen Caretaker</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{getSelectedCaretakerName()}</span>
                </div>
                <div className="details-row" style={{ borderBottom: 'none', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  <span className="text-muted" style={{ fontWeight: 500 }}>Estimated Cost</span>
                  <span style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary)' }}>
                    ${getCostEstimate().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setStep(1)} 
                className="btn btn-outline" 
                style={{ flex: 1 }}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button 
                onClick={handleConfirm} 
                className="btn btn-primary" 
                style={{ flex: 2 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Confirming...' : 'Confirm & Book'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && confirmedBooking && (
          <div className="text-center animate-fade-in py-8" style={{ padding: '2rem 0' }}>
            <div style={{ 
              width: '84px', 
              height: '84px', 
              background: 'rgba(16, 185, 129, 0.1)', 
              color: 'var(--success)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.75rem',
              boxShadow: '0 0 0 8px rgba(16, 185, 129, 0.05)'
            }}>
              <Stethoscope size={38} />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Booking Confirmed!</h2>
            <p className="text-muted" style={{ marginBottom: '2rem', maxWidth: '450px', margin: '0 auto 2rem', fontSize: '0.95rem' }}>
              Your caretaker request has been registered in our database. We have successfully assigned a verified healthcare companion.
            </p>
            
            <div className="glass-panel" style={{ padding: '1.25rem 1.75rem', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '2.5rem', background: 'rgba(255,255,255,0.3)', maxWidth: '480px', margin: '0 auto 2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Assigned Caretaker</span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{confirmedBooking.caretakerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Service Type</span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{confirmedBooking.serviceType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>Location</span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{confirmedBooking.location}</span>
              </div>
            </div>

            <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
