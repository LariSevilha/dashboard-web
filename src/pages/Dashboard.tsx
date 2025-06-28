import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import styles from '../styles/dashboard.module.css';
import '../index.css';
import { PlanDurationOptions } from './FormConstants';
import MetricsView from './MetricsView';
import { Metrics, User } from './MetricsTypes';
import { calculateExpirationDate } from './MetricsUtils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const Dashboard: React.FC = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [currentView, setCurrentView] = useState<'users' | 'metrics'>('users');
  const [theme, setTheme] = useState<string>(localStorage.getItem('theme') || 'dark');

  const usersPerPage = 5;
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector(`.${styles.sidebar}`);
      const toggle = document.querySelector(`.${styles.mobileMenuToggle}`);
      if (isMobileMenuOpen && sidebar && toggle && !sidebar.contains(event.target as Node) && !toggle.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isMobile]);

  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobile, isMobileMenuOpen]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const sortedUsers = [...users].sort((a, b) => {
    const dateA = a.registration_date ? new Date(a.registration_date).getTime() : 0;
    const dateB = b.registration_date ? new Date(b.registration_date).getTime() : 0;
    return dateB - dateA;
  });

  const filteredUsers = sortedUsers.filter(
    (u) =>
      (activeTab === 'all' || u.plan_duration === activeTab) &&
      ((u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())))
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
        setUser(response.data.user);
        setMetrics(response.data.metrics);
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
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      });
      fetchUsers({ Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' });
    } catch (err) {
      console.error('Delete error:', err);
      setError('Erro ao deletar usuário');
    }
  };

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    const action = currentStatus ? 'desativar' : 'ativar';
    if (!window.confirm(`Tem certeza que deseja ${action} este usuário?`)) return;

    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) return;

    try {
      await axios.patch(`http://localhost:3000/api/v1/users/${id}/toggle_active`, {
        active: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      });
      fetchUsers({ Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' });
    } catch (err) {
      console.error('Toggle active error:', err);
      setError(`Erro ao ${action} usuário`);
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
    setCurrentPage(1);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getPlanLabel = (value: string) => {
    const option = PlanDurationOptions.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      closeMobileMenu();
    }
  };

  const renderUsersView = () => (
    <div className={styles.usersView}>
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

      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${activeTab === 'all' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('all')}
        >
          Todos
        </button>
        {PlanDurationOptions.map((option) => (
          <button
            key={option.value}
            className={`${styles.tabButton} ${activeTab === option.value ? styles.activeTab : ''}`}
            onClick={() => handleTabChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

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
                <div className={styles.detailItem}>
                  <strong>Plano:</strong> {getPlanLabel(u.plan_duration)}
                </div>
                <div className={styles.detailItem}>
                  <strong>Status:</strong> {u.active ? 'Ativo' : 'Inativo'}
                </div>
                <div className={styles.userActions}>
                  <Link
                    to={`/dashboard/user/${u.id}`}
                    aria-label={`Editar usuário ${u.name}`}
                    onClick={handleLinkClick}
                  >
                    <span className={styles.editIcon}>
                      <i className="fas fa-edit" />
                    </span>
                  </Link>
                  <button
                    className={styles.deleteIcon}
                    onClick={() => handleDelete(u.id)}
                    aria-label={`Excluir usuário ${u.name}`}
                  >
                    <i className="fas fa-trash" />
                  </button>
                  <button
                    className={styles.toggleActiveIcon}
                    onClick={() => handleToggleActive(u.id, u.active)}
                    aria-label={`${u.active ? 'Desativar' : 'Ativar'} usuário ${u.name}`}
                  >
                    <i className={u.active ? 'fas fa-toggle-off' : 'fas fa-toggle-on'} />
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
    </div>
  );

  return (
    <div className={styles.dashboardContainer}>
      {isMobile && (
        <button
          className={styles.mobileMenuToggle}
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMobileMenuOpen}
        >
          <i className={isMobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'} />
        </button>
      )}
      {isMobile && (
        <div
          className={`${styles.sidebarOverlay} ${isMobileMenuOpen ? styles.active : ''}`}
          onClick={closeMobileMenu}
          aria-hidden={!isMobileMenuOpen}
        />
      )}
      <div className={styles.contentWrapper}>
        <aside className={`${styles.sidebar} ${isMobile && isMobileMenuOpen ? styles.open : ''}`}>
          <div className={styles.sidebarHeader}>
            {isMobile && (
              <button
                className={styles.sidebarCloseButton}
                onClick={closeMobileMenu}
                aria-label="Fechar menu"
              >
                <i className="fas fa-times" />
              </button>
            )}
            <div className={styles.brandLogo}>RF</div>
            <h2 className={styles.title}>Dashboard</h2>
          </div>
          <div className={styles.sidebarContent}>
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
                className={`${styles.menuButton} ${currentView === 'users' ? styles.active : ''}`}
                onClick={() => {
                  setCurrentView('users');
                  handleLinkClick();
                }}
              >
                <i className="fas fa-users" /> Usuários
              </button>
            </div>
            <div className={styles.menuItem}>
              <button
                className={styles.buttonAdd}
                onClick={() => setShowOptions(!showOptions)}
                aria-expanded={showOptions}
                aria-controls="add-user-options"
              >
                <i className="fas fa-user-plus" /> Adicionar Usuário
              </button>
              {showOptions && (
                <div id="add-user-options" className={styles.subMenu}>
                  <Link
                    to="/dashboard/user/new?type=pdf"
                    className={styles.subMenuItem}
                    onClick={handleLinkClick}
                  >
                    <i className="fas fa-file-pdf" /> Adicionar PDF
                  </Link>
                  <Link
                    to="/dashboard/user/new?type=manual"
                    className={styles.subMenuItem}
                    onClick={handleLinkClick}
                  >
                    <i className="fas fa-edit" /> Cadastrar Manual
                  </Link>
                </div>
              )}
            </div>
            <div className={styles.menuItem}>
              <button
                className={`${styles.menuButton} ${currentView === 'metrics' ? styles.active : ''}`}
                onClick={() => {
                  setCurrentView('metrics');
                  handleLinkClick();
                }}
              >
                <i className="fas fa-chart-bar" /> Métricas
              </button>
            </div>
            <div className={styles.menuItem}>
              <button
                className={styles.menuButton}
                onClick={toggleTheme}
                aria-label={`Alternar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
              >
                <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'} /> {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
              </button>
            </div>
          </div>
          <button className={styles.buttonLogout} onClick={handleLogout}>
            <i className="fas fa-sign-out-alt" /> Sair
          </button>
        </aside>
        <main className={styles.mainContent}>
          {currentView === 'users' ? renderUsersView() : <MetricsView metrics={metrics} users={users} />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;