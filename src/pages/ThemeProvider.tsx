import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface ThemeSettings {
  primary_color: string;
  secondary_color: string;
  tertiary_color: string;
  app_name: string;
  logo_url?: string;
}

interface ThemeContextType {
  settings: ThemeSettings | null;
  updateSettings: (newSettings: ThemeSettings) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettings | null>(null);

  useEffect(() => {
    loadThemeSettings();
  }, []);

  const loadThemeSettings = async () => {
    try {
      const apiKey = localStorage.getItem('apiKey');
      const deviceId = localStorage.getItem('deviceId');
      if (!apiKey || !deviceId) return;

      const headers = {
        Authorization: `Bearer ${apiKey}`,
        'Device-ID': deviceId,
      };

      const response = await axios.get('http://localhost:3000/api/v1/dashboard_settings', { headers });
      const settingsData = Array.isArray(response.data) ? response.data[0] : response.data;

      if (settingsData && settingsData.id) {
        setSettings(settingsData);
      } else {
        setSettings({
          primary_color: '#2563eb',
          secondary_color: '#1e40af',
          tertiary_color: '#3b82f6',
          app_name: 'Dashboard',
        });
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
      setSettings({
        primary_color: '#2563eb',
        secondary_color: '#1e40af',
        tertiary_color: '#3b82f6',
        app_name: 'Dashboard',
      });
    }
  };

  const updateSettings = (newSettings: ThemeSettings) => {
    setSettings(newSettings);
  };

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    // Primary Colors
    root.style.setProperty('--primary-color', settings.primary_color);
    root.style.setProperty('--primary-color-light', lightenColor(settings.primary_color, 20));
    root.style.setProperty('--primary-color-dark', darkenColor(settings.primary_color, 20));

    // Secondary Colors
    root.style.setProperty('--secondary-color', settings.secondary_color);
    root.style.setProperty('--secondary-color-light', lightenColor(settings.secondary_color, 20));
    root.style.setProperty('--secondary-color-dark', darkenColor(settings.secondary_color, 20));

    // Tertiary Colors
    root.style.setProperty('--tertiary-color', settings.tertiary_color);
    root.style.setProperty('--tertiary-color-light', lightenColor(settings.tertiary_color, 30));
    root.style.setProperty('--tertiary-color-dark', darkenColor(settings.tertiary_color, 20));

    // Component-specific Colors
    root.style.setProperty('--sidebar-bg', settings.primary_color);
    root.style.setProperty('--sidebar-text', 'white');
    root.style.setProperty('--sidebar-hover', lightenColor(settings.primary_color, 15));
    root.style.setProperty('--sidebar-active', settings.secondary_color);

    root.style.setProperty('--button-primary-bg', settings.primary_color);
    root.style.setProperty('--button-primary-text', 'white');
    root.style.setProperty('--button-primary-hover', darkenColor(settings.primary_color, 15));

    root.style.setProperty('--button-secondary-bg', settings.secondary_color);
    root.style.setProperty('--button-secondary-text', 'white');
    root.style.setProperty('--button-secondary-hover', darkenColor(settings.secondary_color, 15));

    root.style.setProperty('--header-bg', settings.secondary_color);
    root.style.setProperty('--header-text', 'white');

    root.style.setProperty('--active-tab-bg', settings.primary_color);
    root.style.setProperty('--active-tab-text', 'white');
    root.style.setProperty('--tab-hover', lightenColor(settings.primary_color, 25));
    root.style.setProperty('--tab-border', settings.primary_color);

    root.style.setProperty('--accent-color', settings.tertiary_color);
    root.style.setProperty('--accent-hover', darkenColor(settings.tertiary_color, 15));
    root.style.setProperty('--accent-light', lightenColor(settings.tertiary_color, 30));

    root.style.setProperty('--edit-icon-color', settings.tertiary_color);
    root.style.setProperty('--edit-icon-hover-bg', settings.tertiary_color);
    root.style.setProperty('--edit-icon-hover-text', 'white');

    root.style.setProperty('--search-border-focus', settings.tertiary_color);
    root.style.setProperty('--search-icon-color', settings.tertiary_color);
    root.style.setProperty('--search-shadow-color', `${hexToRgb(settings.tertiary_color)}, 0.1`);

    root.style.setProperty('--brand-logo-bg', settings.tertiary_color);
    root.style.setProperty('--brand-logo-text', 'white');

    root.style.setProperty('--user-avatar-bg', settings.tertiary_color);
    root.style.setProperty('--user-avatar-text', 'white');

    root.style.setProperty('--mobile-menu-bg', settings.primary_color);
    root.style.setProperty('--mobile-menu-text', 'white');

    root.style.setProperty('--submenu-border', settings.tertiary_color);
    root.style.setProperty('--submenu-hover-bg', darkenColor(settings.tertiary_color, 10));
    root.style.setProperty('--submenu-hover-text', 'white');

    root.style.setProperty('--pagination-button-bg', settings.primary_color);
    root.style.setProperty('--pagination-button-text', 'white');
    root.style.setProperty('--pagination-button-hover', darkenColor(settings.primary_color, 15));

    // Update document title
    document.title = settings.app_name || 'Dashboard';

    // Update meta tags
    updateMetaTags(settings.app_name);

    // Update favicon
    if (settings.logo_url) {
      updateFavicon(settings.logo_url);
    }

    // Update sidebar logo
    updateSidebarLogo(settings);
  }, [settings]);

  return (
    <ThemeContext.Provider value={{ settings, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Helper functions (same as in your code)
function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `${r}, ${g}, ${b}`;
}

function updateMetaTags(appName: string) {
  let metaTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
  if (!metaTitle) {
    metaTitle = document.createElement('meta');
    metaTitle.setAttribute('property', 'og:title');
    document.head.appendChild(metaTitle);
  }
  metaTitle.content = appName || 'Dashboard';

  let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement;
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = `${appName || 'Dashboard'} - Sistema de gerenciamento`;
}

function updateFavicon(logoUrl: string) {
  const existingFavicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (existingFavicon) {
    existingFavicon.remove();
  }
  const link = document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = `http://localhost:3000${logoUrl}`;
  document.getElementsByTagName('head')[0].appendChild(link);
}

function updateSidebarLogo(settings: ThemeSettings) {
  const logoElement = document.querySelector('.dashboardContainer .brandLogo') as HTMLElement;
  const titleElement = document.querySelector('.dashboardContainer .title') as HTMLElement;

  if (logoElement) {
    if (settings.logo_url) {
      logoElement.innerHTML = `<img src="http://localhost:3000${settings.logo_url}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain; border-radius: 4px;" />`;
    } else {
      const initials = settings.app_name
        ? settings.app_name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .substring(0, 2)
            .toUpperCase()
        : 'RF';
      logoElement.textContent = initials;
    }
  }

  if (titleElement && settings.app_name) {
    titleElement.textContent = settings.app_name;
  }
}