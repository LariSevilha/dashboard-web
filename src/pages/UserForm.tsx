import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

// Cores do tema
const theme = {
  primary: '#3a7bd5',
  primaryHover: '#2d62b0',
  secondary: '#00d4ff',
  dark: '#1a2a36',
  darker: '#111a22',
  light: '#f5f7fa',
  gray: '#8a97a8',
  lightGray: '#e0e6ed',
  danger: '#e74c3c',
  dangerHover: '#c0392b',
  success: '#2ecc71',
  warning: '#f39c12',
  cardBg: '#1e2f3f',
  inputBg: '#162330',
  border: '#2c3e50',
};

const FormContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: left;
  color: ${theme.light};
  font-family: 'Segoe UI', 'Roboto', sans-serif;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: ${theme.light};
  position: relative;
  padding-bottom: 12px;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, ${theme.primary}, ${theme.secondary});
    border-radius: 2px;
  }
`;

const Form = styled.form`
  background-color: ${theme.cardBg};
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 1.2rem;
  background-color: ${theme.inputBg};
  border: 1px solid ${theme.border};
  border-radius: 8px;
  color: ${theme.light};
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 2px rgba(58, 123, 213, 0.2);
  }

  &::placeholder {
    color: ${theme.gray};
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 1.2rem;
  background-color: ${theme.inputBg};
  border: 1px solid ${theme.border};
  border-radius: 8px;
  color: ${theme.light};
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    box-shadow: 0 0 0 2px rgba(58, 123, 213, 0.2);
  }

  &::placeholder {
    color: ${theme.gray};
  }
`;

const Button = styled.button`
  width: 100%;
  background: linear-gradient(90deg, ${theme.primary}, ${theme.secondary});
  color: #ffffff;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

  &:hover {
    background: linear-gradient(90deg, ${theme.primaryHover}, ${theme.secondary});
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
`;

const SecondaryButton = styled(Button)`
  background: ${theme.dark};
  border: 1px solid ${theme.gray};
  color: ${theme.light};
  
  &:hover {
    background: ${theme.darker};
    border-color: ${theme.lightGray};
  }
`;

const DangerButton = styled(Button)`
  background: ${theme.danger};
  
  &:hover {
    background: ${theme.dangerHover};
  }
`;

const AddButton = styled(Button)`
  background: linear-gradient(90deg, ${theme.primary}, ${theme.secondary});
  opacity: 0.9;
  margin-top: 10px;
  
  &:hover {
    opacity: 1;
    background: linear-gradient(90deg, ${theme.primary}, ${theme.secondary});
  }
`;

const RemoveButton = styled.button`
  background-color: ${theme.danger};
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${theme.dangerHover};
    transform: translateY(-1px);
  }

  &:before {
    content: '×';
    margin-right: 5px;
    font-size: 1.2rem;
    line-height: 0;
  }
`;

const SectionTitle = styled.h3`
  color: ${theme.light};
  margin: 1.5rem 0 1rem 0;
  padding-bottom: 8px;
  border-bottom: 2px solid ${theme.border};
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
    background: linear-gradient(90deg, ${theme.primary}, ${theme.secondary});
  }
`;

const ItemContainer = styled.div`
  background-color: ${theme.dark};
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const SubItemContainer = styled.div`
  background-color: ${theme.darker};
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.03);
  
  &:hover {
    box-shadow: 0 0 0 1px ${theme.border};
  }
`;

const ErrorMessage = styled.p`
  color: ${theme.danger};
  background-color: rgba(231, 76, 60, 0.1);
  padding: 12px;
  border-radius: 6px;
  margin-top: 1rem;
  font-size: 0.9rem;
  border-left: 4px solid ${theme.danger};
`;

const LoadingIndicator = styled.div`
  color: ${theme.light};
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
    border: 3px solid ${theme.light};
    border-radius: 50%;
    border-top-color: ${theme.primary};
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
  gap: 12px;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  
  & > button {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const UserForm: React.FC = () => {
  const [formData, setFormData] = useState({
    id: null as number | null,
    name: '',
    email: '',
    password: '',
    trainings_attributes: [{ id: null as number | null, serie_amount: '', repeat_amount: '', exercise_name: '', video: '', _destroy: false }],
    meals_attributes: [{ 
      id: null as number | null, 
      meal_type: '', 
      _destroy: false,
      comidas_attributes: [{ id: null as number | null, name: '', amount: '', _destroy: false }] 
    }],
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

    if (id) {
      setLoading(true);
      axios
        .get(`http://localhost:3000/api/v1/users/${id}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        .then((response) => {
          console.log("User data loaded:", response.data);
          const user = response.data;
          
          // Map the API data to our form structure
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
                  _destroy: false
                }))
              : [{ id: null, serie_amount: '', repeat_amount: '', exercise_name: '', video: '', _destroy: false }],
            
            meals_attributes: user.meals && user.meals.length > 0
              ? user.meals.map((m: any) => ({
                  id: m.id,
                  meal_type: m.meal_type || '',
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
                  _destroy: false,
                  comidas_attributes: [{ id: null, name: '', amount: '', _destroy: false }] 
                }]
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error loading user:", err);
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
        { id: null, serie_amount: '', repeat_amount: '', exercise_name: '', video: '', _destroy: false }
      ],
    });
  };

  const removeTraining = (index: number) => {
    const newTrainings = [...formData.trainings_attributes];
    
    // If it has an ID, mark for destruction instead of removing
    if (newTrainings[index].id) {
      newTrainings[index] = { ...newTrainings[index], _destroy: true };
      setFormData({ ...formData, trainings_attributes: newTrainings });
    } else {
      // Otherwise remove it from the array
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
          _destroy: false,
          comidas_attributes: [{ id: null, name: '', amount: '', _destroy: false }] 
        }
      ],
    });
  };

  const removeMeal = (index: number) => {
    const newMeals = [...formData.meals_attributes];
    
    // If it has an ID, mark for destruction instead of removing
    if (newMeals[index].id) {
      newMeals[index] = { ...newMeals[index], _destroy: true };
      setFormData({ ...formData, meals_attributes: newMeals });
    } else {
      // Otherwise remove it from the array
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
    
    // If it has an ID, mark for destruction instead of removing
    if (comida.id) {
      newMeals[mealIndex].comidas_attributes[comidaIndex] = { ...comida, _destroy: true };
    } else {
      // Otherwise remove it from the array
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

    // Prepare payload - make sure to format it properly for the API
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

        <SectionTitle>Treinos</SectionTitle>
        {formData.trainings_attributes.map((training, index) => (
          !training._destroy && (
            <ItemContainer key={training.id || `new-training-${index}`}>
              <InputGroup>
                <Input
                  type="number"
                  value={training.serie_amount}
                  onChange={(e) => handleTrainingChange(index, 'serie_amount', e.target.value)}
                  placeholder={`Quantidade de Séries`}
                />
                <Input
                  type="number"
                  value={training.repeat_amount}
                  onChange={(e) => handleTrainingChange(index, 'repeat_amount', e.target.value)}
                  placeholder={`Quantidade de Repetições`}
                />
              </InputGroup>
              <Input
                type="text"
                value={training.exercise_name}
                onChange={(e) => handleTrainingChange(index, 'exercise_name', e.target.value)}
                placeholder={`Nome do Exercício`}
              />
              <Input
                type="text"
                value={training.video}
                onChange={(e) => handleTrainingChange(index, 'video', e.target.value)}
                placeholder={`Link do Vídeo (opcional)`}
              />
              <RemoveButton type="button" onClick={() => removeTraining(index)}>
                Remover Treino
              </RemoveButton>
            </ItemContainer>
          )
        ))}
        <AddButton type="button" onClick={addTraining}>
          Adicionar Treino
        </AddButton>

        <SectionTitle>Dietas</SectionTitle>
        {formData.meals_attributes.map((meal, mealIndex) => (
          !meal._destroy && (
            <ItemContainer key={meal.id || `new-meal-${mealIndex}`}>
              <Input
                type="text"
                value={meal.meal_type}
                onChange={(e) => handleMealChange(mealIndex, 'meal_type', e.target.value)}
                placeholder={`Tipo de Refeição (ex.: Café da Manhã)`}
              />
              
              <SectionTitle>Comidas</SectionTitle>
              {meal.comidas_attributes.map((comida, comidaIndex) => (
                !comida._destroy && (
                  <SubItemContainer key={comida.id || `new-comida-${comidaIndex}`}>
                    <InputGroup>
                      <Input
                        type="text"
                        value={comida.name}
                        onChange={(e) => handleComidaChange(mealIndex, comidaIndex, 'name', e.target.value)}
                        placeholder={`Nome da Comida`}
                      />
                      <Input
                        type="text"
                        value={comida.amount}
                        onChange={(e) => handleComidaChange(mealIndex, comidaIndex, 'amount', e.target.value)}
                        placeholder={`Quantidade (ex.: 100g, 2 unidades)`}
                      />
                    </InputGroup>
                    <RemoveButton 
                      type="button" 
                      onClick={() => removeComida(mealIndex, comidaIndex)}
                    >
                      Remover Comida
                    </RemoveButton>
                  </SubItemContainer>
                )
              ))}
              <AddButton 
                type="button" 
                onClick={() => addComida(mealIndex)}
                style={{ background: theme.success }}
              >
                Adicionar Comida
              </AddButton>
              <RemoveButton 
                type="button" 
                onClick={() => removeMeal(mealIndex)}
                style={{ marginTop: "15px" }}
              >
                Remover Refeição
              </RemoveButton>
            </ItemContainer>
          )
        ))}
        <AddButton type="button" onClick={addMeal}>
          Adicionar Refeição
        </AddButton>

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