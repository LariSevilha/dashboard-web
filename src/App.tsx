// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserForm from './pages/UserForm';
import { ThemeProvider } from './pages/ThemeProvider';

// Componente para verificar autenticação
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apiKey = localStorage.getItem('apiKey');
  const deviceId = localStorage.getItem('deviceId');
  const userRole = localStorage.getItem('userRole');
  
  // Verificar se o usuário está logado
  const isAuthenticated = !!(apiKey && deviceId && userRole);
  
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, {
    apiKey: !!apiKey,
    deviceId: !!deviceId, 
    userRole
  });
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/:id"
            element={
              <ProtectedRoute>
                <UserForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/new"
            element={
              <ProtectedRoute>
                <UserForm />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;