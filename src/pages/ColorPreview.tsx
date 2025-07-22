

// =============================================================================
// MAPEAMENTO DE ONDE CADA COR SERÁ APLICADA
// =============================================================================

export const COLOR_MAPPING = {
  PRIMARY_COLOR: {
    description: "Cor Principal - Usada para elementos primários",
    usage: [
      "Sidebar (fundo principal)",
      "Botões principais (Adicionar Usuário, Salvar, etc.)",
      "Abas ativas",
      "Links principais",
      "Ícones de ação primária",
      "Barra de progresso",
      "Indicadores de status ativo"
    ]
  },
  
  SECONDARY_COLOR: {
    description: "Cor Secundária - Usada para elementos de apoio",
    usage: [
      "Header/Cabeçalho do dashboard",
      "Botões secundários (Editar, Configurações)",
      "Sidebar quando item está ativo/selecionado",
      "Bordas de elementos ativos",
      "Ícones secundários",
      "Elementos de navegação",
      "Botão de logout (hover)"
    ]
  },
  
  TERTIARY_COLOR: {
    description: "Cor Terciária - Usada para detalhes e acentos",
    usage: [
      "Detalhes e acentos",
      "Hover em botões e links",
      "Indicadores de notificação",
      "Elementos de destaque suave",
      "Bordas de campos ativos",
      "Tooltips e popups",
      "Elementos de feedback visual"
    ]
  },
  
  LOGO: {
    description: "Logo - Aplicado em locais estratégicos",
    usage: [
      "Sidebar (canto superior - substituindo 'RF')",
      "Favicon da página",
      "Header do dashboard (opcional)",
      "Tela de login (se existir)",
      "Emails automáticos do sistema (se houver)",
      "Relatórios exportados (cabeçalho)"
    ]
  },
  
  APP_NAME: {
    description: "Nome do App - Usado para branding",
    usage: [
      "Título da página (document.title)",
      "Texto ao lado do logo na sidebar",
      "Header principal do sistema",
      "Breadcrumbs (se houver)",
      "Rodapé do sistema",
      "Meta tags da página"
    ]
  }
};

// Componente de demonstração das cores
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
          <div style={{ 
            backgroundColor: settings.primary_color, 
            color: 'white', 
            padding: '10px', 
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            {settings.primary_color}
          </div>
          <p><strong>Usado em:</strong> Sidebar, Botões principais, Abas ativas</p>
        </div>
        
        {/* Cor Secundária */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
          <h4>Cor Secundária</h4>
          <div style={{ 
            backgroundColor: settings.secondary_color, 
            color: 'white', 
            padding: '10px', 
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            {settings.secondary_color}
          </div>
          <p><strong>Usado em:</strong> Header, Botões secundários, Elementos ativos</p>
        </div>
        
        {/* Cor Terciária */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
          <h4>Cor Terciária</h4>
          <div style={{ 
            backgroundColor: settings.tertiary_color, 
            color: 'white', 
            padding: '10px', 
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            {settings.tertiary_color}
          </div>
          <p><strong>Usado em:</strong> Acentos, Hover, Detalhes, Indicadores</p>
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

function useTheme(): { settings: any } {
    // Mock implementation of the theme settings
    const settings = {
        primary_color: "var(--primary-color)",
        secondary_color: "var(--secondary-color)",
        tertiary_color: "var(--tertiary-color)",
        app_name: "Dashboard App",
    };

    return { settings };
}
