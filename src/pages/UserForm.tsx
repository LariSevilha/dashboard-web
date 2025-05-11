import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../styles/UserForm.module.css';

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

interface FormDataInterface {
  id: number | null;
  name: string;
  email: string;
  password: string;
  trainings_attributes: Training[];
  meals_attributes: Meal[];
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
  };

  const [formData, setFormData] = useState<FormDataInterface>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
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

          setFormData({
            id: user.id,
            name: user.name || '',
            email: user.email || '',
            password: '',
            trainings_attributes:
              user.trainings && user.trainings.length > 0
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
                : [{ id: null, serie_amount: '', repeat_amount: '', exercise_name: '', video: '', weekday: '', _destroy: false }],
            meals_attributes:
              user.meals && user.meals.length > 0
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
                  ],
          });

          setLoading(false);
        })
        .catch((err) => {
          console.error('Erro ao carregar usuário:', err.response?.data || err.message);
          setError('Erro ao carregar dados do usuário');
          setLoading(false);
        });
    } else {
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

    const payload = {
      user: {
        name: formData.name,
        email: formData.email,
        ...(formData.password ? { password: formData.password } : {}),
        trainings_attributes: formData.trainings_attributes.filter((t) => !t._destroy || t.id),
        meals_attributes: formData.meals_attributes
          .filter((m) => !m._destroy || m.id)
          .map((meal) => ({
            ...meal,
            comidas_attributes: meal.comidas_attributes.filter((c) => !c._destroy || c.id),
          })),
      },
    };

    const headers = {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };

    try {
      setError(null);
      if (formData.id) {
        await axios.put(`http://localhost:3000/api/v1/users/${formData.id}`, payload, { headers });
      } else {
        await axios.post('http://localhost:3000/api/v1/users', payload, { headers });
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
      <form onSubmit={handleSubmit}>
        {/* Informações Básicas */}
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
                value={formData.password}
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

        {/* Treinos */}
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

        {/* Dietas */}
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