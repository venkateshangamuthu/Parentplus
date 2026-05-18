import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Stethoscope } from 'lucide-react';

const Booking = () => {
  const [step, setStep] = useState(1);

  const handleNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    setStep(3);
  };

  return (
    <div className="container" style={{ padding: '8rem 1.5rem 5rem', maxWidth: '800px' }}>
      <div className="text-center mb-8">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Book a Caretaker</h1>
        <p className="text-muted">Schedule reliable assistance for your parents.</p>
      </div>

      <div className="card animate-fade-in" style={{ padding: '2rem' }}>
        {step === 1 && (
          <form onSubmit={handleNext}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              Service Details
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Service Type</label>
                <select style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'var(--font-sans)' }}>
                  <option>Hospital Visit Assistance</option>
                  <option>Medicine Management</option>
                  <option>Routine Checkup</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Hospital/Location</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="text" placeholder="e.g. Apollo Hospital" style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'var(--font-sans)' }} />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Date</label>
                <div style={{ position: 'relative' }}>
                  <CalendarIcon size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="date" style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'var(--font-sans)' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Time</label>
                <div style={{ position: 'relative' }}>
                  <Clock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="time" style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontFamily: 'var(--font-sans)' }} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Continue
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
             <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
              Review Booking
            </h2>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem' }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted">Service</span>
                <span style={{ fontWeight: 500 }}>Hospital Visit Assistance</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted">Location</span>
                <span style={{ fontWeight: 500 }}>Apollo Hospital</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted">Date & Time</span>
                <span style={{ fontWeight: 500 }}>25 May 2026, 10:00 AM</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', margin: '1rem 0' }}></div>
              <div className="flex justify-between items-center">
                <span className="text-muted">Estimated Cost</span>
                <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)' }}>$45.00</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>Back</button>
              <button onClick={handleConfirm} className="btn btn-primary" style={{ flex: 2 }}>Confirm Booking</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center animate-fade-in py-8" style={{ padding: '3rem 0' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Stethoscope size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Booking Confirmed!</h2>
            <p className="text-muted" style={{ marginBottom: '2rem' }}>
              Your caretaker request has been received. We will assign a verified professional shortly.
            </p>
            <button onClick={() => window.location.href='/dashboard'} className="btn btn-primary">
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
