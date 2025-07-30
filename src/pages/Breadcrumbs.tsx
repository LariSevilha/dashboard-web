import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../styles/breadcrumbs.module.css';
import { useTheme } from './ThemeProvider';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

interface BreadcrumbsProps {
  customItems?: BreadcrumbItem[];
  showHome?: boolean;
  separator?: 'slash' | 'chevron' | 'arrow';
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  customItems, 
  showHome = true, 
  separator = 'chevron' 
}) => {
  const { settings } = useTheme();
  const location = useLocation();
  
  // Generate breadcrumb items from URL if no custom items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;
    
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    if (showHome) {
      breadcrumbs.push({
        label: settings?.app_name || 'Dashboard',
        path: '/dashboard',
        icon: 'home'
      });
    }
    
    pathnames.forEach((name, index) => {
      const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
      const isLast = index === pathnames.length - 1;
      
      // Format the name for display
      const formatName = (str: string): string => {
        // Handle special cases
        const specialCases: { [key: string]: string } = {
          'dashboard': 'Dashboard',
          'user': 'Usuários',
          'users': 'Usuários',
          'master': 'Master Admins',
          'metrics': 'Métricas',
          'settings': 'Configurações',
          'new': 'Novo',
          'edit': 'Editar'
        };
        
        if (specialCases[str.toLowerCase()]) {
          return specialCases[str.toLowerCase()];
        }
        
        // Convert from kebab-case or snake_case to Title Case
        return str
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
      };
      
      // Determine icon based on route
      const getIcon = (routeName: string): string | undefined => {
        const iconMap: { [key: string]: string } = {
          'user': 'user',
          'users': 'users',
          'master': 'user-shield',
          'metrics': 'chart-bar',
          'settings': 'cogs',
          'new': 'plus',
          'edit': 'edit'
        };
        
        return iconMap[routeName.toLowerCase()];
      };
      
      breadcrumbs.push({
        label: formatName(name),
        path: isLast ? undefined : routeTo,
        icon: getIcon(name)
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  const getSeparatorIcon = (): string => {
    switch (separator) {
      case 'slash':
        return 'fa-slash';
      case 'arrow':
        return 'fa-arrow-right';
      case 'chevron':
      default:
        return 'fa-chevron-right';
    }
  };
  
  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number, isLast: boolean) => {
    const content = (
      <>
        {item.icon && (
          <i 
            className={`fas fa-${item.icon}`} 
            aria-hidden="true"
          />
        )}
        <span>{item.label}</span>
      </>
    );
    
    if (isLast || !item.path) {
      return (
        <span 
          key={index}
          className={styles.breadcrumbItem}
          aria-current="page"
        >
          {content}
        </span>
      );
    }
    
    return (
      <Link
        key={index}
        to={item.path}
        className={styles.breadcrumbItem}
        aria-label={`Navegar para ${item.label}`}
      >
        {content}
      </Link>
    );
  };
  
  if (breadcrumbs.length === 0) {
    return null;
  }
  
  return (
    <nav 
      className={styles.breadcrumbs}
      aria-label="Navegação estrutural"
      role="navigation"
    >
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <React.Fragment key={index}>
            {renderBreadcrumbItem(item, index, isLast)}
            {!isLast && (
              <span 
                className={styles.separator}
                aria-hidden="true"
              >
                <i className={`fas ${getSeparatorIcon()}`} />
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;