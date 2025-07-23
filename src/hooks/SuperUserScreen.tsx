import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { debounce } from 'lodash';
import styles from '../styles/superUserScreen.module.css';
import { useTheme } from '../pages/ThemeProvider';
import Footer from '../pages/Footer';
import Breadcrumbs from '../pages/Breadcrumbs';
import { MasterUser } from '../pages/types'; // Import da interface compartilhada

const SuperUserScreen: React.FC = () => {
  const { settings } = useTheme();
  const [masters, setMasters] = useState<MasterUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const navigate = useNavigate();
  const apiKey = localStorage.getItem('apiKey');
  const deviceId = localStorage.getItem('deviceId');

  const usersPerPage = 5;

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (!apiKey || !deviceId || role !== 'super') {
      navigate('/login');
      return;
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Device-ID': deviceId,
    };

    fetchMasters(headers);
  }, [navigate]);

  const fetchMasters = async (headers: any) => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/master_users', { headers });
      setMasters(response.data);
    } catch (err) {
      console.error('Error fetching masters:', err);
      setError('Erro ao carregar usuários master');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário master?')) return;
    if (!apiKey || !deviceId) return;

    try {
      await axios.delete(`http://localhost:3000/api/v1/master_users/${id}`, {
        headers: { Authorization: `Bearer ${apiKey}`, 'Device-ID': deviceId },
      });
      fetchMasters({ Authorization: `Bearer ${apiKey}`, 'Device-ID': deviceId });
    } catch (err) {
      console.error('Delete error:', err);
      setError('Erro ao deletar usuário master');
    }
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

  const filteredMasters = masters.filter(
    (m) =>
      (m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentMasters = filteredMasters.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredMasters.length / usersPerPage);

  return (
    <div className={styles.superUserContainer}>
      <header className={styles.header}>
        <h2 className={styles.title}>{settings?.app_name || 'Dashboard'} - Gerenciar Usuários Master</h2>
        <div className={styles.searchContainer}>
          <input
            className={styles.searchBar}
            type="text"
            placeholder="Buscar por nome ou email..."
            onChange={handleSearchChange}
          />
          <Link to="/dashboard/master/new" className={styles.addButton}>
            <i className="fas fa-plus" /> Adicionar Master
          </Link>
        </div>
      </header>
      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : error ? (
        <p className={styles.errorMessage}>{error}</p>
      ) : filteredMasters.length === 0 ? (
        <p className={styles.empty}>Nenhum usuário master encontrado.</p>
      ) : (
        <>
          <div className={styles.masterList}>
            {currentMasters.map((master) => (
              <div key={master.id} className={styles.masterItem}>
                <div className={styles.masterInfo}>
                  <strong>{master.name || 'Nome não disponível'}</strong>
                  <span>({master.email || 'Email não disponível'})</span>
                </div>
                <div className={styles.masterActions}>
                  <Link to={`/dashboard/master/${master.id}`} className={styles.editIcon}>
                    <i className="fas fa-edit" />
                  </Link>
                  <button onClick={() => handleDelete(master.id)} className={styles.deleteIcon}>
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filteredMasters.length > usersPerPage && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationButton}
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left" /> Anterior
              </button>
              <span className={styles.paginationInfo}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                className={styles.paginationButton}
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próximo <i className="fas fa-chevron-right" />
              </button>
            </div>
          )}
        </>
      )}
      <Breadcrumbs />
      <Footer />
    </div>
  );
};

export default SuperUserScreen;
export {}; 