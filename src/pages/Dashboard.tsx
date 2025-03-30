import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';

const EditIcon = styled.span`
  color: #3498db;
  cursor: pointer;
  margin: 0 0.5rem;
  font-size: 1.2rem;
`;

const DeleteIcon = styled.span`
  color: #ff4040;
  cursor: pointer;
  margin: 0 0.5rem;
  font-size: 1.2rem;
`;

const DashboardContainer = styled.div`
  width: 100%;
  max-width: 600px;
  text-align: center;
  color: #ffffff;
`;

const Title = styled.h1`
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
  margin-bottom: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #a00000;
  }
`;

const UserList = styled.div`
  margin-top: 2rem;
`;

const UserItem = styled.div`
  background-color: #2f3a3b;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserInfo = styled.div`
  color: #ffffff;
`;

const UserDetails = styled.div`
  color: #b0b0b0;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const SubTitle = styled.h3`
  color: #b0b0b0;
  margin: 0.5rem 0;
`;

const ErrorMessage = styled.p`
  color: #ff4040;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
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

    fetchUsers(apiKey);
  }, [navigate]);

  const fetchUsers = async (apiKey: string) => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/users', {
        headers: { 'X-API-Key': apiKey },
      });
      setUsers(response.data);
    } catch (err) {
      setError('Erro ao carregar usuários');
    }
  };

  const handleDelete = async (id: number) => {
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) return;

    try {
      await axios.delete(`http://localhost:3000/api/v1/users/${id}`, {
        headers: { 'X-API-Key': apiKey },
      });
      fetchUsers(apiKey);
    } catch (err) {
      setError('Erro ao deletar usuário');
    }
  };

  if (!user) return <p style={{ color: '#ffffff' }}>Carregando...</p>;

  return (
    <DashboardContainer>
      <Title>Dashboard</Title>
      <Info>Bem-vindo, {user.email} ({user.role})</Info>

      <Link to="/dashboard/user/new">
        <Button>Adicionar Usuário</Button>
      </Link>

      <UserList>
        <SubTitle>Usuários Cadastrados</SubTitle>
        {users.length === 0 ? (
          <p style={{ color: '#b0b0b0' }}>Nenhum usuário cadastrado.</p>
        ) : (
          users.map((u) => (
            <UserItem key={u.id}>
              <UserInfo>
                <strong>{u.name}</strong> ({u.email})
                <UserDetails>
                  <SubTitle>Treinos:</SubTitle>
                  {u.trainings.map((t: any) => (
                    <div key={t.id}>
                      Exercício: {t.exercise.name}, Séries: {t.serie.amount}, Repetições: {t.repeat.amount}, Vídeo: {t.exercise.video || 'N/A'}
                    </div>
                  ))}
                  <SubTitle>Dietas:</SubTitle>
                  {u.meals.map((m: any) => (
                    <div key={m.id}>
                      Tipo: {m.meal_type}
                      <div>
                        Comidas:
                        {m.comidas.map((c: any) => (
                          <div key={c.id}>
                            {c.name} - Quantidade: {c.amount || 'N/A'}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </UserDetails>
              </UserInfo>
              <div>
                <Link to={`/dashboard/user/${u.id}`}>
                  <EditIcon>✏️</EditIcon>
                </Link>
                <DeleteIcon onClick={() => handleDelete(u.id)}>🗑️</DeleteIcon>
              </div>
            </UserItem>
          ))
        )}
      </UserList>

      <Button onClick={() => { localStorage.removeItem('apiKey'); navigate('/login'); }}>
        Sair
      </Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </DashboardContainer>
  );
};

export default Dashboard;