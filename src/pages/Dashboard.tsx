// src/pages/Dashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components'; 

// Definir tipos para os dados
interface User {
  id: number;
  name: string;
  role: string;
  email: string;
  trainings: Training[];
  meals: Meal[];
}

interface Training {
  id: number;
  serie_amount: string;
  repeat_amount: string;
  exercise_name: string;
  video: string;
}

interface Meal {
  id: number;
  meal_type: string;
  comidas: Comida[];
}

interface Comida {
  id: number;
  name: string;
  amount: string;
}

const DashboardContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
  color: #ffffff;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
`;

const EditText = styled.span`
  cursor: pointer;
  color: #ffffff;
  font-weight: bold;

  &:hover {
    color: #a00000;
    text-decoration: underline;
  }
`;

const Button = styled.button`
  background-color: #8b0000;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin: 0.5rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #a00000;
  }
`;

const Section = styled.div`
  margin-top: 1.5rem;
`;

const SubTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const UserList = styled.ul`
  list-style: none;
  padding: 0;
  text-align: left;
`;

const UserItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2f3a3b;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
`;

const UserName = styled.span`
  font-size: 1.1rem;
`;
 

const List = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  background-color: #2f3a3b;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
`;

const ErrorMessage = styled.p`
  color: #ff4040;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    const apiKey = localStorage.getItem('apiKey');
    const deviceId = localStorage.getItem('deviceId');
    const userRole = localStorage.getItem('userRole');

    if (!apiKey || !deviceId) {
      navigate('/login');
      return;
    }

    try {
      const userResponse = await axios.get('http://localhost:3000/api/v1/dashboard', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Device-ID': deviceId,
          'Accept': 'application/json',
        },
      });
      setUserData(userResponse.data);

      if (userRole === 'master') {
        const usersResponse = await axios.get('http://localhost:3000/api/v1/users', {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Device-ID': deviceId,
            'Accept': 'application/json',
          },
        });
        setUsers(usersResponse.data);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao carregar o dashboard';
      setError(errorMessage);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData, refresh]);

  const handleLogout = async () => {
    const apiKey = localStorage.getItem('apiKey');
    const deviceId = localStorage.getItem('deviceId');

    try {
      await axios.delete('http://localhost:3000/api/v1/sessions/logout', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Device-ID': deviceId,
        },
      });
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    } finally {
      localStorage.removeItem('apiKey');
      localStorage.removeItem('deviceId');
      localStorage.removeItem('userRole');
      navigate('/login');
    }
  };

  useEffect(() => {
    const handleFocus = () => {
      setRefresh((prev) => prev + 1);
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <DashboardContainer>
      <Title>Dashboard</Title>
      {userData && (
        <>
          <p>Bem-vindo, {userData.email}</p>
          
          {userData.role === 'master' && (
            <>
              <Section>
                <SubTitle>Usuários</SubTitle>
                {users.length > 0 ? (
                  <UserList>
                  {users.map((user: any) => (
                    <UserItem key={user.id}>
                      <UserName>{user.name}</UserName>
                      <EditText onClick={() => navigate(`/user/${user.id}`)}>Editar</EditText>
                    </UserItem>
                  ))}
                </UserList>
                ) : (
                  <p>Nenhum usuário cadastrado.</p>
                )}
              </Section>
              <Button onClick={() => navigate('/user/new')}>Adicionar Usuário</Button>
              <Button onClick={() => navigate('/users')}>Ver Detalhes dos Usuários</Button>
            </>
          )}
          <Button onClick={handleLogout}>Sair</Button>
        </>
      )}
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </DashboardContainer>
  );
};

export default Dashboard;