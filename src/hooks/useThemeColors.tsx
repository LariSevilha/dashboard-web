import React from 'react';
import { useTheme } from '../pages/ThemeProvider';

export const ColorPreview: React.FC = () => {
  const { settings } = useTheme();

  if (!settings) return <div>Carregando tema...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h3>Preview das Cores Aplicadas</h3>
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Cor Primária */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
          <h4>Cor Primária</h4>
          <div
            style={{
              backgroundColor: settings.primary_color,
              color: 'white',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '10px',
            }}
          >
            {settings.primary_color}
          </div>
          <p>
            <strong>Usado em:</strong> Sidebar, Botões principais, Abas ativas
          </p>
        </div>

        {/* Cor Secundária */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
          <h4>Cor Secundária</h4>
          <div
            style={{
              backgroundColor: settings.secondary_color,
              color: 'white',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '10px',
            }}
          >
            {settings.secondary_color}
          </div>
          <p>
            <strong>Usado em:</strong> Header, Botões secundários, Elementos ativos
          </p>
        </div>

        {/* Cor Terciária */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
          <h4>Cor Terciária</h4>
          <div
            style={{
              backgroundColor: settings.tertiary_color,
              color: 'white',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '10px',
            }}
          >
            {settings.tertiary_color}
          </div>
          <p>
            <strong>Usado em:</strong> Acentos, Hover, Detalhes, Indicadores
          </p>
        </div>
      </div>

      {/* Logo e Nome */}
      <div style={{ marginTop: '20px', border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
        <h4>Branding</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {settings.logo_url && (
            <img
              src={`http://localhost:3000${settings.logo_url}`}
              alt="Logo"
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            />
          )}
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {settings.app_name || 'Nome do App'}
          </span>
        </div>
      </div>
    </div>
  );
};