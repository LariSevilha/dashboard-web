import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import BasicInfoForm from './BasicInfoForm';
import TrainingForm from './TrainingForm';
import MealForm from './MealForm';
import PdfForm from './PdfForm';
import { PlanDurationOptions, WeekdayOptions } from './FormConstants';
import styles from '../styles/UserForm.module.css';
import * as Icons from '../components/Icons'; 

// Interfaces
interface Training {
  id: number | null;
  serie_amount: string;
  repeat_amount: string;
  exercise_name: string;
  video: string;
  description: string;
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
  photo: File | null;
  photo_url?: string;
  trainings_attributes: Training[];
  meals_attributes: Meal[];
  weekly_pdfs_attributes: WeeklyPdf[];
  plan_type: string;
  plan_duration: string;
}

const UserForm: React.FC = () => {
  const initialFormState = useMemo<FormDataInterface>(
    () => ({
      id: null,
      name: '',
      email: '',
      password: '',
      phone_number: '',
      photo: null,
      photo_url: undefined,
      trainings_attributes: [
        {
          id: null,
          serie_amount: '',
          repeat_amount: '',
          exercise_name: '',
          video: '',
          description: '',
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
    }),
    []
  );

  const [formData, setFormData] = useState<FormDataInterface>(initialFormState);
  const [originalFormData, setOriginalFormData] = useState<FormDataInterface | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'trainings' | 'meals' | 'pdfs'>('basic');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const extractFilenameFromUrl = (url: string): string | undefined => (url ? url.split('/').pop() : undefined);

  const generateRandomPassword = (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
      navigate('/login');
      return;
    }

    const queryParams = new URLSearchParams(location.search);
    const planTypeFromUrl = queryParams.get('type') as 'manual' | 'pdf' | null;

    if (id) {
      setLoading(true);
      axios
        .get(`http://localhost:3000/api/v1/users/${id}`, { headers: { Authorization: `Bearer ${apiKey}` } })
        .then((response) => {
          const user = response.data;
          const loadedPdfs = user.weekly_pdfs?.length
            ? user.weekly_pdfs.map((p: any) => ({
                id: p.id,
                weekday: p.weekday || '',
                pdf_file: null,
                pdf_url: p.pdf_url,
                pdf_filename: p.pdf_filename || extractFilenameFromUrl(p.pdf_url),
                notes: '',
                _destroy: false,
              }))
            : [initialFormState.weekly_pdfs_attributes[0]];

          const hasActivePdfs = loadedPdfs.some((p: WeeklyPdf) => !p._destroy && (p.pdf_url || p.pdf_file));
          const inferredPlanType = hasActivePdfs ? 'pdf' : user.plan_type || 'manual';

          const userData = {
            id: user.id || null,
            name: user.name || '',
            email: user.email || '',
            password: '',
            phone_number: user.phone_number || '',
            photo: null,
            photo_url: user.photo_url,
            trainings_attributes: inferredPlanType === 'manual' && user.trainings?.length
              ? user.trainings.map((t: any) => ({
                  id: t.id || null,
                  serie_amount: t.serie_amount || '',
                  repeat_amount: t.repeat_amount || '',
                  exercise_name: t.exercise_name || '',
                  video: t.video || '',
                  description: t.description || '',
                  weekday: t.weekday || '',
                  _destroy: false,
                }))
              : [initialFormState.trainings_attributes[0]],
            meals_attributes: inferredPlanType === 'manual' && user.meals?.length
              ? user.meals.map((m: any) => ({
                  id: m.id || null,
                  meal_type: m.meal_type || '',
                  weekday: m.weekday || '',
                  _destroy: false,
                  comidas_attributes: m.comidas?.length
                    ? m.comidas.map((c: any) => ({
                        id: c.id || null,
                        name: c.name || '',
                        amount: c.amount || '',
                        _destroy: false,
                      }))
                    : [initialFormState.meals_attributes[0].comidas_attributes[0]],
                }))
              : [initialFormState.meals_attributes[0]],
            weekly_pdfs_attributes: loadedPdfs,
            plan_type: inferredPlanType,
            plan_duration: user.plan_duration || '',
          };

          setFormData(userData);
          setOriginalFormData(userData);
          setActiveTab('basic');
          setLoading(false);
        })
        .catch((err) => {
          setError('Erro ao carregar dados do usuário');
          setLoading(false);
        });
    } else {
      setFormData({ ...initialFormState, plan_type: planTypeFromUrl || 'manual' });
      setOriginalFormData(null);
      setActiveTab('basic');
      setLoading(false);
    }
  }, [id, navigate, location.search, initialFormState]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('A foto deve ter no máximo 5MB.');
        return;
      }
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        setError('Apenas arquivos PNG ou JPEG são permitidos.');
        return;
      }
    }
    setFormData({ ...formData, photo: file });
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const addTraining = () =>
    setFormData({
      ...formData,
      trainings_attributes: [...formData.trainings_attributes, { ...initialFormState.trainings_attributes[0] }],
    });

  const handleTrainingChange = (index: number, field: string, value: string) => {
    const updatedTrainings = [...formData.trainings_attributes];
    updatedTrainings[index] = { ...updatedTrainings[index], [field]: value };
    setFormData({ ...formData, trainings_attributes: updatedTrainings });
  };

  const removeTraining = (index: number) => {
    const updatedTrainings = [...formData.trainings_attributes];
    if (updatedTrainings[index].id) updatedTrainings[index]._destroy = true;
    else updatedTrainings.splice(index, 1);
    setFormData({ ...formData, trainings_attributes: updatedTrainings });
  };

  const addMeal = () =>
    setFormData({
      ...formData,
      meals_attributes: [...formData.meals_attributes, { ...initialFormState.meals_attributes[0] }],
    });

  const handleMealChange = (mealIndex: number, field: string, value: string) => {
    const updatedMeals = [...formData.meals_attributes];
    updatedMeals[mealIndex] = { ...updatedMeals[mealIndex], [field]: value };
    setFormData({ ...formData, meals_attributes: updatedMeals });
  };

  const removeMeal = (mealIndex: number) => {
    const updatedMeals = [...formData.meals_attributes];
    if (updatedMeals[mealIndex].id) updatedMeals[mealIndex]._destroy = true;
    else updatedMeals.splice(mealIndex, 1);
    setFormData({ ...formData, meals_attributes: updatedMeals });
  };

  const addComida = (mealIndex: number) => {
    const updatedMeals = [...formData.meals_attributes];
    updatedMeals[mealIndex].comidas_attributes.push({ ...initialFormState.meals_attributes[0].comidas_attributes[0] });
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
    if (updatedComidas[comidaIndex].id) updatedComidas[comidaIndex]._destroy = true;
    else updatedComidas.splice(comidaIndex, 1);
    updatedMeals[mealIndex].comidas_attributes = updatedComidas;
    setFormData({ ...formData, meals_attributes: updatedMeals });
  };

  const addPdf = () =>
    setFormData({
      ...formData,
      weekly_pdfs_attributes: [...formData.weekly_pdfs_attributes, { ...initialFormState.weekly_pdfs_attributes[0] }],
    });

  const handlePdfChange = (index: number, field: string, value: any) => {
    const updatedPdfs = [...formData.weekly_pdfs_attributes];
    updatedPdfs[index] = { ...updatedPdfs[index], [field]: value };
    setFormData({ ...formData, weekly_pdfs_attributes: updatedPdfs });
  };

  const removePdf = (index: number) => {
    const updatedPdfs = [...formData.weekly_pdfs_attributes];
    if (updatedPdfs[index].id) updatedPdfs[index]._destroy = true;
    else updatedPdfs.splice(index, 1);
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

    if (formData.id && originalFormData) {
      // Only send changed fields for updates
      if (formData.name !== originalFormData.name && formData.name) data.append('user[name]', formData.name);
      if (formData.email !== originalFormData.email && formData.email) data.append('user[email]', formData.email);
      if (formData.password && formData.password !== originalFormData.password) data.append('user[password]', formData.password);
      if (formData.phone_number !== originalFormData.phone_number && formData.phone_number) data.append('user[phone_number]', formData.phone_number);
      if (formData.photo !== originalFormData.photo && formData.photo) data.append('user[photo]', formData.photo);
      if (formData.plan_type !== originalFormData.plan_type && formData.plan_type) data.append('user[plan_type]', formData.plan_type);
      if (formData.plan_duration !== originalFormData.plan_duration && formData.plan_duration) data.append('user[plan_duration]', formData.plan_duration);

      if (formData.plan_type === 'manual') {
        formData.trainings_attributes.forEach((training, index) => {
          const originalTraining = originalFormData.trainings_attributes[index] || {};
          if (training._destroy) {
            if (training.id) {
              data.append(`user[trainings_attributes][${index}][id]`, training.id.toString());
              data.append(`user[trainings_attributes][${index}][_destroy]`, 'true');
            }
          } else if (
            training.id ||
            training.serie_amount !== originalTraining.serie_amount ||
            training.repeat_amount !== originalTraining.repeat_amount ||
            training.exercise_name !== originalTraining.exercise_name ||
            training.video !== originalTraining.video ||
            training.description !== originalTraining.description ||
            training.weekday !== originalTraining.weekday
          ) {
            if (training.id) data.append(`user[trainings_attributes][${index}][id]`, training.id?.toString() || '');
            if (training.serie_amount) data.append(`user[trainings_attributes][${index}][serie_amount]`, training.serie_amount);
            if (training.repeat_amount) data.append(`user[trainings_attributes][${index}][repeat_amount]`, training.repeat_amount);
            if (training.exercise_name) data.append(`user[trainings_attributes][${index}][exercise_name]`, training.exercise_name);
            if (training.video) data.append(`user[trainings_attributes][${index}][video]`, training.video);
            if (training.description) data.append(`user[trainings_attributes][${index}][description]`, training.description);
            if (training.weekday) data.append(`user[trainings_attributes][${index}][weekday]`, training.weekday);
          }
        });

        formData.meals_attributes.forEach((meal, mealIndex) => {
          const originalMeal = originalFormData.meals_attributes[mealIndex] || {};
          if (meal._destroy) {
            if (meal.id) {
              data.append(`user[meals_attributes][${mealIndex}][id]`, meal.id.toString());
              data.append(`user[meals_attributes][${mealIndex}][_destroy]`, 'true');
            }
          } else if (
            meal.id ||
            meal.meal_type !== originalMeal.meal_type ||
            meal.weekday !== originalMeal.weekday
          ) {
            if (meal.id) data.append(`user[meals_attributes][${mealIndex}][id]`, meal.id?.toString() || '');
            if (meal.meal_type) data.append(`user[meals_attributes][${mealIndex}][meal_type]`, meal.meal_type);
            if (meal.weekday) data.append(`user[meals_attributes][${mealIndex}][weekday]`, meal.weekday);

            meal.comidas_attributes.forEach((comida, comidaIndex) => {
              const originalComida = originalMeal.comidas_attributes?.[comidaIndex] || {};
              if (comida._destroy) {
                if (comida.id) {
                  data.append(`user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][id]`, comida.id.toString());
                  data.append(`user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][_destroy]`, 'true');
                }
              } else if (
                comida.id ||
                comida.name !== originalComida.name ||
                comida.amount !== originalComida.amount
              ) {
                if (comida.id) data.append(`user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][id]`, comida.id?.toString() || '');
                if (comida.name) data.append(`user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][name]`, comida.name);
                if (comida.amount) data.append(`user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][amount]`, comida.amount);
              }
            });
          }
        });

        // Clear weekly_pdfs for manual plan
        formData.weekly_pdfs_attributes.forEach((pdf, index) => {
          if (pdf.id && !pdf._destroy) {
            data.append(`user[weekly_pdfs_attributes][${index}][id]`, pdf.id.toString());
            data.append(`user[weekly_pdfs_attributes][${index}][_destroy]`, 'true');
          }
        });
      } else if (formData.plan_type === 'pdf') {
        // Clear trainings and meals for pdf plan
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
                data.append(`user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][id]`, comida.id.toString());
                data.append(`user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][_destroy]`, 'true');
              }
            });
          }
        });

        formData.weekly_pdfs_attributes.forEach((pdfItem, index) => {
          const originalPdf = originalFormData?.weekly_pdfs_attributes[index] || {};
          if (pdfItem._destroy) {
            if (pdfItem.id) {
              data.append(`user[weekly_pdfs_attributes][${index}][id]`, pdfItem.id.toString());
              data.append(`user[weekly_pdfs_attributes][${index}][_destroy]`, 'true');
            }
          } else if (
            pdfItem.id ||
            pdfItem.weekday !== originalPdf.weekday ||
            pdfItem.pdf_file !== originalPdf.pdf_file ||
            pdfItem.notes !== originalPdf.notes
          ) {
            if (pdfItem.id) data.append(`user[weekly_pdfs_attributes][${index}][id]`, pdfItem.id.toString());
            if (pdfItem.weekday) data.append(`user[weekly_pdfs_attributes][${index}][weekday]`, pdfItem.weekday);
            if (pdfItem.pdf_file) data.append(`user[weekly_pdfs_attributes][${index}][pdf]`, pdfItem.pdf_file);
            if (pdfItem.notes) data.append(`user[weekly_pdfs_attributes][${index}][notes]`, pdfItem.notes);
          }
        });
      }
    } else {
      // For create, send all non-empty fields
      if (formData.name) data.append('user[name]', formData.name);
      if (formData.email) data.append('user[email]', formData.email);
      if (formData.password) data.append('user[password]', formData.password);
      if (formData.phone_number) data.append('user[phone_number]', formData.phone_number);
      if (formData.photo) data.append('user[photo]', formData.photo);
      if (formData.plan_type) data.append('user[plan_type]', formData.plan_type);
      if (formData.plan_duration) data.append('user[plan_duration]', formData.plan_duration);

      if (formData.plan_type === 'manual') {
        formData.trainings_attributes.forEach((training, index) => {
          if (!training._destroy) {
            if (training.id) data.append(`user[trainings_attributes][${index}][id]`, training.id?.toString() || '');
            if (training.serie_amount) data.append(`user[trainings_attributes][${index}][serie_amount]`, training.serie_amount);
            if (training.repeat_amount) data.append(`user[trainings_attributes][${index}][repeat_amount]`, training.repeat_amount);
            if (training.exercise_name) data.append(`user[trainings_attributes][${index}][exercise_name]`, training.exercise_name);
            if (training.video) data.append(`user[trainings_attributes][${index}][video]`, training.video);
            if (training.description) data.append(`user[trainings_attributes][${index}][description]`, training.description);
            if (training.weekday) data.append(`user[trainings_attributes][${index}][weekday]`, training.weekday);
          }
        });

        formData.meals_attributes.forEach((meal, mealIndex) => {
          if (!meal._destroy) {
            if (meal.id) data.append(`user[meals_attributes][${mealIndex}][id]`, meal.id?.toString() || '');
            if (meal.meal_type) data.append(`user[meals_attributes][${mealIndex}][meal_type]`, meal.meal_type);
            if (meal.weekday) data.append(`user[meals_attributes][${mealIndex}][weekday]`, meal.weekday);

            meal.comidas_attributes.forEach((comida, comidaIndex) => {
              if (!comida._destroy) {
                if (comida.id) data.append(`user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][id]`, comida.id?.toString() || '');
                if (comida.name) data.append(`user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][name]`, comida.name);
                if (comida.amount) data.append(`user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][amount]`, comida.amount);
              }
            });
          }
        });
      } else if (formData.plan_type === 'pdf') {
        formData.weekly_pdfs_attributes.forEach((pdfItem, index) => {
          if (!pdfItem._destroy) {
            if (pdfItem.id) data.append(`user[weekly_pdfs_attributes][${index}][id]`, pdfItem.id.toString());
            if (pdfItem.weekday) data.append(`user[weekly_pdfs_attributes][${index}][weekday]`, pdfItem.weekday);
            if (pdfItem.pdf_file) data.append(`user[weekly_pdfs_attributes][${index}][pdf]`, pdfItem.pdf_file);
            if (pdfItem.notes) data.append(`user[weekly_pdfs_attributes][${index}][notes]`, pdfItem.notes);
          }
        });
      }
    }

    // Log FormData for debugging
    // Log FormData for debugging (compatible with ES5/ES3)
    data.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    try {
      setError(null);
      const headers = { Authorization: `Bearer ${apiKey}` };
      if (formData.id) {
        await axios.put(`http://localhost:3000/api/v1/users/${formData.id}`, data, { headers });
      } else {
        await axios.post('http://localhost:3000/api/v1/users', data, { headers });
        const phoneNumber = formData.phone_number.replace(/\D/g, '');
        await axios.post('http://localhost:3000/api/v1/send-whatsapp', {
          phoneNumber,
          email: formData.email,
          password: formData.password,
        }, { headers });
      }
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.errors?.join(', ') || err.response?.data?.error || err.message;
      setError(`Erro ao salvar usuário: ${errorMessage}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  const planTypeOptions = [
    { value: 'manual', label: 'Manual' },
    { value: 'pdf', label: 'PDF' },
  ];

  if (loading) return <div>Loading...</div>;
  if (error) return <div className={styles.errorMessage}>{error}</div>;

  return (
    <div className={styles.formContainer}>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.brandLogo}>RF</div>
            <h2 className={styles.title}>Formulário</h2>
          </div>
          <button
            type="button"
            className={`${styles.sidebarButton} ${activeTab === 'basic' ? styles.active : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            <Icons.User /> Informações Básicas
          </button>
          {formData.plan_type === 'manual' && (
            <>
              <button
                type="button"
                className={`${styles.sidebarButton} ${activeTab === 'trainings' ? styles.active : ''}`}
                onClick={() => setActiveTab('trainings')}
              >
                <Icons.Dumbbell /> Treinos
              </button>
              <button
                type="button"
                className={`${styles.sidebarButton} ${activeTab === 'meals' ? styles.active : ''}`}
                onClick={() => setActiveTab('meals')}
              >
                <Icons.Food /> Dietas
              </button>
            </>
          )}
          {formData.plan_type === 'pdf' && (
            <button
              type="button"
              className={`${styles.sidebarButton} ${activeTab === 'pdfs' ? styles.active : ''}`}
              onClick={() => setActiveTab('pdfs')}
            >
              <Icons.File /> PDFs Semanais
            </button>
          )}
        </aside>
        <div className={styles.content}>
          <form onSubmit={handleSubmit}>
            {activeTab === 'basic' && (
              <>
                <div className={styles.section}>
                  <h3>Tipo de Plano</h3>
                  <SelectField
                    label="Tipo de Plano"
                    name="plan_type"
                    value={formData.plan_type}
                    onChange={handleInputChange}
                    options={planTypeOptions}
                    icon={<Icons.File />}
                    required
                  />
                </div>
                <BasicInfoForm
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handlePhotoChange={handlePhotoChange}
                  showPassword={showPassword}
                  togglePasswordVisibility={togglePasswordVisibility}
                  generateRandomPassword={() => setFormData({ ...formData, password: generateRandomPassword() })}
                />
              </>
            )}
            {activeTab === 'trainings' && formData.plan_type === 'manual' && (
              <TrainingForm
                trainings={formData.trainings_attributes}
                handleTrainingChange={handleTrainingChange}
                removeTraining={removeTraining}
                addTraining={addTraining}
              />
            )}
            {activeTab === 'meals' && formData.plan_type === 'manual' && (
              <MealForm
                meals={formData.meals_attributes}
                handleMealChange={handleMealChange}
                removeMeal={removeMeal}
                addMeal={addMeal}
                handleComidaChange={handleComidaChange}
                removeComida={removeComida}
                addComida={addComida}
              />
            )}
            {activeTab === 'pdfs' && formData.plan_type === 'pdf' && (
              <PdfForm
                weeklyPdfs={formData.weekly_pdfs_attributes}
                handlePdfChange={handlePdfChange}
                removePdf={removePdf}
                addPdf={addPdf}
              />
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
                disabled={formSubmitting || (formData.plan_type === 'pdf' && !formData.weekly_pdfs_attributes.some(pdf => pdf.pdf_file || pdf.pdf_url))}
                aria-label="Salvar usuário"
              >
                {formSubmitting ? <Icons.Loading /> : <Icons.Save />}
                {formData.id ? 'Atualizar Usuário' : 'Cadastrar Usuário'}
              </button>
            </div>
          </form>
          {error && <div className={styles.errorMessage} role="alert">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default UserForm;

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  icon: React.ReactNode;
  required?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, name, value, onChange, options, icon, required }) => (
  <div className={styles.inputGroup}>
    <label className={styles.label}>
      <span className={styles.icon}>{icon}</span>
      {label}
      {required && <span className={styles.required}>*</span>}
    </label>
    <select name={name} value={value} onChange={onChange} required={required} className={styles.input}>
      <option value="">Selecione</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);