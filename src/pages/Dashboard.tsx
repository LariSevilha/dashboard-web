import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import styles from '../styles/dashboard.module.css'; 

const WeekdayOptions = [
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
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      console.error('Data de registro inválida:', registrationDate);
      return null;
    }
    
    // Adiciona 30 dias ao invés de 1 mês (para ser mais preciso)
    date.setDate(date.getDate() + 30);
    return date;
  } catch (error) {
    console.error('Erro ao calcular data de expiração:', error);
    return null;
  }
};

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
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
      console.log('Users loaded:', response.data);
      
      // Debug: verificar os dados dos usuários
      response.data.forEach((user: any, index: number) => {
        console.log(`Usuário ${index + 1}:`, {
          name: user.name,
          email: user.email,
          registration_date: user.registration_date,
          created_at: user.created_at
        });
      });
      
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Users fetch error:', err);
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

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !user) return <p style={{ color: '#ffffff' }}>Carregando...</p>;

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.sidebar}>
        <h1 className={styles.title}>Dashboard</h1>
        {user && <p className={styles.info}>Bem-vindo, {user.name || user.email} ({user.role})</p>}
        <Link to="/dashboard/user/new">
          <button className={styles.button}>Adicionar Usuário</button>
        </Link>
        <button className={styles.button} onClick={handleLogout}>Sair</button>
      </div>

      <div className={styles.mainContent}>
        <input
          className={styles.searchBar}
          type="text"
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className={styles.userList}>
          <h3 className={styles.subtitle}>Usuários Cadastrados</h3>
          {loading ? (
            <p style={{ color: '#b0b0b0' }}>Carregando usuários...</p>
          ) : filteredUsers.length === 0 ? (
            <p style={{ color: '#b0b0b0' }}>Nenhum usuário encontrado.</p>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className={styles.userItem}>
                <div className={styles.userHeader}>
                  <div className={styles.userInfo}>
                    <strong>{u.name}</strong>
                    <span>({u.email})</span>
                  </div>
                  <div className={styles.userActions}>
                    <Link to={`/dashboard/user/${u.id}`}>
                      <span className={styles.editIcon} title="Editar">✏️</span>
                    </Link>
                    <span 
                      className={styles.deleteIcon} 
                      onClick={() => handleDelete(u.id)} 
                      title="Excluir"
                    >
                      🗑️
                    </span>
                  </div>
                </div> 
                <div className={styles.detailItem}>
                  <strong>Data de Expiração:</strong> 
                  {u.registration_date ? 
                    (() => {
                      const expirationDate = calculateExpirationDate(u.registration_date);
                      return expirationDate ? format(new Date(expirationDate), 'dd/MM/yyyy') : 'Data não disponível';
                    })() 
                    : 'Data não disponível'}
                </div> 
              </div>
            ))
          )}
        </div>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  );
};

export default Dashboard;