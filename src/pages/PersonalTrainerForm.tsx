import React, { useState } from 'react';
import axios from 'axios';
import styles from '../styles/dashboard.module.css';

interface PersonalTrainerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface PersonalTrainerData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  cpf: string;
  cref: string;
  phone_number: string;
}

const PersonalTrainerForm: React.FC<PersonalTrainerFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<PersonalTrainerData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    cpf: '',
    cref: '',
    phone_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiKey = localStorage.getItem('apiKey');
  const deviceId = localStorage.getItem('deviceId');

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(numbers.charAt(i)) * (10 - i);
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.charAt(9))) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(numbers.charAt(i)) * (11 - i);
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(numbers.charAt(10))) return false;
    return true;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCREF = (cref: string) => {
    const crefRegex = /^\d{6}-G\/[A-Z]{2}$/;
    return crefRegex.test(cref.toUpperCase());
  };

  const handleInputChange = (field: keyof PersonalTrainerData, value: string) => {
    let formattedValue = value;
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'phone_number') {
      formattedValue = formatPhone(value);
    } else if (field === 'cref') {
      formattedValue = value.toUpperCase();
    }
    setFormData((prev) => ({
      ...prev,
      [field]: formattedValue,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!validateEmail(formData.email)) {
      setError('Email inválido');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.password_confirmation) {
      setError('Senhas não coincidem');
      return false;
    }
    if (!validateCPF(formData.cpf)) {
      setError('CPF inválido');
      return false;
    }
    if (!validateCREF(formData.cref)) {
      setError('CREF inválido. Formato esperado: 123456-G/SP');
      return false;
    }
    const phoneNumbers = formData.phone_number.replace(/\D/g, '');
    if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
      setError('Telefone inválido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    if (!apiKey || !deviceId) {
      setError('Credenciais de autenticação ausentes');
      return;
    }

    setLoading(true);

    try {
      const cleanData = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''),
        phone_number: formData.phone_number.replace(/\D/g, ''),
      };

      await axios.post(
        'http://localhost:3000/api/v1/master_users',
        { master_user: cleanData },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Device-ID': deviceId,
            'Content-Type': 'application/json',
          },
        }
      );

      onSuccess();
    } catch (err: any) {
      console.error('Error creating personal trainer:', err);
      if (err.response?.data?.errors) {
        setError(
          Array.isArray(err.response.data.errors)
            ? err.response.data.errors.join(', ')
            : err.response.data.errors
        );
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erro ao cadastrar personal trainer');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.configContainer}>
      <div className={styles.formHeader}>
        <h2 className={styles.title}>Cadastrar Personal Trainer</h2>
        <button
          type="button"
          onClick={onCancel}
          className={styles.closeButton}
          aria-label="Fechar formulário"
        >
          <i className="fas fa-times" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nome Completo *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={styles.input}
              placeholder="Digite o nome completo"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={styles.input}
              placeholder="exemplo@email.com"
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="cpf">CPF *</label>
            <input
              id="cpf"
              type="text"
              value={formData.cpf}
              onChange={(e) => handleInputChange('cpf', e.target.value)}
              className={styles.input}
              placeholder="000.000.000-00"
              maxLength={14}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="cref">CREF *</label>
            <input
              id="cref"
              type="text"
              value={formData.cref}
              onChange={(e) => handleInputChange('cref', e.target.value)}
              className={styles.input}
              placeholder="123456-G/SP"
              maxLength={11}
              required
            />
            <small className={styles.helpText}>Formato: 123456-G/SP (6 dígitos + G + barra + estado)</small>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="phone">Telefone *</label>
            <input
              id="phone"
              type="text"
              value={formData.phone_number}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              className={styles.input}
              placeholder="(11) 99999-9999"
              maxLength={15}
              required
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="password">Senha *</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={styles.input}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password_confirmation">Confirmar Senha *</label>
            <input
              id="password_confirmation"
              type="password"
              value={formData.password_confirmation}
              onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
              className={styles.input}
              placeholder="Repita a senha"
              minLength={6}
              required
            />
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <i className="fas fa-exclamation-triangle" />
            {error}
          </div>
        )}

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin" />
                Cadastrando...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus" />
                Cadastrar Personal
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalTrainerForm;