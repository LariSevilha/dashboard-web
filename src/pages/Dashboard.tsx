import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

    axios.get('http://localhost:3000/api/v1/dashboard', {
      headers: { 'X-API-Key': apiKey },
    })
      .then(response => setUser(response.data.user))
      .catch(() => {
        setError('Erro ao carregar o dashboard');
        localStorage.removeItem('apiKey');
        navigate('/login');
      });
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('apiKey'); // Remove a chave API
    navigate('/login');
  };

  if (!user) return <p>Carregando...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Bem-vindo, {user.email} ({user.role})</p>
      <button onClick={logout}>Sair</button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Dashboard;