import React from 'react';
import { InputField, SelectField } from '../components/UserFormComponents';
import * as Icons from '../components/Icons';
import styles from '../styles/UserForm.module.css';
import { PlanDurationOptions } from './FormConstants';

interface BasicInfoProps {
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  generateRandomPassword: () => void;
}

const BasicInfoForm: React.FC<BasicInfoProps> = ({
  formData,
  handleInputChange,
  showPassword,
  togglePasswordVisibility,
  generateRandomPassword,
}) => {
  return (
    <div className={styles.section}>
      <h3>Informações Básicas</h3>
      <div className={styles.basicInfo}>
        <InputField
          label="Nome do aluno"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Nome completo"
          required
          icon={<Icons.User />}
        />
        <InputField
          label="Email do aluno"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="email@exemplo.com"
          required
          icon={<Icons.Email />}
        />
        <InputField
          label="Número de Telefone"
          type="tel"
          name="phone_number"
          value={formData.phone_number || ''}
          onChange={handleInputChange}
          placeholder="+5511999999999"
          required
          icon={<Icons.Phone />}
        />
        <div className={`${styles.inputGroup} ${styles.passwordWrapper} ${formData.password ? styles.filled : ''}`}>
          <label>
            <span className={styles.inputIcon}><Icons.Password /></span>
            Senha do aluno
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password || ''}
            onChange={handleInputChange}
            placeholder="Senha"
            aria-label="Senha do aluno"
          />
          <button
            type="button"
            className={styles.passwordToggleIcon}
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <Icons.EyeClose /> : <Icons.EyeOpen />}
          </button>
          <button
            type="button"
            className={styles.generatePasswordButton}
            onClick={generateRandomPassword}
            aria-label="Gerar senha aleatória"
          >
            <Icons.Refresh /> Gerar Senha Aleatória
          </button>
        </div>
        <SelectField
          label="Duração do Plano"
          value={formData.plan_duration}
          onChange={handleInputChange}
          name="plan_duration"
          options={PlanDurationOptions}
          icon={<Icons.Calendar />}
          required
        />
      </div>
    </div>
  );
};

export default BasicInfoForm;