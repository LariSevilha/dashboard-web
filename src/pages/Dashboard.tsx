import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
`;

const Info = styled.p`
  color: #b0b0b0;
  font-size: 1.1rem;
  margin-bottom: 1rem;
`;

const Button = styled.button`
  width: 100%;
  background-color: #8b0000;
  color: #ffffff;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #a00000;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4040;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
      navigate('/login');
      return;
    }

    axios
      .get('http://localhost:3000/api/v1/dashboard', {
        headers: { 'X-API-Key': apiKey },
      })
      .then((response) => setUser(response.data.user))
      .catch(() => {
        setError('Erro ao carregar o dashboard');
        localStorage.removeItem('apiKey');
        navigate('/login');
      });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('apiKey');
    navigate('/login');
  };

  if (!user) return <p style={{ color: '#ffffff' }}>Carregando...</p>;

  return (
    <DashboardContainer>
      <Title>Dashboard</Title>
      <Info>Bem-vindo, {user.email} ({user.role})</Info>
      <Button onClick={logout}>Sair</Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </DashboardContainer>
  );
};

export default Dashboard;