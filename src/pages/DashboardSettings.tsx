import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/dashboardSettings.module.css';
import { useTheme } from './ThemeProvider';

interface IDashboardSettings {
  id?: number;
  primary_color: string;
  secondary_color: string;
  tertiary_color: string;
  app_name: string;
  logo_url?: string;
}

const DashboardSettings: React.FC<{ settings: IDashboardSettings | null }> = ({ settings }) => {
  const { updateSettings } = useTheme();
  const [formData, setFormData] = useState<IDashboardSettings>({
    primary_color: '#000000',
    secondary_color: '#333333',
    tertiary_color: '#666666',
    app_name: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentSettings, setCurrentSettings] = useState<IDashboardSettings | null>(settings);
  const apiKey = localStorage.getItem('apiKey');
  const deviceId = localStorage.getItem('deviceId');

  const loadImageWithAuth = async (url: string) => {
    if (!apiKey || !deviceId || !url || url.trim() === '') {
      console.error('Missing authentication credentials or invalid URL');
      return null;
    }

    try {
      const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;
      const response = await axios.get(fullUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Device-ID': deviceId,
        },
        responseType: 'blob',
        timeout: 10000,
      });

      const blob = response.data;
      if (blob.size === 0) {
        console.error('Received empty blob');
        return null;
      }
      
      return URL.createObjectURL(blob);
    } catch (err: any) {
      console.error('Error fetching image:', err);
      return null;
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setCurrentSettings(settings);
      updateFormData(settings);
    }
  }, [settings]);

  const loadSettings = async () => {
    if (!apiKey || !deviceId) {
      setError('Credenciais de autenticação ausentes. Faça login novamente.');
      return;
    }
    try {
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Device-ID': deviceId,
      };
      const response = await axios.get('http://localhost:3000/api/v1/dashboard_settings', { headers });
      const settingsData = Array.isArray(response.data) ? response.data[0] : response.data;

      if (settingsData) {
        setCurrentSettings(settingsData);
        updateFormData(settingsData);
        updateSettings(settingsData);
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      setError(error.response?.data?.error || 'Erro ao carregar configurações do dashboard');
    }
  };

  const updateFormData = async (settingsData: IDashboardSettings) => {
    setFormData({
      id: settingsData.id,
      primary_color: settingsData.primary_color || '#000000',
      secondary_color: settingsData.secondary_color || '#333333',
      tertiary_color: settingsData.tertiary_color || '#666666',
      app_name: settingsData.app_name || '',
    });
    
    if (settingsData.logo_url) {
      try {
        const imageUrl = await loadImageWithAuth(settingsData.logo_url);
        setLogoPreview(imageUrl);
      } catch (err) {
        console.error('Failed to load logo preview:', err);
        setLogoPreview(null);
      }
    } else {
      setLogoPreview(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('Arquivo deve ser PNG, JPEG ou JPG');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Arquivo deve ter menos de 5MB');
        return;
      }
      
      setError(null);
      setLogoFile(file);
      
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
      
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!apiKey || !deviceId) {
      setError('Credenciais de autenticação ausentes. Faça login novamente.');
      setLoading(false);
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Device-ID': deviceId,
      };

      const data = new FormData();
      data.append('dashboard_setting[primary_color]', formData.primary_color);
      data.append('dashboard_setting[secondary_color]', formData.secondary_color);
      data.append('dashboard_setting[tertiary_color]', formData.tertiary_color);
      data.append('dashboard_setting[app_name]', formData.app_name);
      
      if (logoFile) {
        data.append('dashboard_setting[logo]', logoFile);
      }

      let response;
      if (currentSettings && currentSettings.id && currentSettings.id > 0) {
        response = await axios.put(
          `http://localhost:3000/api/v1/dashboard_settings/${currentSettings.id}`,
          data,
          { headers }
        );
      } else {
        response = await axios.post(
          'http://localhost:3000/api/v1/dashboard_settings',
          data,
          { headers }
        );
      }

      const updatedSettings = response.data;
      setCurrentSettings(updatedSettings);
      setFormData((prev) => ({ ...prev, id: updatedSettings.id }));
      updateSettings(updatedSettings);
      
      setLogoFile(null);
      
      alert('Configurações do dashboard atualizadas com sucesso!');
      
      setTimeout(async () => {
        if (updatedSettings.logo_url) {
          try {
            const imageUrl = await loadImageWithAuth(updatedSettings.logo_url);
            setLogoPreview(imageUrl);
          } catch (err) {
            console.error('Failed to load updated logo preview:', err);
          }
        } else {
          setLogoPreview(null);
        }
      }, 1000);
      
    } catch (err: any) {
      console.error('Error updating dashboard settings:', err);
      const errorMessage =
        err.response?.data?.errors?.join(', ') ||
        err.response?.data?.error ||
        err.message ||
        'Erro ao atualizar configurações';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (logoPreview && logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Configurações do Dashboard</h2>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Cor Primária</label>
            <input
              type="color"
              name="primary_color"
              value={formData.primary_color}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Cor Secundária</label>
            <input
              type="color"
              name="secondary_color"
              value={formData.secondary_color}
              onChange={handleInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Cor Terciária</label>
            <input
              type="color"
              name="tertiary_color"
              value={formData.tertiary_color}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>Nome do App</label>
          <input
            type="text"
            name="app_name"
            value={formData.app_name}
            onChange={handleInputChange}
            placeholder="Digite o nome do aplicativo"
          />
        </div>
        <div className={styles.formGroup}>
          <label>Logo</label>
          <input 
            type="file" 
            accept="image/png,image/jpeg,image/jpg" 
            onChange={handleLogoChange} 
          />
          <small>Formatos aceitos: PNG, JPEG, JPG. Tamanho máximo: 5MB</small>
          {logoPreview && (
            <div className={styles.logoPreviewContainer}>
              <img src={logoPreview} alt="Logo preview" className={styles.logoPreview} />
            </div>
          )}
        </div>
        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
};

export default DashboardSettings;