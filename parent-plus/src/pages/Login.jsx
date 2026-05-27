import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user, error: authError } = useContext(AuthContext);
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

    if (!email || !password) {
      setLocalError('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
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
        maxWidth: '450px',
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
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            borderRadius: '50%',
            marginBottom: '1rem'
          }}>
            <LogIn size={24} />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Sign in to manage your parents' care</p>
        </div>

        {(localError || authError) && (
          <div className="alert alert-danger animate-fade-in">
            <AlertCircle size={18} />
            <span>{localError || authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="input-icon" size={18} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6" style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <span className="text-muted">Don't have an account? </span>
          <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
