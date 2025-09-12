import React from 'react';
import { PlanDurationOptions } from './FormConstants';
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
  styles: any; // Styles from UserForm.module.css
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  formData,
  handleInputChange,
  handlePhotoChange,
  showPassword,
  togglePasswordVisibility,
  generateRandomPassword,
  styles,
}) => {
  return (
    <div className={styles.formSection}>
      <h2 className={styles.sectionTitle}>
        <Icons.User /> Informações Pessoais
      </h2>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Foto
            <span className={styles.optional}> (opcional)</span>
          </label>
          <div className={styles.fileUpload}>
            {formData.photo ? (
              <img
                src={URL.createObjectURL(formData.photo)}
                alt="Prévia da foto"
                className={styles.userPhoto}
              />
            ) : formData.photo_url ? (
              <img
                src={formData.photo_url}
                alt="Foto do usuário"
                className={styles.userPhoto}
                onError={(e) => {
                  e.currentTarget.src = ''; // Fallback to empty on error
                  e.currentTarget.style.display = 'none'; // Hide broken image
                  if (e.currentTarget.nextElementSibling) {
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; // Show default avatar
                  }
                }}
              />
            ) : null}
            <div
              className={styles.defaultAvatar}
              style={{ display: formData.photo || formData.photo_url ? 'none' : 'flex' }}
            >
              <Icons.User />
            </div>
            <input
              type="file"
              name="photo"
              accept="image/png,image/jpeg"
              onChange={handlePhotoChange}
              className={styles.fileInput}
            />
            <label className={styles.fileLabel}>
              <Icons.Image /> Escolher Foto
            </label>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Nome
            <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className={styles.formInput}
            placeholder="Digite o nome"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Email
            <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={styles.formInput}
            placeholder="Digite o email"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Telefone
            <span className={styles.optional}> (opcional)</span>
          </label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="+5511999999999"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Senha
            <span className={styles.required}>*</span>
          </label>
          <div className={styles.passwordContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className={styles.formInput}
              placeholder="Digite a senha"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={styles.passwordToggle}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <Icons.EyeOpen /> : <Icons.EyeClose />}
            </button>
            <button
              type="button"
              onClick={generateRandomPassword}
              className={styles.generateButton}
              aria-label="Gerar senha aleatória"
            >
              <Icons.Refresh /> Gerar Senha
            </button>
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            Duração do Plano
            <span className={styles.required}>*</span>
          </label>
          <select
            name="plan_duration"
            value={formData.plan_duration}
            onChange={handleInputChange}
            required
            className={styles.formSelect}
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
    </div>
  );
};

export default BasicInfoForm;