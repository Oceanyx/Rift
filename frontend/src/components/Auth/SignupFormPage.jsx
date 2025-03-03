import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import * as sessionActions from '../../store/session';
import './SignupFormPage.css';

export default function SignupFormPage() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.session.user);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(sessionActions.signup({ username, email, firstName, lastName, password }))
      .catch(async (res) => {
        const data = await res.json();
        data?.errors && setErrors(data.errors);
      });
  };

  return (
    <div className="discord-auth-container">
      <div className="discord-auth-card">
        <h1 className="discord-auth-title">Create an account</h1>
        <p className="discord-auth-subtitle">Join our community!</p>

        <form onSubmit={handleSubmit} className="discord-auth-form">
          <div className="discord-input-group">
            <label className="discord-input-label">
              USERNAME
              <span className="discord-required">*</span>
            </label>
            <input
              type="text"
              className={`discord-input ${errors.username ? 'error' : ''}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            {errors.username && <div className="discord-error">{errors.username}</div>}
          </div>

          <div className="discord-input-group">
            <label className="discord-input-label">
              EMAIL
              <span className="discord-required">*</span>
            </label>
            <input
              type="email"
              className={`discord-input ${errors.email ? 'error' : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && <div className="discord-error">{errors.email}</div>}
          </div>

          <div className="discord-input-group">
            <label className="discord-input-label">FIRST NAME</label>
            <input
              type="text"
              className="discord-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div className="discord-input-group">
            <label className="discord-input-label">LAST NAME</label>
            <input
              type="text"
              className="discord-input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
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
            Sign Up
          </button>

          <div className="discord-auth-footer">
            <span>Already have an account?</span>
            <a href="/login" className="discord-auth-link">Log In</a>
          </div>
        </form>
      </div>
    </div>
  );
}
