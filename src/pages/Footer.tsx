import React from 'react';
import styles from '../styles/footer.module.css';
import { useTheme } from './ThemeProvider';

const Footer: React.FC = () => {
  const { settings } = useTheme();

  return (
    <footer className={styles.footer}>
      <p>&copy; {new Date().getFullYear()} {settings?.app_name || 'Dashboard'}</p>
    </footer>
  );
};

export default Footer;