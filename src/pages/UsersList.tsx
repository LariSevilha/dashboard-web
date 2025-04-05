// src/pages/UsersList.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const UsersListContainer = styled.div`
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

const UserSection = styled.div`
  background-color: #2f3a3b;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
`;

const UserName = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const SubTitle = styled.h3`
  font-size: 1.2rem;
  margin: 0.5rem 0;
  color: #b0b0b0;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  text-align: left;
`;

const ListItem = styled.li`
  padding: 0.5rem 0;
`;

const Button = styled.button`
  background-color: #8b0000;
  color: #ffffff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  margin: 0.5rem;
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

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');
    const deviceId = localStorage.getItem('deviceId');
    const userRole = localStorage.getItem('userRole');

    if (!apiKey || !deviceId || userRole !== 'master') {
      navigate('/login');
      return;
    }

    axios
      .get('http://localhost:3000/api/v1/users', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Device-ID': deviceId,
          'Accept': 'application/json',
        },
      })
      .then((response) => {
        // Para cada usuário, buscar os detalhes completos
        Promise.all(
          response.data.map((user: any) =>
            axios.get(`http://localhost:3000/api/v1/users/${user.id}`, {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Device-ID': deviceId,
                'Accept': 'application/json',
              },
            })
          )
        ).then((responses) => {
          setUsers(responses.map((res) => res.data));
        });
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.error || 'Erro ao carregar a lista de usuários';
        setError(errorMessage);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
        }
      });
  }, [navigate]);

  const handleDelete = async (userId: number) => {
    const apiKey = localStorage.getItem('apiKey');
    const deviceId = localStorage.getItem('deviceId');

    try {
      await axios.delete(`http://localhost:3000/api/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Device-ID': deviceId,
        },
      });
      setUsers(users.filter((user) => user.id !== userId));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir usuário');
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  return (
    <UsersListContainer>
      <Title>Detalhes dos Usuários</Title>
      {users.length > 0 ? (
        users.map((user) => (
          <UserSection key={user.id}>
            <UserName>{user.name} ({user.email}) - Papel: {user.role}</UserName>
            <SubTitle>Treinos</SubTitle>
            {user.trainings && user.trainings.length > 0 ? (
              <List>
                {user.trainings.map((training: any, index: number) => (
                  <ListItem key={index}>
                    {training.exercise_name} - {training.serie_amount} séries x {training.repeat_amount} repetições
                    {training.video && <span> (Vídeo: {training.video})</span>}
                  </ListItem>
                ))}
              </List>
            ) : (
              <p>Nenhum treino cadastrado.</p>
            )}
            <SubTitle>Refeições</SubTitle>
            {user.meals && user.meals.length > 0 ? (
              <List>
                {user.meals.map((meal: any, index: number) => (
                  <ListItem key={index}>
                    {meal.meal_type}: {meal.comidas && meal.comidas.length > 0 ? meal.comidas.map((comida: any) => `${comida.name} (${comida.amount})`).join(', ') : 'Nenhuma comida cadastrada.'}
                  </ListItem>
                ))}
              </List>
            ) : (
              <p>Nenhuma refeição cadastrada.</p>
            )}
            <Button onClick={() => navigate(`/user/${user.id}`)}>Editar</Button>
            <Button onClick={() => handleDelete(user.id)}>Excluir</Button>
          </UserSection>
        ))
      ) : (
        <p>Nenhum usuário cadastrado.</p>
      )}
      <Button onClick={() => navigate('/dashboard')}>Voltar</Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </UsersListContainer>
  );
};

export default UsersList;