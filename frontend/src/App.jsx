import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { restoreUser } from './store/session';
import LoginFormPage from './components/Auth/LoginFormPage';
import SignupFormPage from './components/Auth/SignupFormPage';
import MainPage from './components/MainPage';
import './styles/global.css';

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  if (!isLoaded) return null;

  return (
    <Routes>
      {!user ? (
        <>
          <Route path="/login" element={<LoginFormPage />} />
          <Route path="/register" element={<SignupFormPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<MainPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;
