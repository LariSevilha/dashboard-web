import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface IDashboardSettings {
  id?: number;
  primary_color: string;
  secondary_color: string;
  tertiary_color: string;
  app_name: string;
  logo_url?: string;
}

interface ThemeContextType {
  settings: IDashboardSettings | null;
  updateSettings: (newSettings: IDashboardSettings) => void;
  applyTheme: (settings: IDashboardSettings) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<IDashboardSettings | null>(null);

  // Função para aplicar o tema no DOM de forma isolada
  const applyTheme = (themeSettings: IDashboardSettings) => {
    // Criar um container específico para o usuário atual
    const userId = localStorage.getItem('userId') || 'global';
    const containerId = `theme-container-${userId}`;
    
    // Aplicar CSS customizado apenas no contexto específico
    const root = document.documentElement;
    
    // Usar atributos de dados específicos para evitar conflitos
    root.setAttribute('data-user-theme', userId);
    root.style.setProperty(`--user-${userId}-primary-color`, themeSettings.primary_color);
    root.style.setProperty(`--user-${userId}-secondary-color`, themeSettings.secondary_color);
    root.style.setProperty(`--user-${userId}-tertiary-color`, themeSettings.tertiary_color);
    
    // Para uso imediato, também definir as variáveis padrão
    root.style.setProperty('--primary-color', themeSettings.primary_color);
    root.style.setProperty('--secondary-color', themeSettings.secondary_color);
    root.style.setProperty('--tertiary-color', themeSettings.tertiary_color);
    
    // Atualizar título da página
    if (themeSettings.app_name) {
      document.title = themeSettings.app_name;
    }
  };

  // Função para carregar configurações do usuário atual
  const loadUserSettings = async () => {
    const apiKey = localStorage.getItem('apiKey');
    const deviceId = localStorage.getItem('deviceId');
    const userRole = localStorage.getItem('userRole');
    
    if (!apiKey || !deviceId || !userRole) {
      console.error('Missing authentication credentials');
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Device-ID': deviceId,
      };
      
      const response = await axios.get('http://localhost:3000/api/v1/dashboard_settings', { headers });
      const userSettings = response.data;
      
      if (userSettings) {
        setSettings(userSettings);
        applyTheme(userSettings);
      }
    } catch (error) {
      console.error('Error loading user theme settings:', error);
      // Usar configurações padrão em caso de erro
      const defaultSettings: IDashboardSettings = {
        primary_color: '#000000',
        secondary_color: '#333333',
        tertiary_color: '#666666',
        app_name: 'Dashboard'
      };
      setSettings(defaultSettings);
      applyTheme(defaultSettings);
    }
  };

  // Carregar configurações na inicialização
  useEffect(() => {
    loadUserSettings();
  }, []);

  // Recarregar configurações quando o usuário mudar
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'apiKey' || e.key === 'userRole') {
        loadUserSettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateSettings = (newSettings: IDashboardSettings) => {
    setSettings(newSettings);
    applyTheme(newSettings);
  };

  const contextValue: ThemeContextType = {
    settings,
    updateSettings,
    applyTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Componente para aplicar estilos específicos do usuário
export const UserThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useTheme();
  const userId = localStorage.getItem('userId') || 'global';

  if (!settings) return <>{children}</>;

  // CSS inline para garantir que apenas este usuário veja suas cores
  const userSpecificStyles = {
    '--primary-color': settings.primary_color,
    '--secondary-color': settings.secondary_color,
    '--tertiary-color': settings.tertiary_color
  } as React.CSSProperties;

  return (
    <div 
      className="user-theme-wrapper" 
      style={userSpecificStyles}
      data-user-id={userId}
    >
      {children}
    </div>
  );
};