import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../styles/breadcrumbs.module.css';
import { useTheme } from './ThemeProvider';

const Breadcrumbs: React.FC = () => {
  const { settings } = useTheme();
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className={styles.breadcrumbs}>
      <Link to="/dashboard" className={styles.breadcrumbItem}>
        {settings?.app_name || 'Dashboard'}
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        return (
          <span key={routeTo} className={styles.breadcrumbItem}>
            {isLast ? (
              name
            ) : (
              <>
                <Link to={routeTo}>{name}</Link>
                <span className={styles.separator}>/</span>
              </>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;