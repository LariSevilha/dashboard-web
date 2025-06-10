import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import * as Icons from '../components/Icons';
import styles from '../styles/UserForm.module.css';
import '../index.css';

interface Training {
  id: number | null;
  serie_amount: string;
  repeat_amount: string;
  exercise_name: string;
  video: string;
  weekday: string;
  _destroy: boolean;
}

interface Comida {
  id: number | null;
  name: string;
  amount: string;
  _destroy: boolean;
}

interface Meal {
  id: number | null;
  meal_type: string;
  weekday: string;
  _destroy: boolean;
  comidas_attributes: Comida[];
}

interface WeeklyPdf {
  id: number | null;
  weekday: string;
  pdf_file: File | null;
  pdf_url?: string;
  pdf_filename?: string;
  notes?: string;
  _destroy: boolean;
}

interface FormDataInterface {
  id: number | null;
  name: string;
  email: string;
  password: string;
  phone_number: string;
  trainings_attributes: Training[];
  meals_attributes: Meal[];
  weekly_pdfs_attributes: WeeklyPdf[];
  plan_type: string;
  plan_duration: string;
}

const PlanDurationOptions = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'semi_annual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
];

const WeekdayOptions = [
  { value: 'sunday', label: 'Domingo' },
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
];

const InputField: React.FC<{
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

const SelectField: React.FC<{
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

const FileInputField: React.FC<{
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

const UserForm: React.FC = () => {
  const initialFormState: FormDataInterface = {
    id: null,
    name: '',
    email: '',
    password: '',
    phone_number: '',
    trainings_attributes: [
      {
        id: null,
        serie_amount: '',
        repeat_amount: '',
        exercise_name: '',
        video: '',
        weekday: '',
        _destroy: false,
      },
    ],
    meals_attributes: [
      {
        id: null,
        meal_type: '',
        weekday: '',
        _destroy: false,
        comidas_attributes: [
          {
            id: null,
            name: '',
            amount: '',
            _destroy: false,
          },
        ],
      },
    ],
    weekly_pdfs_attributes: [
      {
        id: null,
        weekday: '',
        pdf_file: null,
        pdf_url: undefined,
        pdf_filename: undefined,
        notes: '',
        _destroy: false,
      },
    ],
    plan_type: '',
    plan_duration: '',
  };

  const [formData, setFormData] = useState<FormDataInterface>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'trainings' | 'meals' | 'pdfs'>('basic');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const extractFilenameFromUrl = (url: string): string | undefined => {
    if (!url) return undefined;
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  useEffect(() => {
    console.log('UserForm useEffect running', { id, location: location.search });
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
      console.log('No API key found, redirecting to login');
      navigate('/login');
      return;
    }

    const queryParams = new URLSearchParams(location.search);
    const planTypeFromUrl = queryParams.get('type') as 'manual' | 'pdf' | null;
    console.log('Plan type from URL:', planTypeFromUrl);

    if (id) {
      console.log('Fetching user data for ID:', id);
      setLoading(true);
      axios
        .get(`http://localhost:3000/api/v1/users/${id}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        .then((response) => {
          console.log('User data fetched:', response.data);
          const user = response.data;

          const loadedPdfs =
            user.weekly_pdfs && user.weekly_pdfs.length > 0
              ? user.weekly_pdfs.map((p: any) => ({
                  id: p.id,
                  weekday: p.weekday || '',
                  pdf_file: null,
                  pdf_url: p.pdf_url,
                  pdf_filename: p.pdf_filename || (p.pdf_url ? extractFilenameFromUrl(p.pdf_url) : undefined),
                  notes: p.notes || '',
                  _destroy: false,
                }))
              : [
                  {
                    id: null,
                    weekday: '',
                    pdf_file: null,
                    pdf_url: undefined,
                    pdf_filename: undefined,
                    notes: '',
                    _destroy: false,
                  },
                ];

          const hasActivePdfs = loadedPdfs.some(
            (p: WeeklyPdf) => !p._destroy && (p.pdf_url || p.pdf_file)
          );
          const inferredPlanType = hasActivePdfs ? 'pdf' : user.plan_type || 'manual';
          console.log('Inferred plan type:', inferredPlanType, 'Has active PDFs:', hasActivePdfs);

          setFormData({
            id: user.id || null,
            name: user.name || '',
            email: user.email || '',
            password: '',
            phone_number: user.phone_number || '',
            trainings_attributes:
              inferredPlanType === 'manual' && user.trainings?.length > 0
                ? user.trainings.map((t: any) => ({
                    id: t.id || null,
                    serie_amount: t.serie_amount || '',
                    repeat_amount: t.repeat_amount || '',
                    exercise_name: t.exercise_name || '',
                    video: t.video || '',
                    weekday: t.weekday || '',
                    _destroy: false,
                  }))
                : [
                    {
                      id: null,
                      serie_amount: '',
                      repeat_amount: '',
                      exercise_name: '',
                      video: '',
                      weekday: '',
                      _destroy: false,
                    },
                  ],
            meals_attributes:
              inferredPlanType === 'manual' && user.meals?.length > 0
                ? user.meals.map((m: any) => ({
                    id: m.id || null,
                    meal_type: m.meal_type || '',
                    weekday: m.weekday || '',
                    _destroy: false,
                    comidas_attributes:
                      m.comidas && m.comidas.length > 0
                        ? m.comidas.map((c: any) => ({
                            id: c.id || null,
                            name: c.name || '',
                            amount: c.amount || '',
                            _destroy: false,
                          }))
                        : [
                            {
                              id: null,
                              name: '',
                              amount: '',
                              _destroy: false,
                            },
                          ],
                  }))
                : [
                    {
                      id: null,
                      meal_type: '',
                      weekday: '',
                      _destroy: false,
                      comidas_attributes: [
                        {
                          id: null,
                          name: '',
                          amount: '',
                          _destroy: false,
                        },
                      ],
                    },
                  ],
            weekly_pdfs_attributes: loadedPdfs,
            plan_type: inferredPlanType,
            plan_duration: user.plan_duration || '',
          });

          setActiveTab(inferredPlanType === 'pdf' ? 'pdfs' : 'basic');
          console.log('Form data set:', formData);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching user:', err.response?.data || err.message);
          setError('Erro ao carregar dados do usuário');
          setLoading(false);
        });
    } else {
      console.log('Initializing form for new user');
      setFormData({
        ...initialFormState,
        plan_type: planTypeFromUrl || 'manual', // Default to 'manual' if no type
      });
      setActiveTab(planTypeFromUrl === 'pdf' ? 'pdfs' : 'basic');
      setLoading(false);
      console.log('Initial form data:', formData);
    }
  }, [id, navigate, location.search]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('Input changed:', { name, value });
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const addTraining = () => {
    setFormData({
      ...formData,
      trainings_attributes: [
        ...formData.trainings_attributes,
        {
          id: null,
          serie_amount: '',
          repeat_amount: '',
          exercise_name: '',
          video: '',
          weekday: '',
          _destroy: false,
        },
      ],
    });
  };

  const handleTrainingChange = (index: number, field: string, value: string) => {
    const updatedTrainings = [...formData.trainings_attributes];
    updatedTrainings[index] = { ...updatedTrainings[index], [field]: value };
    setFormData({ ...formData, trainings_attributes: updatedTrainings });
  };

  const removeTraining = (index: number) => {
    const updatedTrainings = [...formData.trainings_attributes];
    if (updatedTrainings[index].id) {
      updatedTrainings[index]._destroy = true;
    } else {
      updatedTrainings.splice(index, 1);
    }
    setFormData({ ...formData, trainings_attributes: updatedTrainings });
  };

  const addMeal = () => {
    setFormData({
      ...formData,
      meals_attributes: [
        ...formData.meals_attributes,
        {
          id: null,
          meal_type: '',
          weekday: '',
          _destroy: false,
          comidas_attributes: [
            {
              id: null,
              name: '',
              amount: '',
              _destroy: false,
            },
          ],
        },
      ],
    });
  };

  const handleMealChange = (mealIndex: number, field: string, value: string) => {
    const updatedMeals = [...formData.meals_attributes];
    updatedMeals[mealIndex] = { ...updatedMeals[mealIndex], [field]: value };
    setFormData({ ...formData, meals_attributes: updatedMeals });
  };

  const removeMeal = (mealIndex: number) => {
    const updatedMeals = [...formData.meals_attributes];
    if (updatedMeals[mealIndex].id) {
      updatedMeals[mealIndex]._destroy = true;
    } else {
      updatedMeals.splice(mealIndex, 1);
    }
    setFormData({ ...formData, meals_attributes: updatedMeals });
  };

  const addComida = (mealIndex: number) => {
    const updatedMeals = [...formData.meals_attributes];
    updatedMeals[mealIndex].comidas_attributes.push({
      id: null,
      name: '',
      amount: '',
      _destroy: false,
    });
    setFormData({ ...formData, meals_attributes: updatedMeals });
  };

  const handleComidaChange = (mealIndex: number, comidaIndex: number, field: string, value: string) => {
    const updatedMeals = [...formData.meals_attributes];
    const updatedComidas = [...updatedMeals[mealIndex].comidas_attributes];
    updatedComidas[comidaIndex] = { ...updatedComidas[comidaIndex], [field]: value };
    updatedMeals[mealIndex].comidas_attributes = updatedComidas;
    setFormData({ ...formData, meals_attributes: updatedMeals });
  };

  const removeComida = (mealIndex: number, comidaIndex: number) => {
    const updatedMeals = [...formData.meals_attributes];
    const updatedComidas = [...updatedMeals[mealIndex].comidas_attributes];
    if (updatedComidas[comidaIndex].id) {
      updatedComidas[comidaIndex]._destroy = true;
    } else {
      updatedComidas.splice(comidaIndex, 1);
    }
    updatedMeals[mealIndex].comidas_attributes = updatedComidas;
    setFormData({ ...formData, meals_attributes: updatedMeals });
  };

  const addPdf = () => {
    setFormData({
      ...formData,
      weekly_pdfs_attributes: [
        ...formData.weekly_pdfs_attributes,
        {
          id: null,
          weekday: '',
          pdf_file: null,
          pdf_url: undefined,
          pdf_filename: undefined,
          notes: '',
          _destroy: false,
        },
      ],
    });
  };

  const handlePdfChange = (index: number, field: string, value: any) => {
    const updatedPdfs = [...formData.weekly_pdfs_attributes];
    updatedPdfs[index] = { ...updatedPdfs[index], [field]: value };
    setFormData({ ...formData, weekly_pdfs_attributes: updatedPdfs });
  };

  const removePdf = (index: number) => {
    const updatedPdfs = [...formData.weekly_pdfs_attributes];
    if (updatedPdfs[index].id) {
      updatedPdfs[index]._destroy = true;
    } else {
      updatedPdfs.splice(index, 1);
    }
    setFormData({ ...formData, weekly_pdfs_attributes: updatedPdfs });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
      setError('Chave API não encontrada. Faça login novamente.');
      setFormSubmitting(false);
      return;
    }

    const data = new FormData();
    if (formData.name) data.append('user[name]', formData.name);
    if (formData.email) data.append('user[email]', formData.email);
    if (formData.password) data.append('user[password]', formData.password);
    if (formData.plan_type) data.append('user[plan_type]', formData.plan_type);
    if (formData.plan_duration) data.append('user[plan_duration]', formData.plan_duration);
    if (formData.phone_number) data.append('user[phone_number]', formData.phone_number);

    if (formData.plan_type === 'manual') {
      formData.trainings_attributes.forEach((training, index) => {
        if (training._destroy) {
          if (training.id) {
            data.append(`user[trainings_attributes][${index}][id]`, training.id.toString());
            data.append(`user[trainings_attributes][${index}][_destroy]`, 'true');
          }
        } else {
          if (training.id) data.append(`user[trainings_attributes][${index}][id]`, training.id.toString());
          data.append(`user[trainings_attributes][${index}][serie_amount]`, training.serie_amount);
          data.append(`user[trainings_attributes][${index}][repeat_amount]`, training.repeat_amount);
          data.append(`user[trainings_attributes][${index}][exercise_name]`, training.exercise_name);
          data.append(`user[trainings_attributes][${index}][video]`, training.video);
          data.append(`user[trainings_attributes][${index}][weekday]`, training.weekday);
        }
      });

      formData.meals_attributes.forEach((meal, mealIndex) => {
        if (meal._destroy) {
          if (meal.id) {
            data.append(`user[meals_attributes][${mealIndex}][id]`, meal.id.toString());
            data.append(`user[meals_attributes][${mealIndex}][_destroy]`, 'true');
          }
        } else {
          if (meal.id) data.append(`user[meals_attributes][${mealIndex}][id]`, meal.id.toString());
          data.append(`user[meals_attributes][${mealIndex}][meal_type]`, meal.meal_type);
          data.append(`user[meals_attributes][${mealIndex}][weekday]`, meal.weekday);

          meal.comidas_attributes.forEach((comida, comidaIndex) => {
            if (comida._destroy) {
              if (comida.id) {
                data.append(
                  `user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][id]`,
                  comida.id.toString()
                );
                data.append(
                  `user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][_destroy]`,
                  'true'
                );
              }
            } else {
              if (comida.id)
                data.append(
                  `user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][id]`,
                  comida.id.toString()
                );
              data.append(
                `user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][name]`,
                comida.name
              );
              data.append(
                `user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][amount]`,
                comida.amount
              );
            }
          });
        }
      });
    } else if (formData.plan_type === 'pdf') {
      formData.trainings_attributes.forEach((training, index) => {
        if (training.id && !training._destroy) {
          data.append(`user[trainings_attributes][${index}][id]`, training.id.toString());
          data.append(`user[trainings_attributes][${index}][_destroy]`, 'true');
        }
      });
      formData.meals_attributes.forEach((meal, mealIndex) => {
        if (meal.id && !meal._destroy) {
          data.append(`user[meals_attributes][${mealIndex}][id]`, meal.id.toString());
          data.append(`user[meals_attributes][${mealIndex}][_destroy]`, 'true');
          meal.comidas_attributes.forEach((comida, comidaIndex) => {
            if (comida.id && !comida._destroy) {
              data.append(
                `user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][id]`,
                comida.id.toString()
              );
              data.append(
                `user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][_destroy]`,
                'true'
              );
            }
          });
        }
      });

      formData.weekly_pdfs_attributes.forEach((pdfItem, index) => {
        if (pdfItem.id) data.append(`user[weekly_pdfs_attributes][${index}][id]`, pdfItem.id.toString());
        if (pdfItem.weekday) data.append(`user[weekly_pdfs_attributes][${index}][weekday]`, pdfItem.weekday);
        if (pdfItem.pdf_file) {
          data.append(`user[weekly_pdfs_attributes][${index}][pdf]`, pdfItem.pdf_file);
        }
        if (pdfItem.notes) data.append(`user[weekly_pdfs_attributes][${index}][notes]`, pdfItem.notes);
        data.append(`user[weekly_pdfs_attributes][${index}][_destroy]`, pdfItem._destroy.toString());
      });
    }

    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };

    try {
      setError(null);
      if (formData.id) {
        await axios.put(`http://localhost:3000/api/v1/users/${formData.id}`, data, { headers });
      } else {
        await axios.post('http://localhost:3000/api/v1/users', data, { headers });
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.errors
        ? err.response.data.errors.join(', ')
        : err.response?.data?.error || err.message;
      setError(`Erro ao salvar usuário: ${errorMessage}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

  return (
    <div className={styles.formContainer}>
    
      <div className={styles.layout}>
        <div className={styles.sidebar}>
          <button
            type="button"
            className={`${styles.sidebarButton} ${activeTab === 'basic' ? styles.active : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Informações Básicas
          </button>
          {formData.plan_type === 'manual' && (
            <>
              <button
                type="button"
                className={`${styles.sidebarButton} ${activeTab === 'trainings' ? styles.active : ''}`}
                onClick={() => setActiveTab('trainings')}
              >
                Treinos
              </button>
              <button
                type="button"
                className={`${styles.sidebarButton} ${activeTab === 'meals' ? styles.active : ''}`}
                onClick={() => setActiveTab('meals')}
              >
                Dietas
              </button>
            </>
          )}
          {formData.plan_type === 'pdf' && (
            <button
              type="button"
              className={`${styles.sidebarButton} ${activeTab === 'pdfs' ? styles.active : ''}`}
              onClick={() => setActiveTab('pdfs')}
            >
              PDFs Semanais
            </button>
          )}
        </div>

        <div className={styles.content}>
          <form onSubmit={handleSubmit}>
            {activeTab === 'basic' && (
              <div className={styles.section}>
                <h3>Informações Básicas</h3>
                <div className={styles.basicInfo}>
                  <InputField
                    label="Nome do aluno"
                    type="text"
                    name="name" // Corrigido de "Nome completo"
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
                    icon={<Icons.User />}
                  />
                  <div
                    className={`${styles.inputGroup} ${styles.passwordWrapper} ${
                      formData.password ? styles.filled : ''
                    }`}
                  >
                    <label>
                      <span className={styles.inputIcon}>
                        <Icons.Password />
                      </span>
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
            )}

            {activeTab === 'trainings' && formData.plan_type === 'manual' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>Treinos</h3>
                  <button type="button" className={styles.addButton} onClick={addTraining} aria-label="Adicionar novo treino">
                    <Icons.Plus /> Adicionar Treino
                  </button>
                </div>
                <small className={styles.fileHint}>
                  Nota: O cadastro de treinos é opcional. Você pode adicionar apenas dietas, se preferir.
                </small>
                {formData.trainings_attributes.map((training, index) =>
                  !training._destroy ? (
                    <div className={styles.groupCard} key={training.id || `training-${index}`}>
                      <div className={styles.sectionGroup}>
                        <SelectField
                          label="Dia da Semana"
                          value={training.weekday}
                          onChange={(e) => handleTrainingChange(index, 'weekday', e.target.value)}
                          options={WeekdayOptions}
                          icon={<Icons.Calendar />}
                          name={`training-${index}-weekday`}
                        />
                        <InputField
                          label="Exercício"
                          type="text"
                          name={`training-${index}-exercise_name`}
                          value={training.exercise_name}
                          onChange={(e) => handleTrainingChange(index, 'exercise_name', e.target.value)}
                          placeholder="Nome do exercício"
                          icon={<Icons.Food />}
                        />
                        <InputField
                          label="Séries"
                          type="number"
                          name={`training-${index}-serie_amount`}
                          value={training.serie_amount}
                          onChange={(e) => handleTrainingChange(index, 'serie_amount', e.target.value)}
                          placeholder="3"
                        />
                        <InputField
                          label="Repetições"
                          type="number"
                          name={`training-${index}-repeat_amount`}
                          value={training.repeat_amount}
                          onChange={(e) => handleTrainingChange(index, 'repeat_amount', e.target.value)}
                          placeholder="12"
                        />
                        <InputField
                          label="Vídeo (opcional)"
                          type="text"
                          name={`training-${index}-video`}
                          value={training.video}
                          onChange={(e) => handleTrainingChange(index, 'video', e.target.value)}
                          placeholder="URL do vídeo"
                          optional
                        />
                      </div>
                      <div className={styles.buttonRow}>
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => removeTraining(index)}
                          aria-label="Remover treino"
                        >
                          <Icons.Minus /> Remover Treino
                        </button>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}

            {activeTab === 'meals' && formData.plan_type === 'manual' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>Dietas</h3>
                  <button type="button" className={styles.addButton} onClick={addMeal} aria-label="Adicionar nova refeição">
                    <Icons.Plus /> Adicionar Refeição
                  </button>
                </div>
                <small className={styles.fileHint}>
                  Nota: O cadastro de dietas é opcional. Você pode adicionar apenas treinos, se preferir.
                </small>
                {formData.meals_attributes.map((meal, mealIndex) =>
                  !meal._destroy ? (
                    <div className={styles.groupCard} key={meal.id || `meal-${mealIndex}`}>
                      <div className={styles.sectionGroup}>
                        <SelectField
                          label="Dia da Semana"
                          value={meal.weekday}
                          onChange={(e) => handleMealChange(mealIndex, 'weekday', e.target.value)}
                          options={WeekdayOptions}
                          icon={<Icons.Calendar />}
                          name={`meal-${mealIndex}-weekday`}
                        />
                        <InputField
                          label="Tipo da Refeição"
                          type="text"
                          name={`meal-${mealIndex}-meal_type`}
                          value={meal.meal_type}
                          onChange={(e) => handleMealChange(mealIndex, 'meal_type', e.target.value)}
                          placeholder="Café da manhã"
                          icon={<Icons.Food />}
                        />
                      </div>

                      <div className={styles.foodSection}>
                        <div className={styles.sectionSubheader}>
                          <h4>Comidas</h4>
                          <button
                            type="button"
                            className={styles.addFoodButton}
                            onClick={() => addComida(mealIndex)}
                            aria-label="Adicionar nova comida"
                          >
                            <Icons.Plus /> Adicionar Comida
                          </button>
                        </div>
                        {meal.comidas_attributes.map((comida, comidaIndex) =>
                          !comida._destroy ? (
                            <div className={styles.foodItem} key={comida.id || `comida-${comidaIndex}`}>
                              <InputField
                                label="Nome"
                                type="text"
                                name={`comida-${mealIndex}-${comidaIndex}-name`}
                                value={comida.name}
                                onChange={(e) => handleComidaChange(mealIndex, comidaIndex, 'name', e.target.value)}
                                placeholder="Alimento"
                                icon={<Icons.Food />}
                              />
                              <InputField
                                label="Quantidade"
                                type="text"
                                name={`comida-${mealIndex}-${comidaIndex}-amount`}
                                value={comida.amount}
                                onChange={(e) => handleComidaChange(mealIndex, comidaIndex, 'amount', e.target.value)}
                                placeholder="100g"
                              />
                              <button
                                type="button"
                                className={styles.removeButton}
                                onClick={() => removeComida(mealIndex, comidaIndex)}
                                aria-label="Remover comida"
                              >
                                ✕
                              </button>
                            </div>
                          ) : null
                        )}
                      </div>
                      <div className={styles.buttonRow}>
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => removeMeal(mealIndex)}
                          aria-label="Remover refeição"
                        >
                          <Icons.Minus /> Remover Refeição
                        </button>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}

            {activeTab === 'pdfs' && formData.plan_type === 'pdf' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h3>PDFs Semanais</h3>
                  <button type="button" className={styles.addButton} onClick={addPdf} aria-label="Adicionar novo PDF">
                    <Icons.Plus /> Adicionar PDF
                  </button>
                </div>
                {formData.weekly_pdfs_attributes.map((pdfItem, index) =>
                  !pdfItem._destroy ? (
                    <div className={styles.groupCard} key={pdfItem.id || `pdf-${index}`}>
                      <div className={styles.sectionGroup}>
                        <FileInputField
                          label="Upload PDF"
                          name={`pdf-${index}-file`}
                          onChange={(e) => handlePdfChange(index, 'pdf_file', e.target.files ? e.target.files[0] : null)}
                          icon={<Icons.File />}
                          required={!pdfItem.id && !pdfItem.pdf_url && !pdfItem.pdf_file}
                          currentFileName={
                            pdfItem.pdf_filename ||
                            (pdfItem.pdf_file ? pdfItem.pdf_file.name : undefined)
                          }
                          hasExistingFile={!!pdfItem.pdf_url}
                        />
                        <InputField
                          label="Notas (opcional)"
                          type="text"
                          name={`pdf-${index}-notes`}
                          value={pdfItem.notes || ''}
                          onChange={(e) => handlePdfChange(index, 'notes', e.target.value)}
                          placeholder="Adicione notas aqui"
                          optional
                          icon={<Icons.File />}
                        />
                      </div>
                      <div className={styles.buttonRow}>
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => removePdf(index)}
                          aria-label="Remover PDF"
                        >
                          <Icons.Minus /> Remover PDF
                        </button>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => navigate('/dashboard')}
                aria-label="Cancelar"
              >
                <Icons.Cancel /> Cancelar
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={formSubmitting}
                aria-label="Salvar usuário"
              >
                {formSubmitting ? (
                  <Icons.Loading />
                ) : (
                  <>
                    <Icons.Save /> {formData.id ? 'Atualizar Usuário' : 'Cadastrar Usuário'}
                  </>
                )}
              </button>
            </div>
          </form>
          {error && (
            <div className={styles.errorMessage} role="alert">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserForm; 