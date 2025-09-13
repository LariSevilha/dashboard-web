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

interface UserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  userType?: 'pdf' | 'manual' | null;
}

interface TrainingExerciseSet {
  id?: number;
  series_amount: string;
  repeats_amount: string;
  _destroy?: boolean;
}

interface TrainingExercise {
  id: number | null;
  exercise_id: number | null;
  exercise_name: string;
  video: string;
  training_exercise_sets: TrainingExerciseSet[];
  _destroy: boolean;
}

interface Training {
  id: number | null;
  weekday: string;
  description: string;
  training_exercises: TrainingExercise[];
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
  registration_date?: string;
  expiration_date?: string;
  photo_url?: string;
  photo?: File | null;
}

const UserForm: React.FC<UserFormProps> = ({ onSuccess, onCancel, userType }) => {
  const initialFormState = useMemo<FormDataInterface>(
    () => ({
      id: null,
      name: '',
      email: '',
      password: '',
      phone_number: '',
      trainings_attributes: [
        {
          id: null,
          weekday: '',
          description: '',
          training_exercises: [
            {
              id: null,
              exercise_id: null,
              exercise_name: '',
              video: '',
              training_exercise_sets: [],
              _destroy: false,
            },
          ],
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
      registration_date: '',
      expiration_date: '',
    }),
    []
  );

  const [formData, setFormData] = useState<FormDataInterface>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'trainings' | 'meals' | 'pdfs'>('basic');
  const [theme, setTheme] = useState<string>(localStorage.getItem('theme') || 'dark');
  const [isMaster, setIsMaster] = useState<boolean>(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const deviceId = localStorage.getItem('deviceId') || Math.random().toString(36).substring(2);

  if (!localStorage.getItem('deviceId')) {
    localStorage.setItem('deviceId', deviceId);
  }

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

    axios
      .get('http://localhost:3000/api/v1/current_user', {
        headers: { Authorization: `Bearer ${apiKey}`, 'Device-ID': deviceId },
      })
      .then((response) => {
        setIsMaster(response.data.role === 'master');
      })
      .catch((err) => {
        console.error('Error fetching current user:', err);
        setError('Falha ao verificar usuário. Faça login novamente.');
        localStorage.removeItem('apiKey');
        localStorage.removeItem('deviceId');
        navigate('/login');
      });

    const queryParams = new URLSearchParams(location.search);
    const planTypeFromUrl = queryParams.get('type') as 'manual' | 'pdf' | null;

    if (id) {
      setLoading(true);
      axios
        .get(`http://localhost:3000/api/v1/users/${id}`, {
          headers: { Authorization: `Bearer ${apiKey}`, 'Device-ID': deviceId },
        })
        .then((response) => {
          const user = response.data;
          const loadedPdfs = user.weekly_pdfs?.length
            ? user.weekly_pdfs.map((p: any) => ({
                id: p.id,
                weekday: p.weekday || '',
                pdf_file: null,
                pdf_url: p.pdf_url,
                pdf_filename: p.pdf_filename || extractFilenameFromUrl(p.pdf_url),
                notes: p.notes || '',
                _destroy: false,
              }))
            : [initialFormState.weekly_pdfs_attributes[0]];

          const hasActivePdfs = loadedPdfs.some((p: WeeklyPdf) => !p._destroy && (p.pdf_url || p.pdf_file));
          const inferredPlanType = hasActivePdfs ? 'pdf' : user.plan_type || 'manual';

          setFormData({
            id: user.id || null,
            name: user.name || '',
            email: user.email || '',
            password: '',
            phone_number: user.phone_number || '',
            trainings_attributes: inferredPlanType === 'manual' && user.trainings?.length
              ? user.trainings.map((t: any) => ({
                  id: t.id || null,
                  weekday: t.weekday || '',
                  description: t.description || '',
                  training_exercises: t.training_exercises?.map((te: any) => ({
                    id: te.id || null,
                    exercise_id: te.exercise?.id || null,
                    exercise_name: te.exercise?.name || '',
                    video: te.exercise?.video || '',
                    training_exercise_sets: te.training_exercise_sets?.map((ts: any) => ({
                      id: ts.id,
                      series_amount: ts.series_amount?.toString() || '',
                      repeats_amount: ts.repeats_amount?.toString() || '',
                      _destroy: false,
                    })) || [],
                    _destroy: false,
                  })) || [],
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
            registration_date: user.registration_date
              ? new Date(user.registration_date).toISOString().split('T')[0]
              : '',
            expiration_date: user.expiration_date
              ? new Date(user.expiration_date).toISOString().split('T')[0]
              : '',
          });
          setActiveTab('basic');
          setLoading(false);
        })
        .catch((err) => {
          setError('Erro ao carregar dados do usuário');
          setLoading(false);
        });
    } else {
      setFormData({ ...initialFormState, plan_type: planTypeFromUrl || 'manual' });
      setActiveTab('basic');
      setLoading(false);
    }
  }, [id, navigate, location.search, initialFormState]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  // Training functions
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

  // Training Exercise functions
  const addTrainingExercise = (trainingIndex: number) => {
    const updatedTrainings = [...formData.trainings_attributes];
    updatedTrainings[trainingIndex].training_exercises.push({
      ...initialFormState.trainings_attributes[0].training_exercises[0],
    });
    setFormData({ ...formData, trainings_attributes: updatedTrainings });
  };

  const handleTrainingExerciseChange = (trainingIndex: number, exerciseIndex: number, field: string, value: string) => {
    const updatedTrainings = [...formData.trainings_attributes];
    updatedTrainings[trainingIndex].training_exercises[exerciseIndex] = {
      ...updatedTrainings[trainingIndex].training_exercises[exerciseIndex],
      [field]: value,
    };
    setFormData({ ...formData, trainings_attributes: updatedTrainings });
  };

  const removeTrainingExercise = (trainingIndex: number, exerciseIndex: number) => {
    const updatedTrainings = [...formData.trainings_attributes];
    const exercise = updatedTrainings[trainingIndex].training_exercises[exerciseIndex];
    if (exercise.id) exercise._destroy = true;
    else updatedTrainings[trainingIndex].training_exercises.splice(exerciseIndex, 1);
    setFormData({ ...formData, trainings_attributes: updatedTrainings });
  };

  // Training Exercise Set functions (Substitui Series e Repeats)
  const addExerciseSet = (trainingIndex: number, exerciseIndex: number) => {
    const updatedTrainings = [...formData.trainings_attributes];
    const newSet: TrainingExerciseSet = { series_amount: '', repeats_amount: '', _destroy: false };
    updatedTrainings[trainingIndex].training_exercises[exerciseIndex].training_exercise_sets = [
      ...updatedTrainings[trainingIndex].training_exercises[exerciseIndex].training_exercise_sets,
      newSet,
    ];
    setFormData({ ...formData, trainings_attributes: updatedTrainings });
  };

  const handleExerciseSetChange = (trainingIndex: number, exerciseIndex: number, setIndex: number, field: string, value: string) => {
    const updatedTrainings = [...formData.trainings_attributes];
    updatedTrainings[trainingIndex].training_exercises[exerciseIndex].training_exercise_sets[setIndex] = {
      ...updatedTrainings[trainingIndex].training_exercises[exerciseIndex].training_exercise_sets[setIndex],
      [field]: value,
    };
    setFormData({ ...formData, trainings_attributes: updatedTrainings });
  };

  const removeExerciseSet = (trainingIndex: number, exerciseIndex: number, setIndex: number) => {
    const updatedTrainings = [...formData.trainings_attributes];
    const exerciseSet = updatedTrainings[trainingIndex].training_exercises[exerciseIndex].training_exercise_sets[setIndex];
    if (exerciseSet.id) exerciseSet._destroy = true;
    else updatedTrainings[trainingIndex].training_exercises[exerciseIndex].training_exercise_sets.splice(setIndex, 1);
    setFormData({ ...formData, trainings_attributes: updatedTrainings });
  };

  // Meal functions (unchanged)
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

  // PDF functions (unchanged)
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
    if (formData.name) data.append('user[name]', formData.name);
    if (formData.email) data.append('user[email]', formData.email);
    if (formData.password) data.append('user[password]', formData.password);
    if (formData.plan_type) data.append('user[plan_type]', formData.plan_type);
    if (formData.plan_duration) data.append('user[plan_duration]', formData.plan_duration);
    if (formData.phone_number) data.append('user[phone_number]', formData.phone_number);
    if (formData.registration_date) data.append('user[registration_date]', formData.registration_date);

    if (formData.plan_type === 'manual') {
      formData.trainings_attributes.forEach((training, index) => {
        if (training._destroy) {
          if (training.id) {
            data.append(`user[trainings_attributes][${index}][id]`, training.id.toString());
            data.append(`user[trainings_attributes][${index}][_destroy]`, 'true');
          }
        } else {
          if (training.id) data.append(`user[trainings_attributes][${index}][id]`, training.id?.toString() || '');
          data.append(`user[trainings_attributes][${index}][weekday]`, training.weekday);
          data.append(`user[trainings_attributes][${index}][description]`, training.description || '');

          training.training_exercises.forEach((exercise, exerciseIndex) => {
            if (exercise._destroy) {
              if (exercise.id) {
                data.append(
                  `user[trainings_attributes][${index}][training_exercises_attributes][${exerciseIndex}][id]`,
                  exercise.id.toString()
                );
                data.append(
                  `user[trainings_attributes][${index}][training_exercises_attributes][${exerciseIndex}][_destroy]`,
                  'true'
                );
              }
            } else {
              if (exercise.id)
                data.append(
                  `user[trainings_attributes][${index}][training_exercises_attributes][${exerciseIndex}][id]`,
                  exercise.id.toString()
                );
              if (exercise.exercise_id)
                data.append(
                  `user[trainings_attributes][${index}][training_exercises_attributes][${exerciseIndex}][exercise_id]`,
                  exercise.exercise_id.toString()
                );
              // Enviar tanto exercise_name quanto video para o backend lidar com a criação/busca do exercício
              data.append(
                `user[trainings_attributes][${index}][training_exercises_attributes][${exerciseIndex}][exercise_name]`,
                exercise.exercise_name
              );
              data.append(
                `user[trainings_attributes][${index}][training_exercises_attributes][${exerciseIndex}][video]`,
                exercise.video
              );

              // Atualizado para usar training_exercise_sets ao invés de series e repeats separados
              exercise.training_exercise_sets.forEach((exerciseSet, setIndex) => {
                if (exerciseSet._destroy) {
                  if (exerciseSet.id) {
                    data.append(
                      `user[trainings_attributes][${index}][training_exercises_attributes][${exerciseIndex}][training_exercise_sets_attributes][${setIndex}][id]`,
                      exerciseSet.id.toString()
                    );
                    data.append(
                      `user[trainings_attributes][${index}][training_exercises_attributes][${exerciseIndex}][training_exercise_sets_attributes][${setIndex}][_destroy]`,
                      'true'
                    );
                  }
                } else {
                  if (exerciseSet.id)
                    data.append(
                      `user[trainings_attributes][${index}][training_exercises_attributes][${exerciseIndex}][training_exercise_sets_attributes][${setIndex}][id]`,
                      exerciseSet.id.toString()
                    );
                  data.append(
                    `user[trainings_attributes][${index}][training_exercises_attributes][${exerciseIndex}][training_exercise_sets_attributes][${setIndex}][series_amount]`,
                    exerciseSet.series_amount
                  );
                  data.append(
                    `user[trainings_attributes][${index}][training_exercises_attributes][${exerciseIndex}][training_exercise_sets_attributes][${setIndex}][repeats_amount]`,
                    exerciseSet.repeats_amount
                  );
                }
              });
            }
          });
        }
      });

      formData.meals_attributes.forEach((meal, mealIndex) => {
        if (meal._destroy) {
          if (meal.id) {
            data.append(`user[meals_attributes][${mealIndex}][id]`, meal.id.toString());
            data.append(`user[meals_attributes][${mealIndex}][_destroy]`, 'true');
          }
        } else {
          if (meal.id) data.append(`user[meals_attributes][${mealIndex}][id]`, meal.id?.toString() || '');
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
                  comida.id?.toString() || ''
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
        if (pdfItem.pdf_file) data.append(`user[weekly_pdfs_attributes][${index}][pdf]`, pdfItem.pdf_file);
        if (pdfItem.notes) data.append(`user[weekly_pdfs_attributes][${index}][notes]`, pdfItem.notes);
        data.append(`user[weekly_pdfs_attributes][${index}][_destroy]`, pdfItem._destroy.toString());
      });
    }

    try {
      setError(null);
      const headers = { Authorization: `Bearer ${apiKey}`, 'Device-ID': deviceId };
      if (formData.id) {
        await axios.put(`http://localhost:3000/api/v1/users/${formData.id}`, data, { headers });
      } else {
        await axios.post('http://localhost:3000/api/v1/users', data, { headers });
        const phoneNumber = formData.phone_number.replace(/\D/g, '');
        await axios.post(
          'http://localhost:3000/api/v1/send-whatsapp',
          {
            phoneNumber,
            email: formData.email,
            password: formData.password,
          },
          { headers }
        );
      }
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.errors?.join(', ') || err.response?.data?.error || err.message;
      setError(`Erro ao salvar usuário: ${errorMessage}`);
    } finally {
      setFormSubmitting(false);
    }
  };

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
          <button
            type="button"
            className={styles.sidebarButton}
            onClick={toggleTheme}
            aria-label={`Alternar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
          >
            <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'} />{' '}
            {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          </button>
        </aside>
        <div className={styles.content}>
          <form onSubmit={handleSubmit}>
            {activeTab === 'basic' && (
              <BasicInfoForm
                formData={{
                  ...formData,
                  photo: null,
                }}
                handleInputChange={handleInputChange}
                handlePhotoChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files ? e.target.files[0] : null;
                  setFormData({ ...formData, photo: file });
                }}
                showPassword={showPassword}
                togglePasswordVisibility={togglePasswordVisibility}
                generateRandomPassword={() => setFormData({ ...formData, password: generateRandomPassword() })}
                styles={styles}
              />
            )}
            {activeTab === 'trainings' && formData.plan_type === 'manual' && (
              <TrainingForm
                trainings={formData.trainings_attributes}
                handleTrainingChange={handleTrainingChange}
                handleTrainingExerciseChange={handleTrainingExerciseChange}
                handleExerciseSetChange={handleExerciseSetChange}
                addTrainingExercise={addTrainingExercise}
                addExerciseSet={addExerciseSet}
                removeTrainingExercise={removeTrainingExercise}
                removeExerciseSet={removeExerciseSet}
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
                styles={styles}
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