// src/components/UserDetails.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import styles from '../styles/UserDetails.module.css';
import { User } from '../pages/MetricsTypes';

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const apiKey = localStorage.getItem('apiKey');
  const deviceId = localStorage.getItem('deviceId');

  useEffect(() => {
    if (!apiKey || !deviceId) {
      navigate('/login');
      return;
    }

    axios
      .get(`http://localhost:3000/api/v1/users/${id}`, {
        headers: { Authorization: `Bearer ${apiKey}`, 'Device-ID': deviceId },
      })
      .then((response) => {
        setUser(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching user:', err);
        setError('Erro ao carregar detalhes do usuário');
        setLoading(false);
      });
  }, [id, navigate, apiKey, deviceId]);

  if (loading) return <div className={styles.loading}>Carregando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!user) return <div className={styles.error}>Usuário não encontrado</div>;

  return (
    <div className={styles.userDetailsContainer}>
      <h2>Detalhes do Usuário</h2>
      <div className={styles.userInfo}>
        <p><strong>Nome:</strong> {user.name || 'Não informado'}</p>
        <p><strong>Email:</strong> {user.email || 'Não informado'}</p>
        <p><strong>Plano:</strong> {user.plan_duration || 'Não informado'}</p>
        <p>
          <strong>Data de Cadastro:</strong>{' '}
          {user.registration_date && !isNaN(new Date(user.registration_date).getTime())
            ? format(new Date(user.registration_date), 'dd/MM/yyyy')
            : 'Não informado'}
        </p>
        <p><strong>Status:</strong> {user.active ? 'Ativo' : 'Inativo'}</p>
      </div>
      <button onClick={() => navigate('/dashboard')} className={styles.backButton}>
        Voltar
      </button>
    </div>
  );
};

export default UserDetails;