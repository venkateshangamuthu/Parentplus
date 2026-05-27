import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, UserPlus, AlertCircle, Users } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent'); // 'parent' or 'caretaker'
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, user, error: authError } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!name || !email || !password) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, password, phone, role);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '8rem 1.5rem 5rem',
      position: 'relative',
    }}>
      <div className="card glass-panel animate-fade-in" style={{
        maxWidth: '500px',
        width: '100%',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div className="text-center mb-8">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            background: 'var(--secondary-light)',
            color: 'var(--secondary)',
            borderRadius: '50%',
            marginBottom: '1rem'
          }}>
            <UserPlus size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Create Account</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Join ParentPlus and hire or work as a verified healthcare helper</p>
        </div>

        {(localError || authError) && (
          <div className="alert alert-danger animate-fade-in">
            <AlertCircle size={18} />
            <span>{localError || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Account Type Selector */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Join as a...</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className={`btn ${role === 'parent' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1, padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setRole('parent')}
              >
                Parent Client
              </button>
              <button
                type="button"
                className={`btn ${role === 'caretaker' ? 'btn-secondary' : 'btn-outline'}`}
                style={{ flex: 1, padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setRole('caretaker')}
              >
                Caretaker Partner
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <User className="input-icon" size={18} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail className="input-icon" size={18} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number (Required for Caretakers)</label>
            <div className="input-wrapper">
              <input
                type="tel"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required={role === 'caretaker'}
              />
              <Phone className="input-icon" size={18} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <input
                type="password"
                className="form-input"
                placeholder="•••••••• (Min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="input-icon" size={18} />
            </div>
          </div>

          <button
            type="submit"
            className={role === 'parent' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ width: '100%', padding: '0.85rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-6" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <span className="text-muted">Already have an account? </span>
          <Link to="/login" style={{ fontWeight: 600 }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
