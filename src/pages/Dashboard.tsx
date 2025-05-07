import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';

const EditIcon = styled.span`
  color: #3498db;
  cursor: pointer;
  font-size: 1.3rem;
  transition: transform 0.2s ease, opacity 0.2s ease;
  &:hover {
    transform: scale(1.15);
    opacity: 0.8;
  }
`;

const DeleteIcon = styled.span`
  color: #ff4040;
  cursor: pointer;
  font-size: 1.3rem;
  transition: transform 0.2s ease, opacity 0.2s ease;
  &:hover {
    transform: scale(1.15);
    opacity: 0.8;
  }
`;

const DashboardContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 2rem auto;
  padding: 2rem;
  background: linear-gradient(145deg, #1e2a2b, #2f3a3b);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  color: #ffffff;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  min-height: 80vh;

  @media (min-width: 768px) {
    grid-template-columns: 250px 1fr;
  }
`;

const Sidebar = styled.div`
  background: linear-gradient(145deg, #2f3a3b, #3a4647);
  padding: 2rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 2rem;
  height: fit-content;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: linear-gradient(145deg, #1e2a2b, #2f3a3b);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
  letter-spacing: 1.5px;
  color: #e0e0e0;
`;

const Info = styled.p`
  color: #b0b0b0;
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 1.5rem;
  font-style: italic;
`;

const Button = styled.button`
  width: 100%;
  background: linear-gradient(145deg, #8b0000, #a00000);
  color: #ffffff;
  padding: 0.85rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(139, 0, 0, 0.2);

  &:hover {
    background: linear-gradient(145deg, #a00000, #b00000);
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(139, 0, 0, 0.3);
  }
`;

const UserList = styled.div`
  margin-top: 1rem;
`;

const UserItem = styled.div`
  background: linear-gradient(145deg, #2f3a3b, #3a4647);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
`;

const UserHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const UserInfo = styled.div`
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  span {
    color: #b0b0b0;
    font-size: 1rem;
    font-weight: 400;
  }
`;

const UserActions = styled.div`
  display: flex;
  gap: 0.5rem;

  a, span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: #1c2526;
    transition: background 0.3s ease, transform 0.2s ease;

    &:hover {
      background: #8b0000;
      transform: scale(1.1);
    }
  }
`;

const UserDetails = styled.div`
  color: #b0b0b0;
  font-size: 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SubTitle = styled.h3`
  color: #ffffff;
  font-size: 1.1rem;
  margin: 1rem 0 0.75rem;
  padding-bottom: 6px;
  border-bottom: 2px solid #4a5859;
`;

const DetailItem = styled.div`
  background-color: #1c2526;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  border-left: 4px solid #8b0000;
`;

const ComidaItem = styled.div`
  background-color: #253132;
  padding: 0.75rem;
  border-radius: 6px;
  margin: 0.5rem 0 0.5rem 1rem;
  border-left: 3px solid #4a5859;
`;

const ErrorMessage = styled.p`
  color: #ff4040;
  margin: 1.5rem 0;
  font-size: 0.95rem;
  text-align: center;
  background: #2f3a3b;
  padding: 0.75rem;
  border-radius: 8px;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: #1c2526;
  color: #ffffff;
  font-size: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

  &::placeholder {
    color: #b0b0b0;
  }

  &:focus {
    outline: none;
    border: 2px solid #8b0000;
  }
`;

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
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

    axios
      .get('http://localhost:3000/api/v1/dashboard', { headers })
      .then((response) => {
        setUser(response.data);
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

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !user) return <p style={{ color: '#ffffff' }}>Carregando...</p>;

  return (
    <DashboardContainer>
      <Sidebar>
        <Title>Dashboard</Title>
        {user && <Info>Bem-vindo, {user.name || user.email} ({user.role})</Info>}
        <Link to="/dashboard/user/new">
          <Button>Adicionar Usuário</Button>
        </Link>
        <Button onClick={handleLogout}>Sair</Button>
      </Sidebar>

      <MainContent>
        <SearchBar
          type="text"
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <UserList>
          <SubTitle>Usuários Cadastrados</SubTitle>
          {loading ? (
            <p style={{ color: '#b0b0b0' }}>Carregando usuários...</p>
          ) : filteredUsers.length === 0 ? (
            <p style={{ color: '#b0b0b0' }}>Nenhum usuário encontrado.</p>
          ) : (
            filteredUsers.map((u) => (
              <UserItem key={u.id}>
                <UserHeader>
                  <UserInfo>
                    <strong>{u.name}</strong>
                    <span>({u.email})</span>
                  </UserInfo>
                  <UserActions>
                    <Link to={`/dashboard/user/${u.id}`}>
                      <EditIcon title="Editar">✏️</EditIcon>
                    </Link>
                    <DeleteIcon onClick={() => handleDelete(u.id)} title="Excluir">🗑️</DeleteIcon>
                  </UserActions>
                </UserHeader>

                
              </UserItem>
            ))
          )}
        </UserList>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </MainContent>
    </DashboardContainer>
  );
};

export default Dashboard;