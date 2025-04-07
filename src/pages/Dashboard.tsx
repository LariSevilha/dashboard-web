// src/pages/Dashboard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { Pencil, Trash2 } from 'lucide-react';

// Define interfaces
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

// Global styles to reset default margins and padding
const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    font-family: 'Montserrat', sans-serif;
  }
`;

// Styled Components
const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(to bottom, #2f3a3b 50%, #8b0000 100%);
  padding: 1rem;
  box-sizing: border-box;
`;

const DashboardContainer = styled.div`
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  background-color: #2f3a3b;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  color: #ffffff;
`;

const Logo = styled.div`
  margin-bottom: 1.5rem;
  color: #ffffff;
  font-size: 2rem;
  font-weight: bold;
  text-transform: uppercase;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  span {
    color: #ff0000;
  }
`;

const WelcomeMessage = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: #ffffff;
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

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #ffffff;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;

  &:hover {
    color: #ff0000;
  }
`;

const Section = styled.div`
  margin-top: 1.5rem;
`;

const SubTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #ffffff;
`;

const SearchContainer = styled.div`
  margin-bottom: 1.5rem;
  text-align: left;
`;

const SearchLabel = styled.label`
  display: block;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #ffffff;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #555;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #ffffff;
  color: #000000;
  box-sizing: border-box;

  &::placeholder {
    color: #aaaaaa;
  }
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
  background-color: #3a4647;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
`;

const UserName = styled.span`
  font-size: 1.1rem;
  color: #ffffff;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
  gap: 0.5rem;
`;

const PageButton = styled.button<{ active?: boolean }>`
  background-color: ${({ active }) => (active ? '#8b0000' : '#3a4647')};
  color: #ffffff;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${({ active }) => (active ? '#a00000' : '#4a5657')};
  }

  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4040;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.p`
  color: #00ff00;
  margin-top: 1rem;
  font-size: 0.9rem;
  animation: fadeOut 3s forwards;

  @keyframes fadeOut {
    0% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #2f3a3b;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  color: #ffffff;
  max-width: 400px;
  width: 100%;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const ConfirmButton = styled(Button)`
  background-color: #ff4040;

  &:hover {
    background-color: #ff6666;
  }
`;

const CancelButton = styled(Button)`
  background-color: #3a4647;

  &:hover {
    background-color: #4a5657;
  }
`;

const Dashboard: React.FC = () => {
  const [userData, setUserData] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const usersPerPage = 5; // Limit of users per page
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
        setFilteredUsers(usersResponse.data);
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

  // Handle search input change and filter users
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page on search

    if (query.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  // Show delete confirmation modal
  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (!userToDelete) return;

    const apiKey = localStorage.getItem('apiKey');
    const deviceId = localStorage.getItem('deviceId');
    const userRole = localStorage.getItem('userRole');

    if (!apiKey || !deviceId || userRole !== 'master') {
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/v1/users/${userToDelete}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Device-ID': deviceId,
        },
      });
      setSuccessMessage('Usuário excluído com sucesso');
      setTimeout(() => {
        setRefresh((prev) => prev + 1); // Refresh the user list after showing the message
        setSuccessMessage(null);
      }, 3000); // Show message for 3 seconds
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir usuário');
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

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

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <DashboardContainer>
          <Logo>
            Renato <span>Frutuoso</span>
            <div style={{ fontSize: '0.8rem', fontWeight: 'normal', marginTop: '0.5rem' }}>
              Consultoria Esportiva Online
            </div>
          </Logo>
          {userData && (
            <>
              <WelcomeMessage>Bem-vindo, {userData.name}</WelcomeMessage>

              {userData.role === 'master' && (
                <>
                  <Section>
                    <SubTitle>Usuários</SubTitle>
                    {/* Search Filter */}
                    <SearchContainer>
                      <SearchLabel>Pesquisar Usuários</SearchLabel>
                      <SearchInput
                        type="text"
                        placeholder="Digite o nome do usuário..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                    </SearchContainer>
                    {currentUsers.length > 0 ? (
                      <UserList>
                        {currentUsers.map((user: User) => (
                          <UserItem key={user.id}>
                            <UserName>{user.name}</UserName>
                            <ActionsContainer>
                              <IconButton onClick={() => navigate(`/user/${user.id}`)} title="Editar">
                                <Pencil size={20} />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteClick(user.id)} title="Excluir">
                                <Trash2 size={20} />
                              </IconButton>
                            </ActionsContainer>
                          </UserItem>
                        ))}
                      </UserList>
                    ) : (
                      <p>Nenhum usuário encontrado.</p>
                    )}
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <PaginationContainer>
                        <PageButton
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Anterior
                        </PageButton>
                        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                          <PageButton
                            key={page}
                            onClick={() => handlePageChange(page)}
                            active={page === currentPage}
                          >
                            {page}
                          </PageButton>
                        ))}
                        <PageButton
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Próximo
                        </PageButton>
                      </PaginationContainer>
                    )}
                  </Section>
                  <Button onClick={() => navigate('/user/new')}>Adicionar Usuário</Button>
                </>
              )}
              <Button onClick={handleLogout}>Sair</Button>
            </>
          )}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
 
          {showDeleteModal && (
            <ModalOverlay>
              <ModalContent>
                <ModalTitle>Tem certeza que deseja excluir este usuário?</ModalTitle>
                <ModalButtons>
                  <ConfirmButton onClick={confirmDelete}>Confirmar</ConfirmButton>
                  <CancelButton onClick={cancelDelete}>Cancelar</CancelButton>
                </ModalButtons>
              </ModalContent>
            </ModalOverlay>
          )}
        </DashboardContainer>
      </PageContainer>
    </>
  );
};

export default Dashboard;