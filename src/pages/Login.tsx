// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/login.module.css';

interface LoginData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setError(null);
    setLoading(true);

    // Validação básica
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Email e senha são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      // Gerar um device ID único se não existir
      let deviceId = localStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('deviceId', deviceId);
      }

      console.log('Tentando fazer login...', { email: formData.email });

      const response = await axios.post('http://localhost:3000/api/v1/sessions', {
        session: {
          email: formData.email,
          password: formData.password,
          device_id: deviceId
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Device-ID': deviceId
        }
      });

      console.log('Resposta do login:', response.data);

      // Verificar se a resposta contém os dados necessários
      if (response.data && response.data.api_key) {
        // Salvar dados no localStorage
        localStorage.setItem('apiKey', response.data.api_key);
        localStorage.setItem('deviceId', deviceId);
        
        // Determinar o role do usuário
        let userRole = 'user'; // padrão
        if (response.data.user && response.data.user.role) {
          userRole = response.data.user.role;
        }
        
        localStorage.setItem('userRole', userRole);

        console.log('Login bem-sucedido, dados salvos:', {
          apiKey: response.data.api_key,
          userRole: userRole,
          deviceId: deviceId
        });

        // Pequeno delay para garantir que o localStorage foi salvo
        setTimeout(() => {
          console.log('Redirecionando para dashboard...');
          navigate('/dashboard', { replace: true });
        }, 100);
        
      } else {
        console.error('Resposta inválida do servidor:', response.data);
        setError('Resposta inválida do servidor - dados ausentes');
      }

    } catch (err: any) {
      console.error('Erro no login:', err);
      
      if (err.response?.status === 401) {
        setError('Email ou senha inválidos');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.errors) {
        setError(Array.isArray(err.response.data.errors) 
          ? err.response.data.errors.join(', ') 
          : err.response.data.errors);
      } else if (err.code === 'ECONNREFUSED') {
        setError('Erro de conexão: Servidor indisponível');
      } else if (err.message) {
        setError(`Erro de conexão: ${err.message}`);
      } else {
        setError('Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1 className={styles.title}>Login</h1>
          <p className={styles.subtitle}>Entre com suas credenciais</p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={styles.input}
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={styles.input}
              placeholder="Sua senha"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <i className="fas fa-exclamation-triangle" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin" />
                Entrando...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt" />
                Entrar
              </>
            )}
          </button>
        </form>
        
        {/* Debug info - remover em produção */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
            <details>
              <summary>Debug Info</summary>
              <pre>{JSON.stringify({
                formData,
                apiKey: localStorage.getItem('apiKey'),
                deviceId: localStorage.getItem('deviceId'),
                userRole: localStorage.getItem('userRole')
              }, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;