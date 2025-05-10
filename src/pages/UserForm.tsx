import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

const FormContainer = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: linear-gradient(145deg, #1e2a2b, #2f3a3b);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  color: #ffffff;
  font-family: 'Segoe UI', 'Roboto', sans-serif;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  letter-spacing: 1.5px;
  color: #e0e0e0;
  position: relative;
  padding-bottom: 12px;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, #8b0000, #a00000);
    border-radius: 2px;
  }
`;

const Form = styled.form`
  padding: 2rem;
  border-radius: 12px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 1rem;
  background-color: #1c2526;
  border: 1px solid #4a5859;
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #8b0000;
    box-shadow: 0 0 0 2px rgba(139, 0, 0, 0.2);
  }

  &::placeholder {
    color: #b0b0b0;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 1rem;
  background-color: #1c2526;
  border: 1px solid #4a5859;
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #8b0000;
    box-shadow: 0 0 0 2px rgba(139, 0, 0, 0.2);
  }

  &::placeholder {
    color: #b0b0b0;
  }
`;

const Button = styled.button`
  width: 100%;
  background: linear-gradient(145deg, #8b0000, #a00000);
  color: #ffffff;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(139, 0, 0, 0.2);

  &:hover {
    background: linear-gradient(145deg, #a00000, #b00000);
    transform: translateY(-1px);
    box-shadow: 0 5px 12px rgba(139, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(139, 0, 0, 0.2);
  }
`;

const SecondaryButton = styled(Button)`
  background: linear-gradient(145deg, #2f3a3b, #3a4647);
  color: #ffffff;

  &:hover {
    background: linear-gradient(145deg, #3a4647, #4a5859);
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.3);
  }
`;

const DangerButton = styled(Button)`
  background: linear-gradient(145deg, #ff4040, #e63939);

  &:hover {
    background: linear-gradient(145deg, #e63939, #cc3333);
    box-shadow: 0 5px 12px rgba(255, 64, 64, 0.3);
  }
`;

const AddButton = styled(Button)`
  background: linear-gradient(145deg, #8b0000, #a00000);
  opacity: 0.9;
  margin-top: 8px;

  &:hover {
    opacity: 1;
    background: linear-gradient(145deg, #a00000, #b00000);
  }
`;

const RemoveButton = styled.button`
  background: linear-gradient(145deg, #ff4040, #e63939);
  color: #ffffff;
  padding: 6px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 8px;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: linear-gradient(145deg, #e63939, #cc3333);
    transform: translateY(-1px);
    box-shadow: 0 3px 8px rgba(255, 64, 64, 0.3);
  }

  &:before {
    content: '×';
    margin-right: 4px;
    font-size: 1rem;
    line-height: 0;
  }
`;

const SectionTitle = styled.h3`
  color: #ffffff;
  margin: 1.5rem 0 1rem 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #4a5859;
  font-size: 1.2rem;
  font-weight: 600;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(145deg, #8b0000, #a00000);
  }
`;

const ItemContainer = styled.div`
  background: linear-gradient(145deg, #2f3a3b, #3a4647);
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const SubItemContainer = styled.div`
  background: #1c2526;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  border-left: 4px solid #8b0000;

  &:hover {
    box-shadow: 0 0 0 1px #4a5859;
  }
`;

const ErrorMessage = styled.p`
  color: #ff4040;
  background: #2f3a3b;
  padding: 12px;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.9rem;
  border-left: 4px solid #ff4040;
  text-align: center;
`;

const LoadingIndicator = styled.div`
  color: #ffffff;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;

  &:before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-right: 10px;
    border: 3px solid #ffffff;
    border-radius: 50%;
    border-top-color: #8b0000;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const InputGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;

  & > ${Input}, & > ${Textarea} {
    flex: 1 1 calc(50% - 6px);
    min-width: 150px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;

    & > ${Input}, & > ${Textarea} {
      flex: 1 1 100%;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
  justify-content: flex-end;

  & > button {
    flex: 1 1 calc(50% - 6px);
    min-width: 120px;
    margin-bottom: 0;
  }

  & > button:only-child {
    flex: 0 1 auto;
    width: auto;
    min-width: 120px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;

    & > button {
      flex: 1 1 100%;
    }

    & > button:only-child {
      flex: 1 1 100%;
      width: 100%;
    }
  }
`;

const ActionButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
  justify-content: flex-end;

  & > button {
    flex: 1 1 calc(50% - 6px);
    min-width: 100px;
  }

  & > button:only-child {
    flex: 0 1 auto;
    width: auto;
    min-width: 100px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;

    & > button {
      flex: 1 1 100%;
    }

    & > button:only-child {
      flex: 1 1 100%;
      width: 100%;
    }
  }
`;
const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 1rem;
  background-color: #1c2526;
  border: 1px solid #4a5859;
  border-radius: 6px;
  color: #ffffff;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #8b0000;
    box-shadow: 0 0 0 2px rgba(139, 0, 0, 0.2);
  }
`;

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
          console.error("Erro ao carregar usuário:", err);
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

    console.log("Sending payload:", payload);

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
    return <LoadingIndicator>Carregando formulário...</LoadingIndicator>;
  }

  return (
    <FormContainer>
      <Title>{formData.id ? 'Editar Usuário' : 'Novo Usuário'}</Title>
      <Form onSubmit={handleSubmit}>
        <SectionTitle>Informações Básicas</SectionTitle>
        <InputGroup>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nome do Usuário"
            required
          />
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email do Usuário"
            required
          />
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Senha (deixe em branco para não alterar)"
          />
        </InputGroup>

        <SectionTitle>Treinos</SectionTitle>
        {formData.trainings_attributes.map((training, index) => (
          !training._destroy && (
            <ItemContainer key={training.id || `new-training-${index}`}>
              <InputGroup>
              <Select
                value={training.weekday ?? ''}
                onChange={(e) => handleTrainingChange(index, 'weekday', e.target.value)}
              >
                <option value="">Dia da Semana</option>
                <option value="sunday">Domingo</option>
                <option value="monday">Segunda-feira</option>
                <option value="tuesday">Terça-feira</option>
                <option value="wednesday">Quarta-feira</option>
                <option value="thursday">Quinta-feira</option>
                <option value="friday">Sexta-feira</option>
                <option value="saturday">Sábado</option>
              </Select> 

                <Input
                  type="number"
                  value={training.serie_amount}
                  onChange={(e) => handleTrainingChange(index, 'serie_amount', e.target.value)}
                  placeholder="Quantidade de Séries"
                />
                <Input
                  type="number"
                  value={training.repeat_amount}
                  onChange={(e) => handleTrainingChange(index, 'repeat_amount', e.target.value)}
                  placeholder="Quantidade de Repetições"
                />
                <Input
                  type="text"
                  value={training.exercise_name}
                  onChange={(e) => handleTrainingChange(index, 'exercise_name', e.target.value)}
                  placeholder="Nome do Exercício"
                />
                <Input
                  type="text"
                  value={training.video}
                  onChange={(e) => handleTrainingChange(index, 'video', e.target.value)}
                  placeholder="Link do Vídeo (opcional)"
                />
              </InputGroup>
              <ActionButtonGroup>
                <RemoveButton type="button" onClick={() => removeTraining(index)}>
                  Remover Treino
                </RemoveButton>
              </ActionButtonGroup>
            </ItemContainer>
          )
        ))}
        <ActionButtonGroup>
          <AddButton type="button" onClick={addTraining}>
            Adicionar Treino
          </AddButton>
        </ActionButtonGroup>

        <SectionTitle>Dietas</SectionTitle>
        {formData.meals_attributes.map((meal, mealIndex) => (
          !meal._destroy && (
            <ItemContainer key={meal.id || `new-meal-${mealIndex}`}>
              <InputGroup>
              <Select
                value={meal.weekday ?? ''}
                onChange={(e) => handleMealChange(mealIndex, 'weekday', e.target.value)}
              >
                <option value="">Dia da Semana</option>
                <option value="sunday">Domingo</option>
                <option value="monday">Segunda-feira</option>
                <option value="tuesday">Terça-feira</option>
                <option value="wednesday">Quarta-feira</option>
                <option value="thursday">Quinta-feira</option>
                <option value="friday">Sexta-feira</option>
                <option value="saturday">Sábado</option>
              </Select> 
                <Input
                  type="text"
                  value={meal.meal_type}
                  onChange={(e) => handleMealChange(mealIndex, 'meal_type', e.target.value)}
                  placeholder="Tipo de Refeição (ex.: Café da Manhã)"
                />
              </InputGroup>
              
              <SectionTitle>Comidas</SectionTitle>
              {meal.comidas_attributes.map((comida, comidaIndex) => (
                !comida._destroy && (
                  <SubItemContainer key={comida.id || `new-comida-${comidaIndex}`}>
                    <InputGroup>
                      <Input
                        type="text"
                        value={comida.name}
                        onChange={(e) => handleComidaChange(mealIndex, comidaIndex, 'name', e.target.value)}
                        placeholder="Nome da Comida"
                      />
                      <Input
                        type="text"
                        value={comida.amount}
                        onChange={(e) => handleComidaChange(mealIndex, comidaIndex, 'amount', e.target.value)}
                        placeholder="Quantidade (ex.: 100g, 2 unidades)"
                      />
                    </InputGroup>
                    <ActionButtonGroup>
                      <RemoveButton 
                        type="button" 
                        onClick={() => removeComida(mealIndex, comidaIndex)}
                      >
                        Remover Comida
                      </RemoveButton>
                    </ActionButtonGroup>
                  </SubItemContainer>
                )
              ))}
              <ActionButtonGroup>
                <AddButton 
                  type="button" 
                  onClick={() => addComida(mealIndex)}
                >
                  Adicionar Comida
                </AddButton>
                <RemoveButton 
                  type="button" 
                  onClick={() => removeMeal(mealIndex)}
                >
                  Remover Refeição
                </RemoveButton>
              </ActionButtonGroup>
            </ItemContainer>
          )
        ))}
        <ActionButtonGroup>
          <AddButton type="button" onClick={addMeal}>
            Adicionar Refeição
          </AddButton>
        </ActionButtonGroup>

        <ButtonGroup>
          <Button type="submit">
            {formData.id ? 'Atualizar Usuário' : 'Cadastrar Usuário'}
          </Button>
          <SecondaryButton 
            type="button" 
            onClick={() => navigate('/dashboard')}
          >
            Cancelar
          </SecondaryButton>
        </ButtonGroup>
      </Form>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FormContainer>
  );
};

export default UserForm;