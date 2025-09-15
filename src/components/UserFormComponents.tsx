import React, { ChangeEvent } from 'react';
import styles from '../styles/UserForm.module.css';

interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  optional?: boolean;
  error?: string;
  disabled?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  icon,
  optional = false,
  error,
  disabled = false,
}) => (
  <div className={styles.inputGroup}>
    <label htmlFor={name} className={styles.label}>
      {label}
      {optional && <span className={styles.optional}>(Opcional)</span>}
    </label>
    <div className={styles.inputWrapper}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.error : ''}`}
        disabled={disabled}
      />
    </div>
    {error && <span className={styles.errorMessage}>{error}</span>}
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
  name: string;
  error?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  icon,
  name,
  error,
}) => (
  <div className={styles.inputGroup}>
    <label htmlFor={name} className={styles.label}>
      {label}
    </label>
    <div className={styles.inputWrapper}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`${styles.select} ${error ? styles.error : ''}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
    {error && <span className={styles.errorMessage}>{error}</span>}
  </div>
); 

interface FileInputFieldProps {
  label: string;
  name: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  required?: boolean;
  currentFileName?: string;
  hasExistingFile?: boolean;
  error?: string;
}

export const FileInputField: React.FC<FileInputFieldProps> = ({
  label,
  name,
  onChange,
  icon,
  required = false,
  currentFileName,
  hasExistingFile = false,
  error,
}) => (
  <div className={styles.inputGroup}>
    <label htmlFor={name} className={styles.label}>
      {label}
      {required && !hasExistingFile && <span className={styles.required}>*</span>}
    </label>
    <div className={styles.inputWrapper}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <input
        type="file"
        id={name}
        name={name}
        onChange={onChange}
        accept="application/pdf"
        className={`${styles.input} ${styles.fileInput} ${error ? styles.error : ''}`}
      />
      {currentFileName && (
        <span className={styles.fileName}>
          {hasExistingFile ? (
            <a href={currentFileName} target="_blank" rel="noopener noreferrer">
              {currentFileName}
            </a>
          ) : (
            currentFileName
          )}
        </span>
      )}
    </div>
    {error && <span className={styles.errorMessage}>{error}</span>}
  </div>
);