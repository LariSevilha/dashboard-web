 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../styles/UserForm.module.css';  
import { format } from 'date-fns';  
const Icons = {
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Email: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  ),
  Password: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  ),
  Food: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
      <line x1="6" y1="1" x2="6" y2="4"></line>
      <line x1="10" y1="1" x2="10" y2="4"></line>
      <line x1="14" y1="1" x2="14" y2="4"></line>
    </svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Minus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  ),
  Save: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
  ),
  Cancel: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="15" y1="9" x2="9" y2="15"></line>
      <line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
  ),
  EyeOpen: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  ),
  EyeClose: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  ),
  Loading: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.spinAnimation}>
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 6v6l4 2"></path>
    </svg>
  ),
  File: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
      <polyline points="13 2 13 9 20 9"></polyline>
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  ),
};

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

interface Training {
  id: number | null;
  serie_amount: string;
  repeat_amount: string;
  exercise_name: string;
  video: string;
  weekday: string;
  _destroy: boolean;
}

interface WeeklyPdf {
  id: number | null;
  weekday: string;
  pdf_file: File | null; // Changed from 'pdf' to 'pdf_file' to store the actual file
  pdf_url?: string; // Optional for existing PDFs, received from API
  pdf_filename?: string; // Add filename property for display
  _destroy: boolean;
}

interface FormDataInterface {
  id: number | null;
  name: string;
  email: string;
  password?: string; // Make password optional for updates
  trainings_attributes: Training[];
  meals_attributes: Meal[];
  weekly_pdfs_attributes: WeeklyPdf[];
}

const InputField: React.FC<{
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  optional?: boolean;
}> = ({ label, type, name, value, onChange, placeholder, required = false, icon, optional = false }) => {
  return (
    <div className={`${styles.inputGroup} ${value ? styles.filled : ''} ${optional ? styles.optional : ''}`}>
      <label>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        {label}
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
        {/* Display the current file name */}
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

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
  required?: boolean;
}> = ({ label, value, onChange, options, icon, required = false }) => {
  return (
    <div className={`${styles.inputGroup} ${value ? styles.filled : ''}`}>
      <label>
        {icon && <span className={styles.inputIcon}>{icon}</span>}
        {label}
      </label>
      <select value={value} onChange={onChange} required={required} aria-required={required}>
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const WeekdayOptions = [
  { value: 'sunday', label: 'Domingo' },
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
];

// Helper function to extract filename from URL
const extractFilenameFromUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove query parameters and hash
  const cleanUrl = url.split('?')[0].split('#')[0];
  
  // Get the last part of the path
  const parts = cleanUrl.split('/');
  const filename = parts[parts.length - 1];
  
  // Decode URL encoding
  try {
    return decodeURIComponent(filename);
  } catch (e) {
    return filename;
  }
};

const UserForm: React.FC = () => {
  const initialFormState: FormDataInterface = {
    id: null,
    name: '',
    email: '',
    password: '',
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
        comidas_attributes: [{ id: null, name: '', amount: '', _destroy: false }],
      },
    ],
    weekly_pdfs_attributes: [
      {
        id: null,
        weekday: '',
        pdf_file: null, // Initial state uses pdf_file
        pdf_url: undefined, // No URL initially
        pdf_filename: undefined, // No filename initially
        _destroy: false,
      },
    ],
  };

  const [formData, setFormData] = useState<FormDataInterface>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'trainings' | 'meals' | 'pdfs'>('basic');
  const [hasActivePdf, setHasActivePdf] = useState<boolean>(false); // New state to track active PDFs
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
      navigate('/login');
      return;
    }

    const weekdayEnumMap: Record<string, string> = {
      '0': 'sunday',
      '1': 'monday',
      '2': 'tuesday',
      '3': 'wednesday',
      '4': 'thursday',
      '5': 'friday',
      '6': 'saturday',
    };

    if (id) {
      setLoading(true);
      axios
        .get(`http://localhost:3000/api/v1/users/${id}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        .then((response) => {
          const user = response.data;

          const loadedPdfs =
            user.weekly_pdfs && user.weekly_pdfs.length > 0
              ? user.weekly_pdfs.map((p: any) => ({
                  id: p.id,
                  weekday: p.weekday || '',
                  pdf_file: null, // Files are not loaded from API, only URLs
                  pdf_url: p.pdf_url,
                  pdf_filename: p.pdf_url ? extractFilenameFromUrl(p.pdf_url) : undefined,
                  _destroy: false,
                }))
              : [{ id: null, weekday: '', pdf_file: null, pdf_url: undefined, pdf_filename: undefined, _destroy: false }];

          // Determine if there are any active PDFs
          const activePdfsExist = loadedPdfs.some(
            (p: WeeklyPdf) => !p._destroy && (p.pdf_url || p.pdf_file)
          );
          setHasActivePdf(activePdfsExist);

          setFormData({
            id: user.id,
            name: user.name || '',
            email: user.email || '',
            password: '',
            trainings_attributes:
              user.trainings && user.trainings.length > 0 && !activePdfsExist // Only load if no active PDFs
                ? user.trainings.map((t: any) => ({
                    id: t.id,
                    serie_amount: t.serie_amount || '',
                    repeat_amount: t.repeat_amount || '',
                    exercise_name: t.exercise_name || '',
                    video: t.video || '',
                    weekday:
                      typeof t.weekday === 'number'
                        ? weekdayEnumMap[t.weekday.toString()]
                        : t.weekday || '',
                    _destroy: false,
                  }))
                : [{ id: null, serie_amount: '', repeat_amount: '', exercise_name: '', video: '', weekday: '', _destroy: false }], // Default if no trainings or active PDFs
            meals_attributes:
              user.meals && user.meals.length > 0 && !activePdfsExist // Only load if no active PDFs
                ? user.meals.map((m: any) => ({
                    id: m.id,
                    meal_type: m.meal_type || '',
                    weekday:
                      typeof m.weekday === 'number'
                        ? weekdayEnumMap[String(m.weekday)]
                        : m.weekday || '',
                    _destroy: false,
                    comidas_attributes:
                      m.comidas && m.comidas.length > 0
                        ? m.comidas.map((c: any) => ({
                            id: c.id,
                            name: c.name || '',
                            amount: c.amount || (c.amount_meal && c.amount_meal.amount) || '',
                            _destroy: false,
                          }))
                        : [{ id: null, name: '', amount: '', _destroy: false }],
                  }))
                : [
                    {
                      id: null,
                      meal_type: '',
                      weekday: '',
                      _destroy: false,
                      comidas_attributes: [{ id: null, name: '', amount: '', _destroy: false }],
                    },
                  ], // Default if no meals or active PDFs
            weekly_pdfs_attributes: loadedPdfs,
          });

          setLoading(false);
        })
        .catch((err) => {
          console.error('Erro ao carregar usuário:', err.response?.data || err.message);
          setError('Erro ao carregar dados do usuário');
          setLoading(false);
        });
    } else {
      // For new users, default no active PDFs
      setHasActivePdf(false);
      setLoading(false);
    }
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTrainingChange = (index: number, field: string, value: string) => {
    const newTrainings = [...formData.trainings_attributes];
    newTrainings[index] = { ...newTrainings[index], [field]: value };
    setFormData({ ...formData, trainings_attributes: newTrainings });
  };

  const handleMealChange = (index: number, field: string, value: string) => {
    const newMeals = [...formData.meals_attributes];
    newMeals[index] = { ...newMeals[index], [field]: value };
    setFormData({ ...formData, meals_attributes: newMeals });
  };

  const handleComidaChange = (mealIndex: number, comidaIndex: number, field: string, value: string) => {
    const newMeals = [...formData.meals_attributes];
    const newComidas = [...newMeals[mealIndex].comidas_attributes];
    newComidas[comidaIndex] = { ...newComidas[comidaIndex], [field]: value };
    newMeals[mealIndex].comidas_attributes = newComidas;
    setFormData({ ...formData, meals_attributes: newMeals });
  };

  const handlePdfChange = (index: number, field: string, value: string | File | null) => {
    const newPdfs = [...formData.weekly_pdfs_attributes];
    if (field === 'pdf_file' && value instanceof File) {
      newPdfs[index] = { 
        ...newPdfs[index], 
        pdf_file: value,
        pdf_filename: value.name // Set the filename when a new file is selected
      };
      // If a new file is selected, clear the existing URL (if any)
      newPdfs[index].pdf_url = undefined;
    } else if (typeof value === 'string') {
      newPdfs[index] = { ...newPdfs[index], [field]: value };
    }
    setFormData({ ...formData, weekly_pdfs_attributes: newPdfs });

    // Update hasActivePdf state immediately
    const activePdfsExist = newPdfs.some(
      (p) => !p._destroy && (p.pdf_url || p.pdf_file)
    );
    setHasActivePdf(activePdfsExist);
  };

  const addTraining = () => {
    setFormData({
      ...formData,
      trainings_attributes: [
        ...formData.trainings_attributes,
        { id: null, serie_amount: '', repeat_amount: '', exercise_name: '', video: '', weekday: '', _destroy: false },
      ],
    });
  };

  const removeTraining = (index: number) => {
    const newTrainings = [...formData.trainings_attributes];
    if (newTrainings[index].id) {
      newTrainings[index] = { ...newTrainings[index], _destroy: true };
      setFormData({ ...formData, trainings_attributes: newTrainings });
    } else {
      newTrainings.splice(index, 1);
      setFormData({ ...formData, trainings_attributes: newTrainings });
    }
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
          comidas_attributes: [{ id: null, name: '', amount: '', _destroy: false }],
        },
      ],
    });
  };

  const removeMeal = (index: number) => {
    const newMeals = [...formData.meals_attributes];
    if (newMeals[index].id) {
      newMeals[index] = { ...newMeals[index], _destroy: true };
      setFormData({ ...formData, meals_attributes: newMeals });
    } else {
      newMeals.splice(index, 1);
      setFormData({ ...formData, meals_attributes: newMeals });
    }
  };

  const addComida = (mealIndex: number) => {
    const newMeals = [...formData.meals_attributes];
    newMeals[mealIndex].comidas_attributes.push({ id: null, name: '', amount: '', _destroy: false });
    setFormData({ ...formData, meals_attributes: newMeals });
  };

  const removeComida = (mealIndex: number, comidaIndex: number) => {
    const newMeals = [...formData.meals_attributes];
    const comida = newMeals[mealIndex].comidas_attributes[comidaIndex];
    if (comida.id) {
      newMeals[mealIndex].comidas_attributes[comidaIndex] = { ...comida, _destroy: true };
    } else {
      newMeals[mealIndex].comidas_attributes.splice(comidaIndex, 1);
    }
    setFormData({ ...formData, meals_attributes: newMeals });
  };

  const addPdf = () => {
    setFormData({
      ...formData,
      weekly_pdfs_attributes: [
        ...formData.weekly_pdfs_attributes,
        { id: null, weekday: '', pdf_file: null, pdf_url: undefined, pdf_filename: undefined, _destroy: false },
      ],
    });
    // If a new PDF is added, set hasActivePdf to true
    setHasActivePdf(true);
  };

  const removePdf = (index: number) => {
    const newPdfs = [...formData.weekly_pdfs_attributes];
    if (newPdfs[index].id) {
      newPdfs[index] = { ...newPdfs[index], _destroy: true, pdf_file: null, pdf_filename: undefined }; // Clear pdf_file and filename on destroy
    } else {
      newPdfs.splice(index, 1);
    }
    setFormData({ ...formData, weekly_pdfs_attributes: newPdfs });

    // Re-evaluate hasActivePdf after removal
    const activePdfsExist = newPdfs.some(
      (p) => !p._destroy && (p.pdf_url || p.pdf_file)
    );
    setHasActivePdf(activePdfsExist);

    // If all PDFs are removed and there were previously active PDFs,
    // switch to basic tab or another default tab and reset trainings/meals.
    if (!activePdfsExist && activeTab === 'pdfs') {
      setActiveTab('basic');
      // Reset trainings and meals to initial state when PDFs are no longer active
      setFormData(prevData => ({
        ...prevData,
        trainings_attributes: initialFormState.trainings_attributes,
        meals_attributes: initialFormState.meals_attributes,
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
    // Only send password if it's being set or updated (i.e., not empty on update)
    if (formData.password) data.append('user[password]', formData.password);

    // Append trainings only if no active PDFs
    if (!hasActivePdf) {
      formData.trainings_attributes.forEach((training, index) => {
        if (training._destroy) {
          // Only send _destroy for existing records
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
    } else {
      // If there are active PDFs, ensure all existing trainings are marked for destruction
      // This handles the transition from custom plans to PDF plans
      formData.trainings_attributes.forEach((training, index) => {
        if (training.id && !training._destroy) { // Only mark for destruction if it's an existing, active training
          data.append(`user[trainings_attributes][${index}][id]`, training.id.toString());
          data.append(`user[trainings_attributes][${index}][_destroy]`, 'true');
        }
      });
    }

    // Append meals and comidas only if no active PDFs
    if (!hasActivePdf) {
      formData.meals_attributes.forEach((meal, mealIndex) => {
        if (meal._destroy) {
          // Only send _destroy for existing records
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
                data.append(`user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][id]`, comida.id.toString());
                data.append(`user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][_destroy]`, 'true');
              }
            } else {
              if (comida.id) data.append(`user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][id]`, comida.id.toString());
              data.append(`user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][name]`, comida.name);
              data.append(`user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][amount]`, comida.amount);
            }
          });
        }
      });
    } else {
      // If there are active PDFs, ensure all existing meals are marked for destruction
      formData.meals_attributes.forEach((meal, mealIndex) => {
        if (meal.id && !meal._destroy) { // Only mark for destruction if it's an existing, active meal
          data.append(`user[meals_attributes][${mealIndex}][id]`, meal.id.toString());
          data.append(`user[meals_attributes][${mealIndex}][_destroy]`, 'true');
          // Also mark associated comidas for destruction
          meal.comidas_attributes.forEach((comida, comidaIndex) => {
            if (comida.id && !comida._destroy) {
              data.append(`user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][id]`, comida.id.toString());
              data.append(`user[meals_attributes][${mealIndex}][comidas_attributes][${comidaIndex}][_destroy]`, 'true');
            }
          });
        }
      });
    }

    // Append weekly_pdfs
    formData.weekly_pdfs_attributes.forEach((pdfItem, index) => {
      if (pdfItem.id) data.append(`user[weekly_pdfs_attributes][${index}][id]`, pdfItem.id.toString());
      data.append(`user[weekly_pdfs_attributes][${index}][weekday]`, pdfItem.weekday);
      if (pdfItem.pdf_file) { // Use pdf_file for upload
        data.append(`user[weekly_pdfs_attributes][${index}][pdf]`, pdfItem.pdf_file);
      }
      data.append(`user[weekly_pdfs_attributes][${index}][_destroy]`, pdfItem._destroy.toString());
    });


    const headers = {
      Authorization: `Bearer ${apiKey}`,
      // No 'Content-Type' header needed for FormData; browser sets it with boundary
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
    return (
      <div className={styles.loading}>
        Carregando formulário...
        <Icons.Loading />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>{formData.id ? 'Editar Usuário' : 'Novo Usuário'}</h1>

      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'basic' ? styles.active : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Informações Básicas
        </button>
        {!hasActivePdf && ( // Conditionally render "Treinos" tab
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'trainings' ? styles.active : ''}`}
            onClick={() => setActiveTab('trainings')}
          >
            Treinos
          </button>
        )}
        {!hasActivePdf && ( // Conditionally render "Dietas" tab
          <button
            type="button"
            className={`${styles.tabButton} ${activeTab === 'meals' ? styles.active : ''}`}
            onClick={() => setActiveTab('meals')}
          >
            Dietas
          </button>
        )}
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'pdfs' ? styles.active : ''}`}
          onClick={() => setActiveTab('pdfs')}
        >
          PDFs Semanais
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info Tab Content */}
        {activeTab === 'basic' && (
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
              <div className={`${styles.inputGroup} ${styles.passwordWrapper} ${formData.password ? styles.filled : ''}`}>
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
            </div>
          </div>
        )}

        {/* Trainings Tab Content */}
        {activeTab === 'trainings' && !hasActivePdf && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Treinos</h3>
              <button type="button" className={styles.addButton} onClick={addTraining} aria-label="Adicionar novo treino">
                <Icons.Plus /> Adicionar Treino
              </button>
            </div>
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

        {/* Meals Tab Content */}
        {activeTab === 'meals' && !hasActivePdf && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3>Dietas</h3>
              <button type="button" className={styles.addButton} onClick={addMeal} aria-label="Adicionar nova refeição">
                <Icons.Plus /> Adicionar Refeição
              </button>
            </div>
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

                  {/* Comidas */}
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
                            className={styles.removeFoodButton}
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

        {/* PDFs Tab Content */}
        {activeTab === 'pdfs' && (
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
                    <SelectField
                      label="Dia da Semana"
                      value={pdfItem.weekday}
                      onChange={(e) => handlePdfChange(index, 'weekday', e.target.value)}
                      options={WeekdayOptions}
                      icon={<Icons.Calendar />}
                      required  
                    />
                    <FileInputField
                      label="Upload PDF"
                      name={`pdf-${index}-file`}
                      onChange={(e) => handlePdfChange(index, 'pdf_file', e.target.files ? e.target.files[0] : null)}
                      icon={<Icons.File />}
                      required={!pdfItem.id && !pdfItem.pdf_url && !pdfItem.pdf_file}  
                      currentFileName={
                        pdfItem.pdf_file
                          ? pdfItem.pdf_file.name  
                          : pdfItem.pdf_url
                          ? pdfItem.pdf_url.split('/').pop()  
                          : undefined
                      }  
                    />
                    {pdfItem.pdf_url && !pdfItem.pdf_file && ( 
                      <p className={styles.currentPdf}>
                        PDF atual:{' '}
                        <a href={pdfItem.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Icons.Download /> Baixar PDF
                        </a>
                      </p>
                    )}
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
          <button type="submit" className={styles.submitButton} disabled={formSubmitting} aria-label="Salvar usuário">
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
  );
};

export default UserForm;