import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import styles from '../styles/login.module.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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

    if (!email || !password) {
      setError('Por favor, preencha o email e a senha.');
      setSuccess(null);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/v1/users/sign_in', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

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

      setSuccess(`Bem-vindo, ${user.email}!`);
      setError(null);
      setTimeout(() => navigate('/dashboard'), 2000); // Delay to show success message
    } catch (err: any) {
      let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';
      if (err.response) {
        errorMessage = err.response.data?.error || `Erro ${err.response.status}: ${err.response.statusText}`;
      } else if (err.request) {
        errorMessage = 'Erro de rede: Não foi possível conectar ao servidor.';
      } else {
        errorMessage = `Erro: ${err.message}`;
      }
      setError(errorMessage);
      setSuccess(null);
    }
  };

  return (
    // Removi as classes Tailwind de flex e centering aqui, pois o body CSS vai lidar com isso
    // Deixei apenas o min-h-screen bg-black, se você quiser manter o fundo preto do Tailwind.
    <div className="min-h-screen bg-black">
      <motion.div
        className={styles.loginContainer}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className={styles.title}>Faça login para continuar</h2>

        {/* Use the new inputGroup for consistent styling */}
        <div className={styles.inputGroup}>
          <label htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu email"
          />
        </div>

        {/* Use the new passwordContainer with an inner wrapper for the input and toggle */}
        <div className={styles.passwordContainer}>
          <label htmlFor="password">
            Senha
          </label>
          <div className={styles.passwordInputWrapper}> {/* New wrapper div */}
            <input
              id="password"
              className={styles.input}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={styles.togglePassword}
              aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <label className={styles.rememberMeContainer}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Salvar credenciais
        </label>

        <a href="#" className={styles.forgotPasswordLink}>
          Esqueceu sua senha?
        </a>

        <button className={styles.button} onClick={handleLogin}>
          Entrar
        </button>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}
      </motion.div>
      <motion.div
        className="absolute bottom-10 w-32 h-1 bg-gold rounded-full opacity-50"
        initial={{ width: 0 }}
        animate={{ width: '8rem' }}
        transition={{ duration: 0.8, delay: 0.8 }}
      />
    </div>
  );
};

export default Login;