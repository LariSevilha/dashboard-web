import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link, useParams, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { debounce } from 'lodash';
import { Chart as ChartJS, registerables } from 'chart.js';
import '../index.css';
import styles from '../styles/dashboard.module.css';
import { PlanDurationOptions } from './FormConstants';
import MetricsView from './MetricsView';
import MasterUserConfig from './MasterUserConfig';
import DashboardSettings from './DashboardSettings';
import { useTheme } from './ThemeProvider';
import Footer from './Footer';
import Breadcrumbs from './Breadcrumbs';
import PersonalTrainerForm from './PersonalTrainerForm';
import UserForm from './UserForm';
import UserProfile from './UserProfile';
import { User, Metrics } from '../pages/MetricsTypes';
import { MasterUser, DashboardSettings as DashboardSettingsType } from '../pages/types';

ChartJS.register(...registerables);

interface PersonalTrainerData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  cpf: string;
  cref: string;
  phone_number: string;
}

interface UserFormData {
  name: string;
  email: string;
  phone_number: string;
  plan_duration: string;
  password: string;
  password_confirmation: string;
  pdfContent?: string;
}

const Dashboard: React.FC = () => {
  const { settings, updateSettings } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [masterUser, setMasterUser] = useState<MasterUser | null>(null);
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettingsType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'users' | 'metrics' | 'masterConfig' | 'dashboardSettings'>('users');
  const [userRole, setUserRole] = useState<'super' | 'master' | null>(null);
  const [theme, setTheme] = useState<string>(localStorage.getItem('theme') || 'dark');
  const [showPersonalTrainerForm, setShowPersonalTrainerForm] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [showUserProfile, setShowUserProfile] = useState<boolean>(false);
  const chartRef = useRef<ChartJS | null>(null);
  const [showOptions, setShowOptions] = useState<boolean>(false);

  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const apiKey = localStorage.getItem('apiKey');
  const deviceId = localStorage.getItem('deviceId');

  const handleShowProfile = () => {
    setShowUserProfile(true);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
    // Fetch current user profile data
    if (apiKey && deviceId) {
      axios.get('http://localhost:3000/api/v1/current_user', {
        headers: { Authorization: `Bearer ${apiKey}`, 'Device-ID': deviceId },
      })
        .then((response) => {
          setUser(response.data); // Update user state with profile data
        })
        .catch((err) => {
          console.error('Error fetching user profile:', err);
          setError('Erro ao carregar perfil do usuário');
        });
    }
  };

  const handleCloseProfile = () => {
    setShowUserProfile(false);
  };

  const isUserForm = location.pathname.includes('/user/') || location.pathname === '/dashboard/user/new';
  const isMasterForm = location.pathname.includes('/master/') || location.pathname === '/dashboard/master/new';
  const userType = new URLSearchParams(location.search).get('type') as 'pdf' | 'manual' | null;

  const usersPerPage = 5;

  const loadImageWithAuth = async (url: string) => {
    if (!apiKey || !deviceId) {
      console.error('Missing authentication credentials');
      setError('Credenciais de autenticação ausentes');
      return null;
    }
    try {
      const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;
      const response = await axios.get(fullUrl, {
        headers: { Authorization: `Bearer ${apiKey}`, 'Device-ID': deviceId },
        responseType: 'blob',
      });
      return URL.createObjectURL(response.data);
    } catch (err) {
      console.error('Error fetching image:', err);
      setError('Erro ao carregar imagem');
      return url.startsWith('http') ? url : `http://localhost:3000${url}`;
    }
  };

  useEffect(() => {
    if (location.pathname.includes('/user/') || location.pathname === '/dashboard/user/new') {
      setCurrentView('users');
    } else if (location.pathname.includes('/master/') || location.pathname === '/dashboard/master/new') {
      setCurrentView('masterConfig');
    } else if (location.pathname.includes('/metrics')) {
      setCurrentView('metrics');
    } else if (location.pathname.includes('/settings')) {
      setCurrentView('dashboardSettings');
    } else {
      setCurrentView('users');
    }
  }, [location.pathname]);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 1024);
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
        setShowOptions(false);
      }
    };
    if (isMobileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen && isMobile) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen, isMobile]);

  useEffect(() => {
    if (!isMobile && isMobileMenuOpen) setIsMobileMenuOpen(false);
  }, [isMobile, isMobileMenuOpen]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const role = localStorage.getItem('userRole') as 'super' | 'master' | null;
    setUserRole(role);
    if (!apiKey || !deviceId || !role || (role !== 'super' && role !== 'master')) {
      navigate('/login');
      return;
    }

    const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Device-ID': deviceId };

    axios.get('http://localhost:3000/api/v1/dashboard', { headers })
      .then((response) => {
        setUser(response.data.user);
        setMetrics(response.data.metrics);
        if (role === 'master') fetchUsers(headers);
        if (role === 'super') fetchMasterUsers(headers);
        fetchMasterUser(headers);
        fetchDashboardSettings(headers);
      })
      .catch((err) => {
        console.error('Dashboard load error:', err);
        setError('Erro ao carregar o dashboard');
        localStorage.removeItem('apiKey');
        localStorage.removeItem('deviceId');
        navigate('/login');
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const fetchUsers = async (headers: any) => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/users', { headers });
      const typedUsers: User[] = response.data.map((u: any) => ({
        id: u.id,
        name: u.name || null,
        email: u.email || undefined,
        registration_date: u.registration_date || undefined,
        plan_duration: u.plan_duration || undefined,
        role: u.role || undefined,
        active: u.active || undefined,
      }));
      setUsers(typedUsers);
    } catch (err) {
      console.error('Users fetch error:', err);
      setError('Erro ao carregar usuários');
    }
  };

  const fetchMasterUsers = async (headers: any) => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/master_users', { headers });
      const typedUsers: User[] = response.data.map((u: any) => ({
        id: u.id,
        name: u.name || null,
        email: u.email || undefined,
        registration_date: u.created_at || undefined,
        plan_duration: u.plan_duration || undefined,
        role: u.role || undefined,
        active: u.active || undefined,
      }));
      setUsers(typedUsers);
    } catch (err) {
      console.error('Master users fetch error:', err);
      setError('Erro ao carregar usuários master');
    }
  };

  const fetchMasterUser = async (headers: any) => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/master_user', { headers });
      setMasterUser(response.data);
    } catch (err) {
      console.error('Master user fetch error:', err);
      setError('Erro ao carregar dados do usuário master');
    }
  };

  const fetchDashboardSettings = async (headers: any) => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/dashboard_settings', { headers });
      setDashboardSettings(response.data);
      updateSettings(response.data);
    } catch (err) {
      console.error('Dashboard settings fetch error:', err);
      setError('Erro ao carregar configurações do dashboard');
    }
  };

  const handleDelete = async (id: number, type: 'user' | 'master' | 'super') => {
    if (!window.confirm(`Tem certeza que deseja excluir este ${type === 'super' ? 'superusuário' : type === 'master' ? 'personal trainer' : 'usuário'}?`)) return;
    if (!apiKey || !deviceId) return;

    try {
      const endpoint = type === 'super' ? 'super_users' : type === 'master' ? 'master_users' : 'users';
      await axios.delete(`http://localhost:3000/api/v1/${endpoint}/${id}`, {
        headers: { Authorization: `Bearer ${apiKey}`, 'Device-ID': deviceId },
      });
      if (type === 'master') fetchMasterUsers({ Authorization: `Bearer ${apiKey}`, 'Device-ID': deviceId });
      else fetchUsers({ Authorization: `Bearer ${apiKey}`, 'Device-ID': deviceId });
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Erro ao deletar ${type === 'super' ? 'superusuário' : type === 'master' ? 'personal trainer' : 'usuário'}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('deviceId');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const debouncedSearch = useCallback(debounce((value: string) => setSearchTerm(value), 300), []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
    setCurrentPage(1);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const getPlanLabel = (value: string) => PlanDurationOptions.find((opt) => opt.value === value)?.label || value;

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const handleLinkClick = () => {
    if (isMobile) closeMobileMenu();
    setShowOptions(false);
  };
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const toggleOptions = () => setShowOptions((prev) => !prev);

  const navigateToView = (view: string) => {
    handleLinkClick();
    switch (view) {
      case 'users':
        navigate('/dashboard');
        break;
      case 'masterConfig':
        navigate('/dashboard');
        break;
      case 'metrics':
        navigate('/dashboard/metrics');
        break;
      case 'dashboardSettings':
        navigate('/dashboard/settings');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handlePersonalTrainerSuccess = () => {
    setShowPersonalTrainerForm(false);
    fetchMasterUsers({ Authorization: `Bearer ${apiKey}`, 'Device-ID': deviceId });
    navigate('/dashboard');
  };

  const handlePersonalTrainerCancel = () => {
    setShowPersonalTrainerForm(false);
    navigate('/dashboard');
  };

  const handleUserSuccess = () => {
    fetchUsers({ Authorization: `Bearer ${apiKey}`, 'Device-ID': deviceId });
    navigate('/dashboard');
  };

  const handleUserCancel = () => {
    navigate('/dashboard');
  };

  const handleAddUserPdf = () => {
    navigate('/dashboard/user/new?type=pdf');
    setShowOptions(false);
  };

  const handleAddUserManual = () => {
    navigate('/dashboard/user/new?type=manual');
    setShowOptions(false);
  };

  const renderMasterUserConfig = () => (
    <div className={styles.configContainer}>
      <div className={styles.configHeader}>
        <h2 className={styles.title}>Gerenciar Master Admins</h2>
        {userRole === 'super' && (
          <button onClick={() => navigate('/dashboard/master/new')} className={styles.addButton}>
            <i className="fas fa-user-plus" /> Novo Master Admin
          </button>
        )}
      </div>
      
      {isMasterForm && userRole === 'super' && (
        <PersonalTrainerForm
          onSuccess={handlePersonalTrainerSuccess}
          onCancel={handlePersonalTrainerCancel}
        />
      )}
      
      <h3 className={styles.subtitle}>Master Admins Cadastrados</h3>
      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : error ? (
        <p className={styles.errorMessage}>{error}</p>
      ) : users.length === 0 ? (
        <p className={styles.empty}>Nenhum master admin encontrado.</p>
      ) : (
        <div className={styles.userList}>
          {users.map((u) => (
            <div key={u.id} className={styles.userItem}>
              <div className={styles.userInfo}>
                <strong>{u.name || 'Nome não disponível'}</strong>
                <span>({u.email || 'Email não disponível'})</span>
              </div>
              <div className={styles.userActions}>
                <Link
                  to={`/dashboard/master/${u.id}`}
                  aria-label={`Editar master admin ${u.name}`}
                  onClick={handleLinkClick}
                  className={styles.editIcon}
                >
                  <i className="fas fa-edit" />
                </Link>
                <button
                  className={styles.deleteIcon}
                  onClick={() => handleDelete(u.id, 'master')}
                  aria-label={`Excluir master admin ${u.name}`}
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderUserConfig = () => {
    const filteredUsers = users.filter((user) => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === 'all' || 
                        (activeTab === 'active' && user.active) ||
                        (activeTab === 'inactive' && !user.active);
      return matchesSearch && matchesTab;
    });

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
      <div className={styles.configContainer}>
        <div className={styles.configHeader}>
          <h2 className={styles.title}>Gerenciar Usuários</h2>
          {userRole === 'master' && (
            <div className={styles.addButtonWrapper}>
              <button onClick={toggleOptions} className={styles.addButton}>
                <i className="fas fa-user-plus" /> Novo Usuário
              </button>
              {showOptions && (
                <div className={styles.subMenu}>
                  <button
                    onClick={handleAddUserPdf}
                    className={styles.subMenuItem}
                  >
                    <i className="fas fa-file-pdf" /> Adicionar PDF
                  </button>
                  <button
                    onClick={handleAddUserManual}
                    className={styles.subMenuItem}
                  >
                    <i className="fas fa-edit" /> Cadastrar Manual
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {isUserForm && (
          <UserForm
            onSuccess={handleUserSuccess}
            onCancel={handleUserCancel}
            userType={userType}
          />
        )}

        {!isUserForm && (
          <>
            <div className={styles.searchAndFilters}>
              <div className={styles.searchWrapper}>
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  onChange={handleSearchChange}
                  className={styles.searchInput}
                />
                <i className="fas fa-search" />
              </div>
              
              <div className={styles.tabFilters}>
                <button
                  className={`${styles.tabButton} ${activeTab === 'all' ? styles.active : ''}`}
                  onClick={() => handleTabChange('all')}
                >
                  Todos ({users.length})
                </button>
                <button
                  className={`${styles.tabButton} ${activeTab === 'active' ? styles.active : ''}`}
                  onClick={() => handleTabChange('active')}
                >
                  Ativos ({users.filter(u => u.active).length})
                </button>
                <button
                  className={`${styles.tabButton} ${activeTab === 'inactive' ? styles.active : ''}`}
                  onClick={() => handleTabChange('inactive')}
                >
                  Inativos ({users.filter(u => !u.active).length})
                </button>
              </div>
            </div>

            {loading ? (
              <div className={styles.loading}>
                <i className="fas fa-spinner fa-spin" />
                Carregando usuários...
              </div>
            ) : error ? (
              <div className={styles.errorMessage}>
                <i className="fas fa-exclamation-triangle" />
                {error}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className={styles.emptyState}>
                <i className="fas fa-users" />
                <p>Nenhum usuário encontrado.</p>
                {searchTerm && (
                  <p>Tente ajustar os termos de busca.</p>
                )}
              </div>
            ) : (
              <>
                <div className={styles.tableHeader}>
                  <div className={styles.tableRow}>
                    <div className={styles.tableCell}>Usuário</div>
                    <div className={styles.tableCell}>Email</div>
                    <div className={styles.tableCell}>Plano</div>
                    <div className={styles.tableCell}>Cadastro</div>
                    <div className={styles.tableCell}>Status</div>
                    <div className={styles.tableCell}>Ações</div>
                  </div>
                </div>

                <div className={styles.tableBody}>
                  {currentUsers.map((user) => (
                    <div key={user.id} className={styles.tableRow}>
                      <div className={styles.tableCell}>
                        <div className={styles.userInfo}>
                          <div className={styles.userAvatar}>
                            {user.name ? user.name[0].toUpperCase() : user.email?.[0].toUpperCase()}
                          </div>
                          <div className={styles.userDetails}>
                            <strong>{user.name || 'Nome não informado'}</strong>
                            <span className={styles.userId}>ID: {user.id}</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.tableCell}>
                        <span className={styles.email}>
                          {user.email || 'Email não informado'}
                        </span>
                      </div>
                      <div className={styles.tableCell}>
                        <span className={styles.planBadge}>
                          {getPlanLabel(user.plan_duration || '')}
                        </span>
                      </div>
                      <div className={styles.tableCell}>
                        <span className={styles.date}>
                          {user.registration_date 
                            ? format(new Date(user.registration_date), 'dd/MM/yyyy')
                            : 'Data não informada'
                          }
                        </span>
                      </div>
                      <div className={styles.tableCell}>
                        <span className={`${styles.statusBadge} ${user.active ? styles.active : styles.inactive}`}>
                          <i className={`fas ${user.active ? 'fa-check-circle' : 'fa-times-circle'}`} />
                          {user.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <div className={styles.tableCell}>
                        <div className={styles.actionButtons}>
                          <Link
                            to={`/dashboard/user/${user.id}`}
                            className={styles.editButton}
                            onClick={handleLinkClick}
                            title={`Editar ${user.name}`}
                          >
                            <i className="fas fa-edit" />
                          </Link>
                          <button
                            className={styles.deleteButton}
                            onClick={() => handleDelete(user.id, 'user')}
                            title={`Excluir ${user.name}`}
                          >
                            <i className="fas fa-trash" />
                          </button>
                          <button
                            className={styles.viewButton}
                            onClick={() => {/* Implementar visualização */}}
                            title={`Visualizar ${user.name}`}
                          >
                            <i className="fas fa-eye" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className={styles.paginationWrapper}>
                    <div className={styles.paginationInfo}>
                      Mostrando {indexOfFirstUser + 1} a {Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuários
                    </div>
                    <div className={styles.pagination}>
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                      >
                        <i className="fas fa-chevron-left" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`${styles.paginationButton} ${currentPage === number ? styles.active : ''}`}
                        >
                          {number}
                        </button>
                      ))}
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
                      >
                        <i className="fas fa-chevron-right" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    );
  };

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
            <div className={styles.brandLogo}>
              {settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt="Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }}
                />
              ) : settings?.app_name ? (
                settings.app_name
                  .split(' ')
                  .map((word) => word[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()
              ) : (
                'RF'
              )}
            </div>
            <h2 className={styles.title}>{settings?.app_name || 'Dashboard'}</h2>
          </div>
          <div className={styles.sidebarContent}>
            {user && (
              <div className={styles.info}>
                <div 
                  className={styles.userAvatar}
                  onClick={handleShowProfile}
                  style={{ cursor: 'pointer' }}
                  title="Clique para editar perfil"
                >
                  {user.name ? user.name[0] : user.email?.[0]}
                </div>
                <div className={styles.userInfo}>
                  <div 
                    className={styles.userName}
                    onClick={handleShowProfile}
                    style={{ cursor: 'pointer' }}
                    title="Clique para editar perfil"
                  >
                    {user.name || user.email}
                  </div>
                  <div className={styles.userRole}>
                    {userRole === 'super' ? 'Superusuário' : 'Master'}
                  </div>
                </div>
              </div>
            )}
            <div className={styles.menuItem}>
              <button
                className={`${styles.menuButton} ${currentView === 'masterConfig' ? styles.active : ''}`}
                onClick={() => navigateToView('masterConfig')}
              >
                <i className="fas fa-user-shield" /> Gerenciar Master Admins
              </button>
            </div>
            <div className={styles.menuItem}>
              <button
                className={`${styles.menuButton} ${currentView === 'users' ? styles.active : ''}`}
                onClick={() => navigateToView('users')}
              >
                <i className="fas fa-users" /> Gerenciar Usuários
              </button>
              {userRole === 'master' && (
                <div className={styles.subMenu}>
                  <button
                    onClick={() => navigate('/dashboard/user/new?type=pdf')}
                    className={styles.subMenuItem}
                  >
                    <i className="fas fa-file-pdf" /> Adicionar PDF
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/user/new?type=manual')}
                    className={styles.subMenuItem}
                  >
                    <i className="fas fa-edit" /> Cadastrar Manual
                  </button>
                </div>
              )}
            </div>
            <div className={styles.menuItem}>
              <button
                className={`${styles.menuButton} ${currentView === 'metrics' ? styles.active : ''}`}
                onClick={() => navigateToView('metrics')}
              >
                <i className="fas fa-chart-bar" /> Métricas
              </button>
            </div>
            <div className={styles.menuItem}>
              <button
                className={`${styles.menuButton} ${currentView === 'dashboardSettings' ? styles.active : ''}`}
                onClick={() => navigateToView('dashboardSettings')}
              >
                <i className="fas fa-cogs" /> Configurações
              </button>
            </div>
            <div className={styles.menuItem}>
              <button
                className={styles.menuButton}
                onClick={handleShowProfile}
              >
                <i className="fas fa-user-edit" /> Meu Perfil
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
            <button className={styles.buttonLogout} onClick={handleLogout}>
              <i className="fas fa-sign-out-alt" /> Sair
            </button>
          </div>
        </aside>
        <main className={styles.mainContent}>
          <Breadcrumbs />
          {currentView === 'masterConfig' && renderMasterUserConfig()}
          {currentView === 'users' && renderUserConfig()}
          {currentView === 'metrics' && <MetricsView metrics={metrics} users={users} />}
          {currentView === 'dashboardSettings' && <DashboardSettings settings={dashboardSettings} />}
          {showUserProfile && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <UserProfile onClose={handleCloseProfile} />
              </div>
            </div>
          )}
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;