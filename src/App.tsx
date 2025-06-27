import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserForm from './pages/UserForm';
import styles from './App.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

// Optional: Include Toaster if Shadcn UI is installed
// import { Toaster } from '@/components/ui/toaster';

const App: React.FC = () => {
  // Use loggedInUser for authentication check
  const loggedInUser = localStorage.getItem('userRole');

  return (
    <Router>
      <Routes>
        <Route
          path="/dashboard"
          element={loggedInUser === 'master' ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route path="/dashboard/user/:id" element={<UserForm />} />
        <Route path="/dashboard/user/new" element={<UserForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;