// src/components/Dashboard.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
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
  const [currentView, setCurrentView] = useState<'users' | 'metrics' | 'masterConfig' | 'dashboardSettings' | 'personalTrainerConfig'>('users');
  const [userRole, setUserRole] = useState<'super' | 'master' | null>(null);
  const [theme, setTheme] = useState<string>(localStorage.getItem('theme') || 'dark');
  const [showPersonalTrainerForm, setShowPersonalTrainerForm] = useState<boolean>(false);
  const [showUserForm, setShowUserForm] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const chartRef = useRef<ChartJS | null>(null);
  const [showOptions, setShowOptions] = useState<boolean>(false);


  const usersPerPage = 5;
  const navigate = useNavigate();
  const apiKey = localStorage.getItem('apiKey');
  const deviceId = localStorage.getItem('deviceId');

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
  const handleLinkClick = () => isMobile && closeMobileMenu();
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  // Personal Trainer Form handlers
  const handlePersonalTrainerSuccess = () => {
    setShowPersonalTrainerForm(false);
    fetchMasterUsers({ Authorization: `Bearer ${apiKey}`, 'Device-ID': deviceId });
  };

  const handlePersonalTrainerCancel = () => {
    setShowPersonalTrainerForm(false);
  };

  // User Form handlers
  const handleUserSuccess = () => {
    setShowUserForm(false);
    fetchUsers({ Authorization: `Bearer ${apiKey}`, 'Device-ID': deviceId });
  };

  const handleUserCancel = () => {
    setShowUserForm(false);
  };

  const renderMasterUserConfig = () => (
    <div className={styles.configContainer}>
      <div className={styles.configHeader}>
        <h2 className={styles.title}>Gerenciar Master Admins</h2>
        {userRole === 'super' && (
          <button onClick={() => setShowPersonalTrainerForm(true)} className={styles.addButton}>
            <i className="fas fa-user-plus" /> Novo Master Admin
          </button>
        )}
      </div>
      {showPersonalTrainerForm && userRole === 'super' && (
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

  const renderUserConfig = () => (
    <div className={styles.configContainer}>
      <div className={styles.configHeader}>
        <h2 className={styles.title}>Gerenciar Usuários</h2>
        {userRole === 'master' && (
          <button onClick={() => setShowUserForm(true)} className={styles.addButton}>
            <i className="fas fa-user-plus" /> Novo Usuário
          </button>
        )}
      </div>
      
      {showUserForm && userRole === 'master' && (
        <UserForm
          onSuccess={handleUserSuccess}
          onCancel={handleUserCancel}
        />
      )}
      <h3 className={styles.subtitle}>Usuários Cadastrados</h3>
      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : error ? (
        <p className={styles.errorMessage}>{error}</p>
      ) : users.length === 0 ? (
        <p className={styles.empty}>Nenhum usuário encontrado.</p>
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
                  to={`/dashboard/user/${u.id}`}
                  aria-label={`Editar usuário ${u.name}`}
                  onClick={handleLinkClick}
                  className={styles.editIcon}
                >
                  <i className="fas fa-edit" />
                </Link>
                <button
                  className={styles.deleteIcon}
                  onClick={() => handleDelete(u.id, 'user')}
                  aria-label={`Excluir usuário ${u.name}`}
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

  return (
    <div className={styles.dashboardContainer}>
      <aside className={`${styles.sidebar} ${isMobile && isMobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.sidebarHeader}>
          {isMobile && <button className={styles.sidebarCloseButton} onClick={closeMobileMenu}><i className="fas fa-times" /></button>}
          <div className={styles.brandLogo}>{settings?.app_name?.[0] || 'D'}</div>
          <h2 className={styles.title}>{settings?.app_name || 'Dashboard'}</h2>
        </div>
        <div className={styles.sidebarContent}>
          {user && (
            <div className={styles.info}>
              <div className={styles.userAvatar}>{user.name?.[0] || user.email?.[0]}</div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>{user.name || user.email}</div>
                <div className={styles.userRole}>{userRole === 'super' ? 'Superusuário' : 'Master'}</div>
              </div>
            </div>
          )}
          <div className={styles.menuItem}>
            <button
              className={`${styles.menuButton} ${currentView === 'masterConfig' ? styles.active : ''}`}
              onClick={() => { setCurrentView('masterConfig'); handleLinkClick(); }}
            >
              <i className="fas fa-users" /> Gerenciar Master Admins
            </button>
          </div>
          <div className={styles.menuItem}>
            <button
              className={`${styles.menuButton} ${currentView === 'users' ? styles.active : ''}`}
              onClick={() => { setCurrentView('users'); handleLinkClick(); }}
            >
              <i className="fas fa-users" /> Gerenciar Usuários
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
              onClick={() => { setCurrentView('metrics'); handleLinkClick(); }}
            >
              <i className="fas fa-chart-bar" /> Métricas
            </button>
          </div>
          <div className={styles.menuItem}>
            <button
              className={`${styles.menuButton} ${currentView === 'dashboardSettings' ? styles.active : ''}`}
              onClick={() => { setCurrentView('dashboardSettings'); handleLinkClick(); }}
            >
              <i className="fas fa-cogs" /> Configurações
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
        <Footer />
      </main>
    </div>
  );
};

export default Dashboard;