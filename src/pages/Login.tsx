import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as Icons from '../components/Icons';
import styles from '../styles/login.module.css';
import '../index.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedDeviceId = localStorage.getItem('deviceId');
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    const remembered = localStorage.getItem('rememberMe') === 'true';

    if (storedDeviceId) {
      setDeviceId(storedDeviceId);
    } else {
      const newDeviceId = Math.random().toString(36).substring(2);
      localStorage.setItem('deviceId', newDeviceId);
      setDeviceId(newDeviceId);
    }

    if (remembered && savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e : any) => {
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

      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('savedPassword', password);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPassword');
        localStorage.removeItem('rememberMe');
      }

      navigate('/dashboard');
    } catch (err : any) {
      console.error('Login error:', err);
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.loginContainer}>
      <img src="favicon.ico" alt="Logo" className={styles.logo} />
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <span className={styles.inputIcon}>
            <Icons.Email />
          </span>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            required
            aria-required="true"
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Senha</label>
          <span className={styles.inputIcon}>
            <Icons.Password />
          </span>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            required
            aria-required="true"
            className={styles.input}
          />
          <button
            type="button"
            className={styles.togglePassword}
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <Icons.EyeClose /> : <Icons.EyeOpen />}
          </button>
        </div>
        <div className={styles.rememberMeContainer}>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            aria-label="Salvar login"
          />
          <label htmlFor="rememberMe">Salvar login</label>
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