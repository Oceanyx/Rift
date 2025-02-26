import { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import './LoginFormPage.css';

function LoginFormPage() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  if (sessionUser) return <Navigate to="/" replace={true} />;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    return dispatch(sessionActions.login({ credential, password })).catch(
      async (res) => {
        const data = await res.json();
        if (data?.errors) setErrors(data.errors);
      }
    );
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-card">
          <h1 className="login-title">Welcome back!</h1>
          <p className="login-subtitle">We're so excited to see you again!</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label required">
                Email or Phone number
              </label>
              <input
                className="form-input"
                type="text"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label required">
                Password
              </label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {errors.credential && <p className="form-error">{errors.credential}</p>}
            </div>
            
            <div className="form-group">
              <span className="forgot-password">Forgot your password?</span>
            </div>
            
            <button className="login-button" type="submit">Log In</button>
            
            <div className="login-footer">
              <span>Need an account?</span>
              <span className="register-link">Register</span>
            </div>
          </form>
        </div>
        
        <div className="qr-section">
          <h2 className="qr-title">Log in with QR Code</h2>
          <p className="qr-subtitle">Scan this with the Discord mobile app to log in instantly</p>
          <div className="qr-placeholder">QR Code</div>
          <p className="qr-help">Need help with QR code login? Make sure your Rift mobile app is up to date.</p>
        </div>
      </div>
    </div>
  );
}

export default LoginFormPage;