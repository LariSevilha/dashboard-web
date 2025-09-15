import React from 'react';
import trainingStyles from '../styles/trainingForm.module.css';

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  name: string;
  icon?: React.ReactNode;
  error?: string; 

}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  name,
  icon,
  error,
}) => (
  <div className={trainingStyles.sectionGroup}>
    <label htmlFor={name}>
      {icon} {label}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      aria-invalid={!!error}
      aria-describedby={error ? `${name}-error` : undefined}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <span id={`${name}-error`} className={trainingStyles.errorMessage}>
        {error}
      </span>
    )}
  </div>
);

export default SelectField;