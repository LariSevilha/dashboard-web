import React from 'react';
import { PlanDurationOptions } from './FormConstants';
import styles from '../styles/UserForm.module.css';
import * as Icons from '../components/Icons';

interface FormDataInterface {
  id: number | null;
  name: string;
  email: string;
  password: string;
  phone_number: string;
  photo: File | null;
  photo_url?: string;
  trainings_attributes: any[];
  meals_attributes: any[];
  weekly_pdfs_attributes: any[];
  plan_type: string;
  plan_duration: string;
}

interface BasicInfoFormProps {
  formData: FormDataInterface;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handlePhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  togglePasswordVisibility: () => void;
  generateRandomPassword: () => void;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  formData,
  handleInputChange,
  handlePhotoChange,
  showPassword,
  togglePasswordVisibility,
  generateRandomPassword,
}) => {
  return (
    <div className={styles.section}>
      <h3>Informações Pessoais</h3>
      <div className={styles.inputGroup}>
        <label className={styles.label}>
          <span className={styles.icon}>
            <Icons.User />
          </span>
          Nome
          <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className={styles.input}
          placeholder="Digite o nome"
        />
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.label}>
          <span className={styles.icon}>
            <Icons.Email />
          </span>
          Email
          <span className={styles.required}>*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className={styles.input}
          placeholder="Digite o email"
        />
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.label}>
          <span className={styles.icon}>
            <Icons.Phone />
          </span>
          Telefone
        </label>
        <input
          type="tel"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleInputChange}
          className={styles.input}
          placeholder="+5511999999999"
        />
      </div>
      <div className={styles.inputGroup}>
        <label className={styles.label}>
          <span className={styles.icon}>
            <Icons.Image />
          </span>
          Foto
        </label>
        <div className={styles.photoWrapper}>
          {formData.photo ? (
            <img src={URL.createObjectURL(formData.photo)} alt="Prévia da foto" className={styles.photoPreview} />
          ) : formData.photo_url ? (
            <img src={formData.photo_url} alt="Foto do usuário" className={styles.photoPreview} />
          ) : (
            <div className={styles.defaultAvatar}>
              <Icons.User />
            </div>
          )}
          <input
            type="file"
            name="photo"
            accept="image/png,image/jpeg"
            onChange={handlePhotoChange}
            className={styles.fileInput}
          />
        </div>
      </div>
      {!formData.id && (
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            <span className={styles.icon}>
              <Icons.Password />
            </span>
            Senha
            <span className={styles.required}>*</span>
          </label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required={!formData.id}
              className={styles.input}
              placeholder="Digite a senha"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={styles.togglePassword}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <Icons.EyeOpen /> : <Icons.EyeClose />}
            </button>
            <button
              type="button"
              onClick={generateRandomPassword}
              className={styles.generatePassword}
              aria-label="Gerar senha aleatória"
            >
              <Icons.Refresh />
            </button>
          </div>
        </div>
      )}
      <div className={styles.inputGroup}>
        <label className={styles.label}>
          <span className={styles.icon}>
            <Icons.Calendar />
          </span>
          Duração do Plano
          <span className={styles.required}>*</span>
        </label>
        <select
          name="plan_duration"
          value={formData.plan_duration}
          onChange={handleInputChange}
          required
          className={styles.input}
        >
          <option value="">Selecione</option>
          {PlanDurationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default BasicInfoForm;