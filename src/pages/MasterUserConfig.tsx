import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/masterUserConfig.module.css';
import { useTheme } from './ThemeProvider';

interface MasterUser {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  cpf: string;
  cref: string;
  photo_url?: string;
  password?: string;
  photo?: File;
}

const MasterUserConfig: React.FC<{ masterUser: MasterUser | null }> = ({ masterUser }) => {
  const { settings } = useTheme();
  const [formData, setFormData] = useState<MasterUser>({
    id: 0,
    name: '',
    email: '',
    phone_number: '',
    cpf: '',
    cref: '',
    photo_url: '',
    password: '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const apiKey = localStorage.getItem('apiKey');
  const deviceId = localStorage.getItem('deviceId');

  const loadImageWithAuth = async (url: string) => {
    if (!apiKey || !deviceId) {
      console.error('Missing authentication credentials');
      setError('Credenciais de autenticação ausentes');
      return `${url}?t=${new Date().getTime()}`;
    }
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Device-ID': deviceId,
        },
        responseType: 'blob',
      });
      return URL.createObjectURL(response.data);
    } catch (err) {
      console.error('Error fetching image:', err);
      setError('Erro ao carregar imagem');
      return `${url}?t=${new Date().getTime()}`;
    }
  };

  useEffect(() => {
    if (masterUser) {
      console.log('Received masterUser:', masterUser);
      setFormData(masterUser);
      if (masterUser.photo_url) {
        loadImageWithAuth(`http://localhost:3000${masterUser.photo_url}`).then(setPhotoPreview);
      } else {
        setPhotoPreview(null);
      }
    } else {
      console.warn('masterUser is null');
      setError('Dados do usuário master não disponíveis');
    }
  }, [masterUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setFormData({ ...formData, photo: file });
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterUser || !masterUser.id) {
      setError('Usuário master não carregado ou ID não disponível');
      return;
    }
    if (!apiKey || !deviceId) {
      setError('Credenciais de autenticação ausentes. Faça login novamente.');
      return;
    }

    setLoading(true);
    setError(null);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key !== 'photo_url' && formData[key as keyof MasterUser] !== undefined) {
        data.append(`master_user[${key}]`, formData[key as keyof MasterUser] as string);
      }
    });
    if (formData.photo) {
      console.log('Uploading photo:', formData.photo.name, formData.photo.type);
      data.append('master_user[photo]', formData.photo);
    }

    try {
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Device-ID': deviceId,
      };
      console.log('Sending update request with FormData:', Array.from(data.entries()));
      const response = await axios.put(
        `http://localhost:3000/api/v1/master_user/${formData.id}`,
        data,
        { headers }
      );
      console.log('Update response:', response.data);
      if (response.data.photo_url) {
        loadImageWithAuth(`http://localhost:3000${response.data.photo_url}`).then(setPhotoPreview);
      } else {
        setPhotoPreview(null);
      }
      alert('Usuário Master atualizado com sucesso!');
    } catch (err: any) {
      console.error('Error updating master user:', err.response?.data || err.message);
      const errorMessage =
        err.response?.data?.errors?.join(', ') ||
        err.response?.data?.error ||
        err.message ||
        'Erro ao atualizar usuário master';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  if (!masterUser) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>
          {settings?.app_name || 'Dashboard'} - Configurar Usuário Master
        </h2>
        <div className={styles.errorMessage}>Carregando dados do usuário master...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {settings?.app_name || 'Dashboard'} - Configurar Usuário Master
      </h2>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Nome</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Digite o nome"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Digite o email"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Telefone</label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            placeholder="Digite o telefone"
          />
        </div>
        <div className={styles.formGroup}>
          <label>CPF</label>
          <input
            type="text"
            name="cpf"
            value={formData.cpf}
            onChange={handleInputChange}
            placeholder="Digite o CPF"
          />
        </div>
        <div className={styles.formGroup}>
          <label>CREF</label>
          <input
            type="text"
            name="cref"
            value={formData.cref}
            onChange={handleInputChange}
            placeholder="Digite o CREF"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Senha</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password || ''}
              onChange={handleInputChange}
              placeholder="Digite a nova senha (opcional)"
            />
            <button
              type="button"
              className={styles.showPasswordButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>Foto</label>
          <input type="file" accept="image/*" onChange={handlePhotoChange} />
          {photoPreview && (
            <img src={photoPreview} alt="Foto preview" className={styles.photoPreview} />
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !formData.id}
          className={styles.submitButton}
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
};

export default MasterUserConfig;