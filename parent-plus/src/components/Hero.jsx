import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Clock, UserPlus } from 'lucide-react';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-bg"></div>
      <div className="container">
        <div className="hero-content animate-fade-in">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#E9ECEF', color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 500, fontSize: '0.875rem' }}>
            <ShieldCheck size={18} />
            Verified & Trusted Caretakers
          </div>
          <h1 className="hero-title">
            Professional Healthcare Assistance for Your Parents
          </h1>
          <p className="hero-subtitle">
            Can't be there for every hospital visit? Book verified caretakers to accompany your elderly parents, manage medicines, and keep you updated in real-time.
          </p>
          <div className="flex items-center gap-4 mt-4" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
              Book a Caretaker
              <ArrowRight size={20} />
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12 delay-200 animate-fade-in" style={{ width: '100%', textAlign: 'left' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ color: 'var(--primary)' }}><Clock size={24} /></div>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Real-time Tracking</h3>
              </div>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>Track appointments and get live updates from the hospital.</p>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ color: 'var(--secondary)' }}><ShieldCheck size={24} /></div>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Verified Staff</h3>
              </div>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>Background-checked professionals with healthcare experience.</p>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ color: 'var(--accent)' }}><UserPlus size={24} /></div>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Medicine Management</h3>
              </div>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>Never miss a dose. We help with purchasing and scheduling.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
