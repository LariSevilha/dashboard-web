import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as Icons from '../components/Icons';
import styles from '../styles/login.module.css';
import '../index.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedDeviceId = localStorage.getItem('deviceId');
    if (storedDeviceId) {
      setDeviceId(storedDeviceId);
    } else {
      const newDeviceId = Math.random().toString(36).substring(2);
      localStorage.setItem('deviceId', newDeviceId);
      setDeviceId(newDeviceId);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3000/api/v1/login', {
        user: { email, password },
        device_id: deviceId,
      });
      localStorage.setItem('apiKey', response.data.api_key);
      localStorage.setItem('userRole', response.data.role);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.title}>Login</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>
            <span className={styles.inputIcon}>
              <Icons.Email />
            </span>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            required
            aria-required="true"
          />
        </div>
        <div className={styles.inputGroup}>
          <label>
            <span className={styles.inputIcon}>
              <Icons.Password />
            </span>
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
            aria-required="true"
          />
        </div>
        {error && (
          <div className={styles.errorMessage} role="alert">
            {error}
          </div>
        )}
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? <Icons.Loading /> : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default Login; 