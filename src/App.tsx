// App.tsx ou Routes.tsx - Configure as rotas assim:

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';  
function App() {
  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/user/new" element={<Dashboard />} />
        <Route path="/dashboard/user/:id" element={<Dashboard />} />
        <Route path="/dashboard/master/new" element={<Dashboard />} />
        <Route path="/dashboard/master/:id" element={<Dashboard />} />
        <Route path="/dashboard/metrics" element={<Dashboard />} />
        <Route path="/dashboard/settings" element={<Dashboard />} />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;