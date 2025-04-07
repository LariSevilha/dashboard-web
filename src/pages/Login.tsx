import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
 
const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
  }
`;
 
const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(to bottom, #2f3a3b 50%, #8b0000 100%);
  padding: 1rem;
  box-sizing: border-box;
`;

const LoginContainer = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: #2f3a3b;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Logo = styled.div`
  margin-bottom: 1.5rem;
  color: #ffffff;
  font-size: 2rem;
  font-weight: bold;
  text-transform: uppercase;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  span {
    color: #ff0000;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #ffffff;
  margin-bottom: 1.5rem;
  font-weight: 500;
  font-size: 0.9rem;
  text-transform: uppercase;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #555;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #ffffff;
  color: #000000;
  box-sizing: border-box;

  &::placeholder {
    color: #aaaaaa;
  }
`;

const ForgotPasswordLink = styled.a`
  display: block;
  color: #aaaaaa;
  font-size: 0.9rem;
  margin: 0.5rem 0 1.5rem;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #8b0000;
  color: #ffffff;
  border: none;
  border-radius: 4px;
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

const Footer = styled.div`
  margin-top: 1.5rem;
  color: #ffffff;
  font-size: 0.9rem;

  span {
    color: #ff0000;
  }
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, #ff0000, transparent);
  margin: 1rem 0;
`;

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const deviceId = crypto.randomUUID();
      const response = await axios.post('http://localhost:3000/api/v1/sessions', {
        email,
        password,
        device_id: deviceId,
      });

      localStorage.setItem('apiKey', response.data.api_key);
      localStorage.setItem('deviceId', deviceId);
      localStorage.setItem('userRole', response.data.user.role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    }
  };

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <LoginContainer>
        <img src="/img/logo.png" alt="Renato Frutuoso Logo" style={{ width: '100%', maxWidth: '200px' }} />

          <Logo>
            Renato <span>Frutuoso</span>
            <div style={{ fontSize: '0.8rem', fontWeight: 'normal', marginTop: '0.5rem' }}>
              Consultoria Esportiva Online
            </div>
          </Logo>
          <Subtitle>Faça login para continuar</Subtitle>
          <form onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <ForgotPasswordLink href="#">Esqueceu sua senha?</ForgotPasswordLink>
            <Button type="submit">Entrar</Button>
          </form>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Divider />
          <Footer>
            Renato Frutuoso <span>cref 0000</span>
          </Footer>
        </LoginContainer>
      </PageContainer>
    </>
  );
};

export default Login;