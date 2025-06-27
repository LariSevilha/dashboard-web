import React from 'react';
import styles from '../styles/UserForm.module.css'; // Adjust path as needed

interface SelectFieldOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectFieldOption[];
  icon?: React.ReactNode;
  required?: boolean;
  className?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  icon,
  required = false,
  className = '',
}) => {
  return (
    <div className={`${styles.inputGroup} ${className}`}>
      <label htmlFor={name} className={styles.label}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={styles.select}
      >
        <option value="">Selecione uma opção</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;