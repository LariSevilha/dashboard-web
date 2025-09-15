import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import UserDetails from './pages/UserDetails';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<div />} /> {/* Default dashboard view */}
          <Route path="user/new" element={<div />} /> {/* Handled by Dashboard */}
          <Route path="user/:id" element={<div />} /> {/* Handled by Dashboard */}
          <Route path="user/:id/view" element={<UserDetails />} />
          <Route path="master/new" element={<div />} /> {/* Handled by Dashboard */}
          <Route path="master/:id" element={<div />} /> {/* Handled by Dashboard */}
          <Route path="metrics" element={<div />} /> {/* Handled by Dashboard */}
          <Route path="settings" element={<div />} /> {/* Handled by Dashboard */}
          <Route path="exercises" element={<div />} /> {/* Handled by Dashboard */}
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;