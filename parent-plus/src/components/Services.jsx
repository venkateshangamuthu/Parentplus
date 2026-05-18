import React from 'react';
import { Stethoscope, Pill, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Services = () => {
  const services = [
    {
      title: 'Hospital Visit Assistance',
      description: 'A dedicated caretaker accompanies your parent from home to the hospital, handles registration, and safely brings them back.',
      icon: <Stethoscope size={32} />,
      features: ['Door-to-door cab transport', 'Doctor consultation attendance', 'Lab test accompaniment', 'Detailed post-visit report'],
      color: 'var(--primary)'
    },
    {
      title: 'Medicine Management',
      description: 'Ensure prescriptions are never missed. We purchase prescribed medicines and help set up regular pill schedules.',
      icon: <Pill size={32} />,
      features: ['Pharmacy purchase & delivery', 'Prescription upload to dashboard', 'Weekly pill box setup', 'Refill reminders'],
      color: 'var(--secondary)'
    },
    {
      title: 'Routine Health Checkups',
      description: 'Regular vital checks and physiotherapy assistance at home by certified medical attendants.',
      icon: <CalendarCheck size={32} />,
      features: ['BP & Sugar monitoring', 'Physiotherapy assistance', 'Dietary monitoring', 'Emergency alert setup'],
      color: 'var(--accent)'
    }
  ];

  return (
    <section className="section bg-surface-alt">
      <div className="container">
        <div className="text-center mb-8">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Our Healthcare Services</h2>
          <p className="text-muted" style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.125rem' }}>
            Comprehensive care solutions designed to give you peace of mind while ensuring your parents get the best assistance.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {services.map((service, index) => (
            <div key={index} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="service-icon-wrapper" style={{ color: service.color }}>
                {service.icon}
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{service.title}</h3>
              <p className="text-muted" style={{ marginBottom: '1.5rem', flex: 1 }}>{service.description}</p>
              
              <ul className="feature-list" style={{ marginBottom: '2rem' }}>
                {service.features.map((feature, i) => (
                  <li key={i} className="feature-item">
                    <CheckCircle2 size={18} className="feature-icon" style={{ color: service.color }} />
                    <span style={{ fontSize: '0.875rem' }}>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button className="btn btn-outline" style={{ width: '100%', marginTop: 'auto' }}>
                Book Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
