import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import styles from '../styles/dashboard.module.css';
interface User {
  id: number;
  name: string | null;
  email: string | null;
  registration_date: string | null;
  role: string;
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

const calculateExpirationDate = (registrationDate: string): Date | null => {
  if (!registrationDate) return null;
  try {
    const date = new Date(registrationDate);
    if (isNaN(date.getTime())) {
      console.error('Data de registro inválida:', registrationDate);
      return null;
    }
    date.setDate(date.getDate() + 30);
    return date;
  } catch (error) {
    console.error('Erro ao calcular data de expiração:', error);
    return null;
  }
};

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey || userRole !== 'master') {
      navigate('/dashboard');
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

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.contentWrapper}>
        <aside className={styles.sidebar}>
          <h1 className={styles.title}>Dashboard</h1>
          {user && (
            <p className={styles.info}>
              Bem-vindo, {user.name || user.email} ({user.role})
            </p>
          )}
          <Link to="/dashboard/user/new" className={styles.buttonAdd}>
            <i className="fas fa-user-plus"></i> Adicionar Usuário
          </Link>
          <button className={styles.buttonLogout} onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Sair
          </button>
        </aside>

        <main className={styles.mainContent}>
          <header className={styles.header}>
            <h3 className={styles.subtitle}>Usuários Cadastrados</h3>
            <input
              className={styles.searchBar}
              type="text"
              placeholder="Buscar por nome ou email..."
              onChange={handleSearchChange}
              aria-label="Buscar usuários por nome ou email"
            />
          </header>
          {loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : error ? (
            <p className={styles.errorMessage}>{error}</p>
          ) : filteredUsers.length === 0 ? (
            <p className={styles.empty}>Nenhum usuário encontrado.</p>
          ) : (
            <div className={styles.userList}>
              {filteredUsers.map((u) => (
                <div key={u.id} className={styles.userItem}>
                  <div className={styles.userInfo}>
                    <strong>{u.name || 'Nome não disponível'}</strong>
                    <span>({u.email || 'Email não disponível'})</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Data de Expiração:</strong>
                    {u.registration_date
                      ? (() => {
                          const expirationDate = calculateExpirationDate(u.registration_date);
                          return expirationDate
                            ? format(new Date(expirationDate), 'dd/MM/yyyy')
                            : 'Data não disponível';
                        })()
                      : 'Data não disponível'}
                  </div>
                  <div className={styles.userActions}>
                    <Link to={`/dashboard/user/${u.id}`} aria-label={`Editar usuário ${u.name}`}>
                      <span className={styles.editIcon}>✏️</span>
                    </Link>
                    <button
                      className={styles.deleteIcon}
                      onClick={() => handleDelete(u.id)}
                      aria-label={`Excluir usuário ${u.name}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;