import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserForm from './pages/UserForm';

// Estilos Globais
const AppContainer = styled.div`
  font-family: 'Arial', sans-serif;
  min-height: 100vh;
  background-color: #1c2526;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.header`
  padding: 2rem 0;
  text-align: center;
`;

const LogoImage = styled.img`
  width: 200px;
  height: auto;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 1rem;
`;

const Footer = styled.footer`
  padding: 1rem 0;
  text-align: center;
  color: #b0b0b0;
  font-size: 0.9rem;
`;

const FooterLine = styled.div`
  width: 100px;
  height: 2px;
  background-color: #8b0000;
  margin: 0 auto 0.5rem auto;
`;

const App: React.FC = () => {
  const isAuthenticated = () => !!localStorage.getItem('apiKey');

  const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
  };

  return (
    <AppContainer>
      <Header>
        <LogoImage
          src="https://via.placeholder.com/200x60?text=Renato+Frutuoso"
          alt="Renato Frutuoso - Consultoria Esportiva Online"
        />
      </Header>
      <MainContent>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
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
            <Route
              path="/dashboard/user/:id"
              element={
                <ProtectedRoute>
                  <UserForm />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to={isAuthenticated() ? '/dashboard' : '/login'} />} />
            <Route path="*" element={<h1 style={{ color: 'white' }}>404 - Página não encontrada</h1>} />
          </Routes>
        </Router>
      </MainContent>
      <Footer>
        <FooterLine />
        Renato Frutuoso - CREF 0000
      </Footer>
    </AppContainer>
  );
};

export default App;