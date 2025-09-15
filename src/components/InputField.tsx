import React from 'react'; 

interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  optional?: boolean;
  error?: string; // Add this prop
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  icon,
  optional,
  error,
  className = '',
}) => {
  return (
    <div className={`input-field ${className} ${error ? 'has-error' : ''}`}>
      <label htmlFor={name} className="input-label">
        {icon && <span className="input-icon">{icon}</span>}
        {label}
        {optional && <span className="optional-text"> (opcional)</span>}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input-control ${error ? 'error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <div id={`${name}-error`} className="error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
export default InputField;