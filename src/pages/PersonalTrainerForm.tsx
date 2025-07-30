// PersonalTrainerForm.tsx - Correções para usar o endpoint correto

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/UserForm.module.css';

interface PersonalTrainerFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface PersonalTrainerData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  cpf: string;
  cref: string;
  phone_number: string;
  photo?: File | null;
}

const PersonalTrainerForm: React.FC<PersonalTrainerFormProps> = ({ onSuccess, onCancel }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PersonalTrainerData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    cpf: '',
    cref: '',
    phone_number: '',
    photo: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const apiKey = localStorage.getItem('apiKey');
  const deviceId = localStorage.getItem('deviceId');

  // Carregar dados se for edição
  useEffect(() => {
    if (id && apiKey && deviceId) {
      setLoading(true);
      axios
        .get(`http://localhost:3000/api/v1/master_users/${id}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Device-ID': deviceId,
          },
        })
        .then((response) => {
          const masterUser = response.data;
          setFormData({
            name: masterUser.name || '',
            email: masterUser.email || '',
            password: '',
            password_confirmation: '',
            cpf: masterUser.cpf || '',
            cref: masterUser.cref || '',
            phone_number: masterUser.phone_number || '',
            photo: null,
          });
          
          if (masterUser.photo_url) {
            setPhotoPreview(masterUser.photo_url);
          }
        })
        .catch((err) => {
          console.error('Error loading master user:', err);
          setError('Erro ao carregar dados do master user');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, apiKey, deviceId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho do arquivo (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB');
        return;
      }

      // Validar tipo do arquivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        photo: file,
      }));

      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomPassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    setFormData((prev) => ({ ...prev, password }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey || !deviceId) {
      setError('Credenciais de autenticação não encontradas');
      return;
    }

    // Validações
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    if (!id && !formData.password.trim()) {
      setError('Senha é obrigatória para novos usuários');
      return;
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      setError('Senha e confirmação não coincidem');
      return;
    }

    if (!formData.cpf.trim()) {
      setError('CPF é obrigatório');
      return;
    }

    if (!formData.cref.trim()) {
      setError('CREF é obrigatório');
      return;
    }

    if (!formData.phone_number.trim()) {
      setError('Telefone é obrigatório');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('master_user[name]', formData.name.trim());
      formDataToSend.append('master_user[email]', formData.email.trim());
      formDataToSend.append('master_user[cpf]', formData.cpf.trim());
      formDataToSend.append('master_user[cref]', formData.cref.trim());
      formDataToSend.append('master_user[phone_number]', formData.phone_number.trim());

      // Adicionar senha apenas se for criação ou se foi alterada
      if (formData.password.trim()) {
        formDataToSend.append('master_user[password]', formData.password);
        formDataToSend.append('master_user[password_confirmation]', formData.password_confirmation);
      }

      // Adicionar foto se foi selecionada
      if (formData.photo) {
        formDataToSend.append('master_user[photo]', formData.photo);
      }

      let response;
      if (id) {
        // Atualizar master user existente
        response = await axios.put(
          `http://localhost:3000/api/v1/master_users/${id}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Device-ID': deviceId,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        // Criar novo master user
        response = await axios.post(
          'http://localhost:3000/api/v1/master_users',
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Device-ID': deviceId,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }

      console.log('Master user saved successfully:', response.data);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Error saving master user:', err);
      
      let errorMessage = 'Erro ao salvar master user';
      
      if (err.response?.data?.errors) {
        errorMessage = Array.isArray(err.response.data.errors)
          ? err.response.data.errors.join(', ')
          : err.response.data.errors;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <span>Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2>{id ? 'Editar Master Admin' : 'Novo Master Admin'}</h2>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button onClick={() => setError(null)} className={styles.closeError}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Foto */}
        <div className={styles.photoSection}>
          <div className={styles.photoPreview}>
            {photoPreview ? (
              <img src={photoPreview} alt="Preview da foto" />
            ) : (
              <div className={styles.photoPlaceholder}>
                <i className="fas fa-user"></i>
              </div>
            )}
          </div>
          <div className={styles.photoControls}>
            <label htmlFor="photo" className={styles.photoButton}>
              <i className="fas fa-camera"></i>
              Selecionar Foto
            </label>
            <input
              type="file"
              id="photo"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className={styles.formGrid}>
          {/* Nome */}
          <div className={styles.formGroup}>
            <label htmlFor="name">Nome Completo *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Digite o nome completo"
            />
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Digite o email"
            />
          </div>

          {/* CPF */}
          <div className={styles.formGroup}>
            <label htmlFor="cpf">CPF *</label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleInputChange}
              required
              placeholder="000.000.000-00"
            />
          </div>

          {/* CREF */}
          <div className={styles.formGroup}>
            <label htmlFor="cref">CREF *</label>
            <input
              type="text"
              id="cref"
              name="cref"
              value={formData.cref}
              onChange={handleInputChange}
              required
              placeholder="000000-G/SP"
            />
          </div>

          {/* Telefone */}
          <div className={styles.formGroup}>
            <label htmlFor="phone_number">Telefone *</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
              required
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* Senha */}
          <div className={styles.formGroup}>
            <label htmlFor="password">
              {id ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha *'}
            </label>
            <div className={styles.passwordInput}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!id}
                minLength={6}
                placeholder={id ? 'Nova senha (opcional)' : 'Digite a senha'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.passwordToggle}
              >
                <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
              </button>
              <button
                type="button"
                onClick={generateRandomPassword}
                className={styles.generatePassword}
                title="Gerar senha aleatória"
              >
                <i className="fas fa-dice"></i>
              </button>
            </div>
          </div>

          {/* Confirmação de Senha */}
          <div className={styles.formGroup}>
            <label htmlFor="password_confirmation">
              {id ? 'Confirmar Nova Senha' : 'Confirmar Senha *'}
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleInputChange}
              required={!id || formData.password.trim() !== ''}
              minLength={6}
              placeholder="Confirme a senha"
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel || (() => navigate('/dashboard'))}
            className={styles.cancelButton}
            disabled={loading}
          >
            <i className="fas fa-times"></i>
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                {id ? 'Atualizando...' : 'Criando...'}
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                {id ? 'Atualizar Master Admin' : 'Criar Master Admin'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalTrainerForm;