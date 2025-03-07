import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import * as sessionActions from '../../store/session';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleClick = (event) => {
    event.preventDefault();
    navigate('/login');
  };

  
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Reset previous errors
    
    dispatch(sessionActions.signup({ 
      username, 
      email, 
      firstName, 
      lastName, 
      password 
    }))
    .then(() => {
      // Success! The user will be redirected automatically due to the 
      // <Navigate> component when the Redux store updates
    })
    .catch((response) => {
      // For debugging
      console.log("Signup error response:", response);
      
      // Check if we have specific errors for fields
      if (response && response.errors) {
        setErrors(response.errors);
      } else if (response && response.message) {
        // If we only have a general message, display it as a general error
        setErrors({ general: response.message });
      } else {
        // Fallback for unexpected error response structure
        setErrors({ general: "An error occurred during signup. Please try again." });
      }
    });
  };
  
  return (
    <>
    <div className="rift-logo">Rift</div>
    <div className="discord-auth-container">
      <div className="discord-auth-card">
        <h1 className="discord-auth-title">Create an account</h1>
        <p className="discord-auth-subtitle">Join our community!</p>

        {errors.general && <div className="discord-error general-error">{errors.general}</div>}

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
            <label className="discord-input-label">
              FIRST NAME
              <span className="discord-required">*</span>
            </label>
            <input
              type="text"
              className={`discord-input ${errors.firstName ? 'error' : ''}`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            {errors.firstName && <div className="discord-error">{errors.firstName}</div>}
          </div>

          <div className="discord-input-group">
            <label className="discord-input-label">
              LAST NAME
              <span className="discord-required">*</span>
              </label>
            <input
              type="text"
              className={`discord-input ${errors.lastName ? 'error' : ''}`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            {errors.lastName && <div className="discord-error">{errors.lastName}</div>}
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
            <a href="/login" onClick={handleClick} className="discord-auth-link">Log In</a>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}