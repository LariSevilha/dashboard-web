import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const payload = {
      user: { email, password },
    };
    console.log('Enviando payload:', payload); // Log do que está sendo enviado

    try {
      const response = await axios.post('http://localhost:3000/api/v1/users/sign_in', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Resposta do backend:', response.data); // Log da resposta
      const apiKey = response.data.api_key;
      localStorage.setItem('apiKey', apiKey);
      setError(null); // Limpa erro em caso de sucesso
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Erro na requisição:', err.response?.data || err.message); // Log do erro detalhado
      setError('Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
      />
      <button onClick={handleLogin}>Login</button>
      {error && <p>{error}</p>}
    </div>
  );
};

export default Login;