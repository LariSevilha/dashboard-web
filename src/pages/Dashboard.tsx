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
  max-width: 800px;
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
  text-align: left;
`;

const UserHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const UserInfo = styled.div`
  color: #ffffff;
`;

const UserActions = styled.div`
  display: flex;
`;

const UserDetails = styled.div`
  color: #b0b0b0;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

const SubTitle = styled.h3`
  color: #ffffff;
  font-size: 1rem;
  margin: 1rem 0 0.5rem 0;
  border-bottom: 1px solid #4a5859;
  padding-bottom: 5px;
`;

const DetailItem = styled.div`
  background-color: #1c2526;
  padding: 0.75rem;
  border-radius: 5px;
  margin-bottom: 0.5rem;
`;

const ComidaItem = styled.div`
  background-color: #253132;
  padding: 0.5rem;
  border-radius: 4px;
  margin: 0.5rem 0 0.5rem 1rem;
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
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
      navigate('/login');
      return;
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    // First load the current user data
    axios
      .get('http://localhost:3000/api/v1/dashboard', { headers })
      .then((response) => {
        setUser(response.data);
        // After loading user data, fetch all users
        fetchUsers(headers);
      })
      .catch((err) => {
        console.error("Dashboard load error:", err);
        setError('Erro ao carregar o dashboard');
        localStorage.removeItem('apiKey');
        navigate('/login');
      });
  }, [navigate]);

  const fetchUsers = async (headers: any) => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/v1/users', { headers });
      console.log("Users loaded:", response.data);
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Users fetch error:", err);
      setError('Erro ao carregar usuários');
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) return;

    try {
      await axios.delete(`http://localhost:3000/api/v1/users/${id}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      // Refresh user list after delete
      fetchUsers({ Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' });
    } catch (err) {
      console.error("Delete error:", err);
      setError('Erro ao deletar usuário');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('deviceId');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  if (loading && !user) return <p style={{ color: '#ffffff' }}>Carregando...</p>;

  return (
    <DashboardContainer>
      <Title>Dashboard</Title>
      {user && <Info>Bem-vindo, {user.name || user.email} ({user.role})</Info>}

      <Link to="/dashboard/user/new">
        <Button>Adicionar Usuário</Button>
      </Link>

      <UserList>
        <SubTitle>Usuários Cadastrados</SubTitle>
        {loading ? (
          <p style={{ color: '#b0b0b0' }}>Carregando usuários...</p>
        ) : users.length === 0 ? (
          <p style={{ color: '#b0b0b0' }}>Nenhum usuário cadastrado.</p>
        ) : (
          users.map((u) => (
            <UserItem key={u.id}>
              <UserHeader>
                <UserInfo>
                  <strong>{u.name}</strong> ({u.email})
                </UserInfo>
                <UserActions>
                  <Link to={`/dashboard/user/${u.id}`}>
                    <EditIcon title="Editar">✏️</EditIcon>
                  </Link>
                  <DeleteIcon onClick={() => handleDelete(u.id)} title="Excluir">🗑️</DeleteIcon>
                </UserActions>
              </UserHeader>
              
              <UserDetails>
                <SubTitle>Treinos:</SubTitle>
                {u.trainings && u.trainings.length > 0 ? (
                  u.trainings.map((t: any) => (
                    <DetailItem key={t.id || `training-${Math.random()}`}>
                      <strong>Exercício:</strong> {t.exercise_name || 'N/A'}<br />
                      <strong>Séries:</strong> {t.serie_amount || 'N/A'} | 
                      <strong> Repetições:</strong> {t.repeat_amount || 'N/A'}<br />
                      {t.video && (
                        <div>
                          <strong>Vídeo:</strong> <a href={t.video} target="_blank" rel="noopener noreferrer" style={{ color: '#8b0000' }}>{t.video}</a>
                        </div>
                      )}
                    </DetailItem>
                  ))
                ) : (
                  <p>Nenhum treino cadastrado</p>
                )}
                
                <SubTitle>Dietas:</SubTitle>
                {u.meals && u.meals.length > 0 ? (
                  u.meals.map((m: any) => (
                    <DetailItem key={m.id || `meal-${Math.random()}`}>
                      <strong>Tipo:</strong> {m.meal_type || 'N/A'}
                      
                      {m.comidas && m.comidas.length > 0 ? (
                        <>
                          <strong> Comidas:</strong>
                          {m.comidas.map((c: any) => (
                            <ComidaItem key={c.id || `comida-${Math.random()}`}>
                              <strong>{c.name}</strong> - Quantidade: {c.amount || (c.amount_meal && c.amount_meal.amount) || 'N/A'}
                            </ComidaItem>
                          ))}
                        </>
                      ) : (
                        <p>Nenhuma comida cadastrada</p>
                      )}
                    </DetailItem>
                  ))
                ) : (
                  <p>Nenhuma dieta cadastrada</p>
                )}
              </UserDetails>
            </UserItem>
          ))
        )}
      </UserList>

      <Button onClick={handleLogout}>
        Sair
      </Button>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </DashboardContainer>
  );
};

export default Dashboard;