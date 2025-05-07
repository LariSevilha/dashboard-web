import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import api from '../api/axiosInstance';

const LoginContainer = styled.div`
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h2`
  color: #ffffff;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #2f3a3b;
  border: 1px solid #2f3a3b;
  border-radius: 8px;
  color: #b0b0b0;
  font-size: 1rem;

  &::placeholder {
    color: #b0b0b0;
  }
`;

const ForgotPasswordLink = styled.a`
  display: block;
  color: #b0b0b0;
  font-size: 0.9rem;
  text-decoration: none;
  margin-bottom: 1rem;

  &:hover {
    text-decoration: underline;
  }
`;

const Button = styled.button`
  width: 100%;
  background-color: #8b0000;
  color: #ffffff;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #a00000;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4040;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
    <LoginContainer>
      <Title>Faça login para continuar</Title>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
      />
      <ForgotPasswordLink href="#">Esqueceu sua senha?</ForgotPasswordLink>
      <Button onClick={handleLogin}>Entrar</Button>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </LoginContainer>
  );
};

export default Login;