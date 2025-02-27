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
          <h1 className="login-title">COSMIC CONNECT</h1>
          <p className="login-subtitle">Enter your coordinates to join the interstellar network</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label required">
                COMM ID
              </label>
              <input
                className="form-input"
                type="text"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                required
                placeholder="your.id@cosmic.space"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label required">
                ACCESS KEY
              </label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
              />
              {errors.credential && <p className="form-error">{errors.credential}</p>}
            </div>
            
            <div className="form-group">
              <span className="forgot-password">Forgot your access key?</span>
            </div>
            
            <button className="login-button" type="submit">Initialize Connection</button>
            
            <div className="login-footer">
              <span>New to the galaxy?</span>
              <span className="register-link">Create Star ID</span>
            </div>
          </form>
        </div>
        
        <div className="qr-section">
          <h2 className="qr-title">QUANTUM LINK</h2>
          <p className="qr-subtitle">Scan with your StarGazer device for instant wormhole access</p>
          <div className="qr-placeholder">QR Code</div>
          <p className="qr-help">Make sure your StarGazer firmware is updated to v4.2+</p>
        </div>
      </div>
    </div>
  );
}

export default LoginFormPage;