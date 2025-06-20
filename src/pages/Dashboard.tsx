import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import styles from '../styles/dashboard.module.css';
import '../index.css';

interface User {
  id: number;
  name: string | null;
  email: string | null;
  registration_date: string | null;
  role: string;
  plan_duration: string;
}

interface WeekdayOption {
  value: string;
  label: string;
}

const WeekdayOptions: WeekdayOption[] = [
  { value: 'sunday', label: 'Domingo' },
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
];

const calculateExpirationDate = (registrationDate: string, planDuration: string): Date | null => {
  if (!registrationDate) return null;
  try {
    const date = new Date(registrationDate);
    if (isNaN(date.getTime())) {
      console.error('Data de registro inválida:', registrationDate);
      return null;
    }
    if (planDuration === 'annual') {
      date.setMonth(date.getMonth() + 12);
    } else if (planDuration === 'semi_annual') {
      date.setMonth(date.getMonth() + 6);
    } else {
      date.setMonth(date.getMonth() + 1); // Padrão: mensal
    }
    return date;
  } catch (error) {
    console.error('Erro ao calcular data de expiração:', error);
    return null;
  }
};

const Dashboard: React.FC = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const filteredUsers = users.filter(
    (u) =>
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey || userRole !== 'master') {
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
        console.error('Dashboard load error:', err);
        setError('Erro ao carregar o dashboard');
        localStorage.removeItem('apiKey');
        navigate('/login');
      });
  }, [navigate, userRole]);

  const fetchUsers = async (headers: any) => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/v1/users', { headers });
      setUsers(response.data);
    } catch (err) {
      console.error('Users fetch error:', err);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;

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
      console.error('Delete error:', err);
      setError('Erro ao deletar usuário');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('deviceId');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
    setCurrentPage(1); // Reseta para a primeira página ao buscar
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.contentWrapper}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.brandLogo}>RF</div>
            <h2 className={styles.title}>Dashboard</h2>
          </div>
          {user && (
            <div className={styles.info}>
              <div className={styles.userAvatar}>
                {user.name ? user.name[0] : user.email?.[0]}
              </div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>{user.name || user.email}</div>
                <div className={styles.userRole}>{user.role}</div>
              </div>
            </div>
          )}
          <div className={styles.menuItem}>
            <button
              className={styles.buttonAdd}
              onClick={() => setShowOptions(!showOptions)}
              aria-expanded={showOptions}
              aria-controls="add-user-options"
            >
              <i className="fas fa-user-plus"></i> Adicionar Usuário
            </button>
            {showOptions && (
              <div id="add-user-options" className={styles.subMenu}>
                <Link to="/dashboard/user/new?type=pdf" className={styles.subMenuItem}>
                  <i className="fas fa-file-pdf"></i> Adicionar PDF
                </Link>
                <Link to="/dashboard/user/new?type=manual" className={styles.subMenuItem}>
                  <i className="fas fa-edit"></i> Cadastrar Manual
                </Link>
              </div>
            )}
          </div>
          <button className={styles.buttonLogout} onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Sair
          </button>
        </aside>
        <main className={styles.mainContent}>
          <header className={styles.header}>
            <h3 className={styles.subtitle}>Usuários Cadastrados</h3>
            <div className={styles.searchContainer}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                className={styles.searchBar}
                type="text"
                placeholder="Buscar por nome ou email..."
                onChange={handleSearchChange}
                aria-label="Buscar usuários por nome ou email"
              />
            </div> 
            </header>
            {loading ? (
              <div className={styles.loading}>Carregando...</div>
            ) : error ? (
              <p className={styles.errorMessage}>{error}</p>
            ) : filteredUsers.length === 0 ? (
              <p className={styles.empty}>Nenhum usuário encontrado.</p>
            ) : (
              <>
                <div className={styles.userList}>
                  {currentUsers.map((u) => (
                    <div key={u.id} className={styles.userItem}>
                      <div className={styles.userInfo}>
                        <strong>{u.name || 'Nome não disponível'}</strong>
                        <span>({u.email || 'Email não disponível'})</span>
                      </div>
                      <div className={styles.detailItem}>
                        <strong>Data de Expiração:</strong>
                        {u.registration_date
                          ? (() => {
                              const expirationDate = calculateExpirationDate(u.registration_date, u.plan_duration);
                              return expirationDate
                                ? format(new Date(expirationDate), 'dd/MM/yyyy')
                                : 'Data não disponível';
                            })()
                          : 'Data não disponível'}
                      </div>
                      <div className={styles.userActions}>
                        <Link to={`/dashboard/user/${u.id}`} aria-label={`Editar usuário ${u.name}`}>
                          <span className={styles.editIcon}><i className="fas fa-edit"></i></span>
                        </Link>
                        <button
                          className={styles.deleteIcon}
                          onClick={() => handleDelete(u.id)}
                          aria-label={`Excluir usuário ${u.name}`}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredUsers.length > usersPerPage && (
                  <div className={styles.pagination}>
                    <button
                      className={styles.paginationButton}
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </button>
                    <span className={styles.paginationInfo}>
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      className={styles.paginationButton}
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Próximo
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div> 
  );
};

export default Dashboard;