import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import styles from '../styles/login.module.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async () => {
    const deviceId = uuidv4();
    const payload = { user: { email, password, device_id: deviceId } };
    console.log('Enviando requisição de login:', payload);

    try {
      const response = await axios.post('http://localhost:3000/api/v1/users/sign_in', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Resposta do backend:', response.data);

      const { api_key, user } = response.data;
      localStorage.setItem('apiKey', api_key);
      localStorage.setItem('deviceId', deviceId);
      localStorage.setItem('userRole', user.role);

      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
        localStorage.setItem('savedPassword', password);
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPassword');
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Erro na requisição:', err);
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
      if (err.response) {
        errorMessage = err.response.data?.error || `Erro ${err.response.status}: ${err.response.statusText}`;
      } else if (err.request) {
        errorMessage = 'Erro de rede: Não foi possível conectar ao servidor. Verifique sua conexão ou o CORS.';
      } else {
        errorMessage = `Erro: ${err.message}`;
      }
      setError(errorMessage);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.title}>Faça login para continuar</h2>
      <input
        className={styles.input}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        className={styles.input}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
      />

      <label className={styles.rememberMeContainer}>
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        Salvar credenciais
      </label>

      <a href="#" className={styles.forgotPasswordLink}>Esqueceu sua senha?</a>
      <button className={styles.button} onClick={handleLogin}>Entrar</button>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default Login;