import React, { useState } from 'react';
import { Activity, Calendar, FileText, Pill, Clock, MapPin } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container" style={{ padding: '8rem 1.5rem 5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Family Dashboard</h1>
        <p className="text-muted">Track your parent's healthcare journey remotely.</p>
      </div>

      <div className="dashboard-grid">
        {/* Sidebar */}
        <div className="card" style={{ height: 'fit-content', padding: '1rem' }}>
          <nav className="sidebar-nav">
            <button 
              className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Activity size={20} /> Overview
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'appointments' ? 'active' : ''}`}
              onClick={() => setActiveTab('appointments')}
            >
              <Calendar size={20} /> Appointments
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'prescriptions' ? 'active' : ''}`}
              onClick={() => setActiveTab('prescriptions')}
            >
              <FileText size={20} /> Prescriptions
            </button>
            <button 
              className={`sidebar-link ${activeTab === 'medicines' ? 'active' : ''}`}
              onClick={() => setActiveTab('medicines')}
            >
              <Pill size={20} /> Medicines
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="card" style={{ minHeight: '500px' }}>
          {activeTab === 'overview' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recent Activity</h2>
              
              <div style={{ position: 'relative', paddingLeft: '2rem', borderLeft: '2px solid var(--border)' }}>
                {/* Timeline Item 1 */}
                <div style={{ position: 'relative', marginBottom: '2rem' }}>
                  <div style={{ position: 'absolute', left: '-2.5rem', background: 'var(--surface)', padding: '0.2rem', borderRadius: '50%', color: 'var(--primary)' }}>
                    <CheckCircleIcon />
                  </div>
                  <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 style={{ margin: 0 }}>Hospital Visit Completed</h4>
                      <span className="text-muted" style={{ fontSize: '0.875rem' }}>Today, 2:30 PM</span>
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      Caretaker Rahul safely dropped Mrs. Sharma back home.
                    </p>
                    <div className="flex items-center gap-2 text-primary" style={{ fontSize: '0.875rem' }}>
                      <MapPin size={16} /> City Hospital, Cardiology Dept
                    </div>
                  </div>
                </div>

                {/* Timeline Item 2 */}
                <div style={{ position: 'relative', marginBottom: '2rem' }}>
                  <div style={{ position: 'absolute', left: '-2.5rem', background: 'var(--surface)', padding: '0.2rem', borderRadius: '50%', color: 'var(--secondary)' }}>
                    <PillIcon />
                  </div>
                  <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 style={{ margin: 0 }}>Medicine Restocked</h4>
                      <span className="text-muted" style={{ fontSize: '0.875rem' }}>Yesterday</span>
                    </div>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                      Monthly BP medications have been purchased and weekly pill boxes are organized.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Upcoming Appointments</h2>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 style={{ marginBottom: '0.5rem' }}>Dr. A. Gupta - General Checkup</h3>
                    <div className="flex items-center gap-4 text-muted" style={{ fontSize: '0.875rem' }}>
                      <span className="flex items-center gap-1"><Calendar size={16} /> 24th May, 2026</span>
                      <span className="flex items-center gap-1"><Clock size={16} /> 10:00 AM</span>
                    </div>
                  </div>
                  <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', borderRadius: 'var(--radius-full)', fontSize: '0.875rem', fontWeight: 500 }}>
                    Caretaker Assigned
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'prescriptions' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Prescriptions</h2>
              <p className="text-muted">No new prescriptions uploaded.</p>
            </div>
          )}

          {activeTab === 'medicines' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Medicine Schedule</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Morning (8:00 AM)</h4>
                  <ul className="text-muted" style={{ paddingLeft: '1.5rem', fontSize: '0.875rem' }}>
                    <li>Amlodipine 5mg (After food)</li>
                    <li>Vitamin D3 (After food)</li>
                  </ul>
                </div>
                <div style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>Night (8:00 PM)</h4>
                  <ul className="text-muted" style={{ paddingLeft: '1.5rem', fontSize: '0.875rem' }}>
                    <li>Atorvastatin 10mg (After food)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper dummy icons
const CheckCircleIcon = () => <Activity size={24} />;
const PillIcon = () => <Pill size={24} />;

export default Dashboard;
