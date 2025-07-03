import React from 'react';
import styles from '../styles/UserForm.module.css';

interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  optional?: boolean;
  readOnly?: boolean;  
  multiple?: boolean;  
  accept?: string; 

}
 

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required,
  icon,
  optional,
}) => (
  <div className={styles.inputGroup}>
    <label>
      {icon && <span className={styles.inputIcon}>{icon}</span>}
      {label}
      {optional && <span className={styles.optional}>(Opcional)</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
    />
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
  required?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  name,
  options,
  icon,
  required,
}) => (
  <div className={styles.inputGroup}>
    <label>
      {icon && <span className={styles.inputIcon}>{icon}</span>}
      {label}
    </label>
    <select name={name} value={value} onChange={onChange} required={required}>
      <option value="">Selecione</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

interface FileInputFieldProps {
  label: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  required?: boolean;
  currentFileName?: string;
  hasExistingFile?: boolean;
}

export const FileInputField: React.FC<FileInputFieldProps> = ({
  label,
  name,
  onChange,
  icon,
  required,
  currentFileName,
  hasExistingFile,
}) => (
  <div className={styles.inputGroup}>
    <label>
      {icon && <span className={styles.inputIcon}>{icon}</span>}
      {label}
    </label>
    <input type="file" name={name} onChange={onChange} accept=".pdf" required={required && !hasExistingFile} />
    {currentFileName && <span className={styles.fileName}>{currentFileName}</span>}
  </div>
);