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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('apiKey');
    setIsLoading(false);
  }, []);

  const isAuthenticated = () => !!localStorage.getItem('apiKey');

  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          className={styles.spinner}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ peito: 0.5 }}
        />
      </div>
    );
  }

  return (
    <div className={styles.appContainer}> 
      <header className={styles.header}>
        <motion.img
          className={styles.logoImage}
          src="https://storage.googleapis.com/hostinger-horizons-assets-prod/a8d82ed5-8e56-4ea8-8bed-143e8e595a3d/cff3f6c0c2a3fa166f7947d1d442b113.png"
          alt="Renato Frutuoso - Consultoria Esportiva Online"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        />
      </header>
      <main className={styles.mainContent}>
        <AnimatePresence mode="wait">
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <motion.div
                      key="dashboard"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Dashboard />
                    </motion.div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/user/new"
                element={
                  <ProtectedRoute>
                    <motion.div
                      key="user-new"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <UserForm />
                    </motion.div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/user/:id"
                element={
                  <ProtectedRoute>
                    <motion.div
                      key="user-edit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <UserForm />
                    </motion.div>
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} />} />
              <Route
                path="*"
                element={
                  <motion.div
                    key="not-found"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h1 className={styles.notFound}>404 - Página não encontrada</h1>
                  </motion.div>
                }
              />
            </Routes>
          </Router>
        </AnimatePresence>
      </main>
      <footer className={styles.footer}>
        <motion.div
          className={styles.footerLine}
          initial={{ width: 0 }}
          animate={{ width: '6rem' }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />
        Renato Frutuoso - CREF 0000
      </footer>
    </div>
  );
};

export default App;