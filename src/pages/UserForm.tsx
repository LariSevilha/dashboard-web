import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../styles/UserForm.module.css';

const UserForm: React.FC = () => {
  const [formData, setFormData] = useState({
    id: null as number | null,
    name: '',
    email: '',
    password: '',
    trainings_attributes: [
      { 
        id: null as number | null, 
        serie_amount: '', 
        repeat_amount: '', 
        exercise_name: '', 
        video: '', 
        weekday: '', 
        _destroy: false 
      }
    ],
    meals_attributes: [
      { 
        id: null as number | null, 
        meal_type: '', 
        weekday: '',  
        _destroy: false,
        comidas_attributes: [
          { id: null as number | null, name: '', amount: '', _destroy: false }
        ] 
      }
    ],
  });
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
      navigate('/login');
      return;
    }
  
    const weekdayEnumMap: Record<string, string> = {
      "0": "sunday",
      "1": "monday",
      "2": "tuesday",
      "3": "wednesday",
      "4": "thursday",
      "5": "friday",
      "6": "saturday"
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
            trainings_attributes: user.trainings && user.trainings.length > 0 
              ? user.trainings.map((t: any) => ({
                  id: t.id,
                  serie_amount: t.serie_amount || '',
                  repeat_amount: t.repeat_amount || '',
                  exercise_name: t.exercise_name || '',
                  video: t.video || '',
                  weekday: typeof t.weekday === 'number'
                  ? weekdayEnumMap[t.weekday.toString() as keyof typeof weekdayEnumMap]
                  : t.weekday || '',                
                  _destroy: false
                }))
              : [{ id: null, serie_amount: '', repeat_amount: '', exercise_name: '', video: '', weekday: '', _destroy: false }],
            
            meals_attributes: user.meals && user.meals.length > 0
              ? user.meals.map((m: any) => ({
                  id: m.id,
                  meal_type: m.meal_type || '',
                  weekday: typeof m.weekday === 'number'
                    ? weekdayEnumMap[String(m.weekday)]
                    : m.weekday || '',
                  _destroy: false,
                  comidas_attributes: m.comidas && m.comidas.length > 0
                    ? m.comidas.map((c: any) => ({
                        id: c.id,
                        name: c.name || '',
                        amount: c.amount || (c.amount_meal && c.amount_meal.amount) || '',
                        _destroy: false
                      }))
                    : [{ id: null, name: '', amount: '', _destroy: false }]
                }))
              : [{
                  id: null,
                  meal_type: '',
                  weekday: '',
                  _destroy: false,
                  comidas_attributes: [{ id: null, name: '', amount: '', _destroy: false }]
                }]
          });
  
          setLoading(false);
        })
        .catch((err) => {
          console.error("Erro ao carregar usuário:", err.response?.data || err.message);
          setError('Erro ao carregar dados do usuário');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [id, navigate]);
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        { id: null, serie_amount: '', repeat_amount: '', exercise_name: '', video: '', weekday: '', _destroy: false }
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
          comidas_attributes: [{ id: null, name: '', amount: '', _destroy: false }] 
        }
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
    const apiKey = localStorage.getItem('apiKey');
    if (!apiKey) {
      setError('Chave API não encontrada. Faça login novamente.');
      return;
    }

    const payload = {
      user: {
        name: formData.name,
        email: formData.email,
        ...(formData.password ? { password: formData.password } : {}),
        trainings_attributes: formData.trainings_attributes.filter(t => !t._destroy || t.id),
        meals_attributes: formData.meals_attributes
          .filter(m => !m._destroy || m.id)
          .map(meal => ({
            ...meal,
            comidas_attributes: meal.comidas_attributes.filter(c => !c._destroy || c.id)
          }))
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
    }
  };

  if (loading) {
    return <div className={styles.loading}>Carregando formulário...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>{formData.id ? 'Editar Usuário' : 'Novo Usuário'}</h1>
      <form onSubmit={handleSubmit}>
        {/* Informações Básicas */}
        <div className={styles.section}>
          <h3>Informações Básicas</h3>
          <div className={styles.basicInfo}>
            <div className={styles.inputGroup}>
              <label>Nome do aluno:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nome completo"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Email do aluno:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@exemplo.com"
                required
              />
            </div>
            <div className={`${styles.inputGroup} ${styles.passwordWrapper}`}>
              <label>Senha do aluno:</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Senha"
              />
              <span 
                className={styles.passwordToggleIcon} 
                onClick={togglePasswordVisibility}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </span>
            </div>
          </div>
        </div>
  
        {/* Treinos */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Treinos</h3>
            <button type="button" className={styles.addButton} onClick={addTraining}>
              + Adicionar Treino
            </button>
          </div>
          {formData.trainings_attributes.map((training, index) => (
            !training._destroy && (
              <div className={styles.groupCard} key={training.id || `training-${index}`}>
                <div className={styles.sectionGroup}>
                  <div className={styles.inputGroup}>
                    <label>Dia da Semana</label>
                    <select
                      value={training.weekday}
                      onChange={(e) => handleTrainingChange(index, 'weekday', e.target.value)}
                    >
                      <option value="">Selecione</option>
                      <option value="sunday">Domingo</option>
                      <option value="monday">Segunda-feira</option>
                      <option value="tuesday">Terça-feira</option>
                      <option value="wednesday">Quarta-feira</option>
                      <option value="thursday">Quinta-feira</option>
                      <option value="friday">Sexta-feira</option>
                      <option value="saturday">Sábado</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Exercício</label>
                    <input
                      type="text"
                      value={training.exercise_name}
                      onChange={(e) => handleTrainingChange(index, 'exercise_name', e.target.value)}
                      placeholder="Nome do exercício"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Séries</label>
                    <input
                      type="number"
                      value={training.serie_amount}
                      onChange={(e) => handleTrainingChange(index, 'serie_amount', e.target.value)}
                      placeholder="3"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Repetições</label>
                    <input
                      type="number"
                      value={training.repeat_amount}
                      onChange={(e) => handleTrainingChange(index, 'repeat_amount', e.target.value)}
                      placeholder="12"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Vídeo (opcional)</label>
                    <input
                      type="text"
                      value={training.video}
                      onChange={(e) => handleTrainingChange(index, 'video', e.target.value)}
                      placeholder="URL do vídeo"
                    />
                  </div>
                </div>
                <div className={styles.buttonRow}>
                  <button 
                    type="button" 
                    className={styles.removeButton} 
                    onClick={() => removeTraining(index)}
                  >
                    Remover Treino
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
  
        {/* Dietas */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Dietas</h3>
            <button type="button" className={styles.addButton} onClick={addMeal}>
              + Adicionar Refeição
            </button>
          </div>
          {formData.meals_attributes.map((meal, mealIndex) => (
            !meal._destroy && (
              <div className={styles.groupCard} key={meal.id || `meal-${mealIndex}`}>
                <div className={styles.sectionGroup}>
                  <div className={styles.inputGroup}>
                    <label>Dia da Semana</label>
                    <select
                      value={meal.weekday}
                      onChange={(e) => handleMealChange(mealIndex, 'weekday', e.target.value)}
                    >
                      <option value="">Selecione</option>
                      <option value="sunday">Domingo</option>
                      <option value="monday">Segunda-feira</option>
                      <option value="tuesday">Terça-feira</option>
                      <option value="wednesday">Quarta-feira</option>
                      <option value="thursday">Quinta-feira</option>
                      <option value="friday">Sexta-feira</option>
                      <option value="saturday">Sábado</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Tipo da Refeição</label>
                    <input
                      type="text"
                      value={meal.meal_type}
                      onChange={(e) => handleMealChange(mealIndex, 'meal_type', e.target.value)}
                      placeholder="Café da manhã"
                    />
                  </div>
                </div>
  
                {/* Comidas */}
                <div className={styles.foodSection}>
                  <div className={styles.sectionSubheader}>
                    <h4>Comidas</h4>
                    <button 
                      type="button" 
                      className={styles.addFoodButton} 
                      onClick={() => addComida(mealIndex)}
                    >
                      + Adicionar Comida
                    </button>
                  </div>
                  {meal.comidas_attributes.map((comida, comidaIndex) => (
                    !comida._destroy && (
                      <div className={styles.foodItem} key={comida.id || `comida-${comidaIndex}`}>
                        <div className={styles.inputGroup}>
                          <label>Nome</label>
                          <input
                            type="text"
                            value={comida.name}
                            onChange={(e) => handleComidaChange(mealIndex, comidaIndex, 'name', e.target.value)}
                            placeholder="Alimento"
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Quantidade</label>
                          <input
                            type="text"
                            value={comida.amount}
                            onChange={(e) => handleComidaChange(mealIndex, comidaIndex, 'amount', e.target.value)}
                            placeholder="100g"
                          />
                        </div>
                        <button 
                          type="button" 
                          className={styles.removeFoodButton} 
                          onClick={() => removeComida(mealIndex, comidaIndex)}
                        >
                          ✕
                        </button>
                      </div>
                    )
                  ))}
                </div>
                <div className={styles.buttonRow}>
                  <button 
                    type="button" 
                    className={styles.removeButton} 
                    onClick={() => removeMeal(mealIndex)}
                  >
                    Remover Refeição
                  </button>
                </div>
              </div>
            )
          ))}
        </div> 
        <div className={styles.formActions}>
          <button 
            type="button" 
            className={styles.cancelButton} 
            onClick={() => navigate('/dashboard')}
          >
            Cancelar
          </button>
          <button type="submit" className={styles.submitButton}>
            {formData.id ? 'Atualizar Usuário' : 'Cadastrar Usuário'}
          </button>
        </div>
      </form>
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default UserForm;