import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserForm from './pages/UserForm';
import UsersList from './pages/UsersList';

const AppContainer = styled.div`
  min-height: 100vh; 
  display: flex;
  justify-content: center;
  align-items: center; 
`;

const App: React.FC = () => {
  return (
    <Router>
      <AppContainer>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user/new" element={<UserForm />} />
          <Route path="/user/:id" element={<UserForm />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </AppContainer>
    </Router>
  );
};

export default App;