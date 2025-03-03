import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import * as sessionActions from '../../store/session';
import './LoginFormPage.css';

export default function LoginFormPage() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.session.user);
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(sessionActions.login({ credential, password }))
      .catch(async (res) => {
        const data = await res.json();
        data?.errors && setErrors(data.errors);
      });
  };

  return (
    <div className="discord-auth-container">
      <div className="discord-auth-card">
        <h1 className="discord-auth-title">Welcome back!</h1>
        <p className="discord-auth-subtitle">We&apos;re so excited to see you again!</p>

        <form onSubmit={handleSubmit} className="discord-auth-form">
          <div className="discord-input-group">
            <label className="discord-input-label">
              EMAIL OR USERNAME
              <span className="discord-required">*</span>
            </label>
            <input
              type="text"
              className={`discord-input ${errors.credential ? 'error' : ''}`}
              value={credential}
              onChange={(e) => setCredential(e.target.value)}
              required
            />
            {errors.credential && <div className="discord-error">{errors.credential}</div>}
          </div>

          <div className="discord-input-group">
            <label className="discord-input-label">
              PASSWORD
              <span className="discord-required">*</span>
            </label>
            <input
              type="password"
              className={`discord-input ${errors.password ? 'error' : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && <div className="discord-error">{errors.password}</div>}
          </div>

          <button type="submit" className="discord-auth-button">
            Log In
          </button>

          <div className="discord-auth-footer">
            <span>Need an account?</span>
            <a href="/register" className="discord-auth-link">Register</a>
          </div>
        </form>
      </div>
    </div>
  );
}