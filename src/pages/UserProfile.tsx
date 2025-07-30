import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/UserProfile.module.css';
import * as Icons from '../components/Icons';

interface UserProfileData {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  cpf?: string;
  cref?: string;
  photo_url?: string;
  role: 'super' | 'master' | 'user';
  created_at: string;
  updated_at: string;
}

interface UserProfileProps {
  onClose?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    cpf: '',
    cref: '',
    photo: null as File | null,
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const navigate = useNavigate();
  const apiKey = localStorage.getItem('apiKey');
  const deviceId = localStorage.getItem('deviceId');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    if (!apiKey || !deviceId) {
      setError('Credenciais de autenticação não encontradas');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching user profile...'); // Debug log
      
      const response = await axios.get('http://localhost:3000/api/v1/dashboard/current_user_profile', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Device-ID': deviceId,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      });

      console.log('User profile response:', response.data); // Debug log

      const user = response.data;
      
      // Validate response data
      if (!user || !user.id) {
        throw new Error('Dados do usuário inválidos recebidos do servidor');
      }

      setUserData(user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        cpf: user.cpf || '',
        cref: user.cref || '',
        photo: null,
      });

      // Handle photo URL with proper error handling
      if (user.photo_url) {
        try {
          setPhotoPreview(user.photo_url);
        } catch (photoError) {
          console.warn('Error setting photo preview:', photoError);
          setPhotoPreview(null);
        }
      }

      setError(null); // Clear any previous errors
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      
      let errorMessage = 'Erro ao carregar perfil do usuário';
      
      if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 401) {
          errorMessage = 'Sessão expirada. Faça login novamente.';
          // Clear auth data and redirect to login
          localStorage.removeItem('apiKey');
          localStorage.removeItem('deviceId');
          localStorage.removeItem('userRole');
          setTimeout(() => navigate('/login'), 2000);
        } else if (status === 404) {
          errorMessage = 'Perfil de usuário não encontrado';
        } else if (status === 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
        } else if (data?.error) {
          errorMessage = data.error;
        } else if (data?.errors && Array.isArray(data.errors)) {
          errorMessage = data.errors.join(', ');
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (err.code === 'ECONNABORTED') {
        // Timeout error
        errorMessage = 'Tempo limite excedido. Tente novamente.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        photo: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.onerror = () => {
        setError('Erro ao processar a imagem');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !deviceId || !userData) return;

    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('user[name]', formData.name.trim());
      formDataToSend.append('user[email]', formData.email.trim());

      if (formData.phone_number?.trim()) {
        formDataToSend.append('user[phone_number]', formData.phone_number.trim());
      }

      if (userData.role === 'master') {
        if (formData.cpf?.trim()) {
          formDataToSend.append('user[cpf]', formData.cpf.trim());
        }
        if (formData.cpf?.trim()) {
          formDataToSend.append('user[cref]', formData.cref.trim());
        }
      }

      if (formData.photo) {
        formDataToSend.append('user[photo]', formData.photo);
      }

      const response = await axios.put(
        'http://localhost:3000/api/v1/dashboard/update_current_user',
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Device-ID': deviceId,
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 seconds for file upload
        }
      );

      // Update local state with new data
      const updatedUser = response.data.user;
      setUserData(updatedUser);
      setSuccess('Perfil atualizado com sucesso!');

      // Update photo preview if new photo was uploaded
      if (updatedUser?.photo_url) {
        setPhotoPreview(updatedUser.photo_url);
      }

      // Clear the file input
      setFormData(prev => ({ ...prev, photo: null }));

    } catch (err: any) {
      console.error('Error updating profile:', err);
      
      let errorMessage = 'Erro ao atualizar perfil';
      
      if (err.response?.data?.errors) {
        errorMessage = Array.isArray(err.response.data.errors) 
          ? err.response.data.errors.join(', ')
          : err.response.data.errors;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Tempo limite excedido. Tente novamente.';
      }
      
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !deviceId) return;

    // Client-side validation
    if (!passwordData.current_password.trim()) {
      setError('Por favor, digite sua senha atual');
      return;
    }

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      setError('Nova senha e confirmação não coincidem');
      return;
    }

    if (passwordData.new_password.length < 6) {
      setError('Nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setChangingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.put(
        'http://localhost:3000/api/v1/dashboard/change_password',
        {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
          new_password_confirmation: passwordData.new_password_confirmation,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Device-ID': deviceId,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      setSuccess('Senha alterada com sucesso!');
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (err: any) {
      console.error('Error changing password:', err);
      
      let errorMessage = 'Erro ao alterar senha';
      
      if (err.response?.data?.errors) {
        errorMessage = Array.isArray(err.response.data.errors)
          ? err.response.data.errors.join(', ')
          : err.response.data.errors;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(clearMessages, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Icons.Loading />
        <span>Carregando perfil...</span>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className={styles.errorContainer}>
        <Icons.Error />
        <h3>Erro ao Carregar Perfil</h3>
        <p>{error}</p>
        <div className={styles.errorActions}>
          <button onClick={fetchUserProfile} className={styles.retryButton}>
            Tentar Novamente
          </button>
          {onClose && (
            <button onClick={onClose} className={styles.closeButton}>
              Fechar
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={styles.errorContainer}>
        <Icons.Error />
        <h3>Dados Não Encontrados</h3>
        <p>Não foi possível carregar os dados do usuário</p>
        <div className={styles.errorActions}>
          <button onClick={fetchUserProfile} className={styles.retryButton}>
            Tentar Novamente
          </button>
          {onClose && (
            <button onClick={onClose} className={styles.closeButton}>
              Fechar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h2>Meu Perfil</h2>
        {onClose && (
          <button onClick={onClose} className={styles.closeButton} type="button">
            <Icons.Cancel />
          </button>
        )}
      </div>

      <div className={styles.profileTabs}>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('profile');
            clearMessages();
          }}
        >
          <Icons.User />
          Informações Pessoais
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'password' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('password');
            clearMessages();
          }}
        >
          <Icons.Lock />
          Alterar Senha
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <Icons.Error />
          <span>{error}</span>
          <button onClick={clearMessages} className={styles.closeMessageButton}>
            <Icons.Cancel />
          </button>
        </div>
      )}

      {success && (
        <div className={styles.successMessage}>
          <Icons.Success />
          <span>{success}</span>
          <button onClick={clearMessages} className={styles.closeMessageButton}>
            <Icons.Cancel />
          </button>
        </div>
      )}

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className={styles.profileForm}>
          <div className={styles.photoSection}>
            <div className={styles.photoPreview}>
              {photoPreview ? (
                <img src={photoPreview} alt="Foto do perfil" />
              ) : (
                <div className={styles.photoPlaceholder}>
                  <Icons.User />
                </div>
              )}
            </div>
            <div className={styles.photoControls}>
              <label htmlFor="photo" className={styles.photoButton}>
                <Icons.Camera />
                Alterar Foto
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
            <div className={styles.formGroup}>
              <label htmlFor="name">Nome Completo *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Digite seu nome completo"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="Digite seu email"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone_number">Telefone</label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
              />
            </div>

            {userData.role === 'master' && (
            <>
                <div className={styles.formGroup}>
                <label htmlFor="cpf">CPF *</label>
                <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="000.000.000-00"
                    required
                />
                </div>
                <div className={styles.formGroup}>
                <label htmlFor="cref">CREF *</label>
                <input
                    type="text"
                    id="cref"
                    name="cref"
                    value={formData.cref}
                    onChange={handleInputChange}
                    placeholder="000000-G/SP"
                    required
                />
                </div>
            </>
            )}
          </div>

          <div className={styles.profileInfo}>
            <div className={styles.infoItem}>
              <strong>Tipo de Conta:</strong>
              <span className={styles.roleBadge}>
                {userData.role === 'super' ? 'Super Usuário' 
                 : userData.role === 'master' ? 'Master Admin' 
                 : 'Usuário'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <strong>Cadastrado em:</strong>
              <span>{formatDate(userData.created_at)}</span>
            </div>
            <div className={styles.infoItem}>
              <strong>Última atualização:</strong>
              <span>{formatDate(userData.updated_at)}</span>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" disabled={updating} className={styles.updateButton}>
              {updating ? <Icons.Loading /> : <Icons.Save />}
              {updating ? 'Atualizando...' : 'Atualizar Perfil'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className={styles.passwordForm}>
          <div className={styles.formGroup}>
            <label htmlFor="current_password">Senha Atual *</label>
            <div className={styles.passwordInput}>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                id="current_password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                required
                placeholder="Digite sua senha atual"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className={styles.passwordToggle}
              >
                {showCurrentPassword ? <Icons.EyeOff /> : <Icons.Eye />}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="new_password">Nova Senha *</label>
            <div className={styles.passwordInput}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="new_password"
                name="new_password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                minLength={6}
                required
                placeholder="Digite a nova senha"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={styles.passwordToggle}
              >
                {showNewPassword ? <Icons.EyeOff /> : <Icons.Eye />}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="new_password_confirmation">Confirmar Nova Senha *</label>
            <div className={styles.passwordInput}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="new_password_confirmation"
                name="new_password_confirmation"
                value={passwordData.new_password_confirmation}
                onChange={handlePasswordChange}
                minLength={6}
                required
                placeholder="Confirme a nova senha"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={styles.passwordToggle}
              >
                {showConfirmPassword ? <Icons.EyeOff /> : <Icons.Eye />}
              </button>
            </div>
          </div>

          <div className={styles.passwordRequirements}>
            <h4>Requisitos da senha:</h4>
            <ul>
              <li className={passwordData.new_password.length >= 6 ? styles.valid : ''}>
                Mínimo de 6 caracteres
              </li>
              <li>Recomendamos usar letras, números e símbolos</li>
            </ul>
          </div>

          <div className={styles.formActions}>
            <button type="submit" disabled={changingPassword} className={styles.updateButton}>
              {changingPassword ? <Icons.Loading /> : <Icons.Lock />}
              {changingPassword ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserProfile;