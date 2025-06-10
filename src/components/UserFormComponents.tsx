// UserFormComponents.tsx
import React from 'react';
import * as Icons from './Icons';
import styles from '../styles/UserForm.module.css';

export const InputField: React.FC<{
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  icon?: React.ReactNode;
  optional?: boolean;
}> = ({ label, type, name, value, onChange, placeholder, required = false, icon, optional = false }) => {
  return (
    <div className={`${styles.inputGroup} ${value ? styles.filled : ''}`}>
      <label>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        {label}
        {optional && <span className={styles.optionalLabel}>(opcional)</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        aria-required={required}
      />
    </div>
  );
};

export const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
  required?: boolean;
}> = ({ label, value, onChange, name, options, icon, required = false }) => {
  return (
    <div className={`${styles.inputGroup} ${value ? styles.filled : ''}`}>
      <label>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        {label}
      </label>
      <select name={name} value={value} onChange={onChange} required={required} aria-required={required}>
        <option value="">Selecione...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const FileInputField: React.FC<{
  label: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  required?: boolean;
  currentFileName?: string;
  hasExistingFile?: boolean;
}> = ({ label, name, onChange, icon, required = false, currentFileName, hasExistingFile = false }) => {
  return (
    <div className={`${styles.inputGroup} ${styles.fileInputGroup} ${hasExistingFile || currentFileName ? styles.filled : ''}`}>
      <label>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        {label}
        {currentFileName && (
          <span className={styles.fileName}>
            <span className={styles.fileLabel}>Arquivo atual:</span>
            <span className={styles.fileNameText}>{currentFileName}</span>
          </span>
        )}
      </label>
      <input
        type="file"
        name={name}
        onChange={onChange}
        accept=".pdf"
        required={required && !hasExistingFile}
        aria-required={required && !hasExistingFile}
        className={styles.fileInput}
      />
      {hasExistingFile && (
        <small className={styles.fileHint}>
          Selecione um novo arquivo para substituir o atual, ou deixe em branco para manter o arquivo existente.
        </small>
      )}
    </div>
  );
};