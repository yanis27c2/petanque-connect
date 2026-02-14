import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Contests from './pages/Contests';
import Players from './pages/Players';
import Teams from './pages/Teams'; // Assuming this exists or will be created
import Messages from './pages/Messages';
import News from './pages/News';
import Results from './pages/Results';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import Profile from './pages/user/Profile';
import Settings from './pages/user/Settings';
import Notifications from './pages/Notifications';
import ContestDetail from './pages/ContestDetail';
import useAuthStore from './store/useAuthStore';
import socket from './api/socket';

const App = () => {
  const { checkAuth, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Global socket listeners can go here if needed
    socket.on('connect', () => {
      console.log('App connected to socket');
    });
    return () => {
      socket.off('connect');
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-500">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/concours" element={<Contests />} />
        <Route path="/contest/:id" element={<ContestDetail />} />
        <Route path="/joueurs" element={<Players />} />
        <Route path="/equipes" element={<Teams />} /> {/* Assuming Teams page exists */}
        <Route path="/messages" element={isAuthenticated ? <Messages /> : <Navigate to="/login" />} />
        <Route path="/communaute" element={<News />} />
        <Route path="/resultats" element={<Results />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/login" />} />
        <Route path="/notifications" element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
