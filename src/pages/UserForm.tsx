// src/pages/UserForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
 
interface Comida {
  id?: number;
  name: string;
  amount: string;
  _destroy?: boolean;
}

interface Meal {
  id?: number;
  meal_type: string;
  comidas: Comida[];
  _destroy?: boolean;
}

interface Training {
  id?: number;
  serie_amount: string;
  repeat_amount: string;
  exercise_name: string;
  video: string;
  _destroy?: boolean;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  role: string;
  trainings: Training[];
  meals: Meal[];
}

// Global styles to reset default margins and padding
const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    font-family: 'Montserrat', sans-serif;
  }
`;

// Styled Components
const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(to bottom, #2f3a3b 50%, #8b0000 100%);
  padding: 2rem;
  box-sizing: border-box;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 800px;
  padding: 2rem;
  background-color: #2f3a3b;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  color: #ffffff;
`;

const Logo = styled.div`
  margin-bottom: 1.5rem;
  color: #ffffff;
  font-size: 2rem;
  font-weight: bold;
  text-transform: uppercase;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  text-align: center;

  span {
    color: #ff0000;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #ffffff;
  text-align: center;
`;

const Collapsible = styled(CollapsiblePrimitive.Root)`
  margin-bottom: 1.5rem;
`;

const CollapsibleTrigger = styled(CollapsiblePrimitive.Trigger)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem;
  background-color: #3a4647;
  border-radius: 4px;
  font-size: 1.25rem;
  font-weight: bold;
  color: #ffffff;
  cursor: pointer;

  &:hover {
    background-color: #4a5657;
  }
`;

const CollapsibleContent = styled(CollapsiblePrimitive.Content)`
  padding: 1rem;
  background-color: #2f3a3b;
  border-radius: 4px;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  text-align: left;
`;

const Label = styled.label`
  display: block;
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #ffffff;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #555;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #ffffff;
  color: #000000;
  box-sizing: border-box;

  &::placeholder {
    color: #aaaaaa;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #555;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #ffffff;
  color: #000000;
  box-sizing: border-box;
`;

const Button = styled.button`
  background-color: #8b0000;
  color: #ffffff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin: 0.5rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #a00000;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #ff4040;

  &:hover {
    background-color: #ff6666;
  }
`;

const EntryCard = styled.div`
  background-color: #3a4647;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const NestedEntryCard = styled.div`
  background-color: #2f3a3b;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const ErrorMessage = styled.p`
  color: #ff4040;
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
`;

const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    role: 'regular',
    trainings: [{ serie_amount: '', repeat_amount: '', exercise_name: '', video: '' }],
    meals: [{ meal_type: '', comidas: [{ name: '', amount: '' }] }],
  });
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState({
    user: true,
    trainings: false,
    meals: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (id) {
      const apiKey = localStorage.getItem('apiKey');
      const deviceId = localStorage.getItem('deviceId');
      axios
        .get(`http://localhost:3000/api/v1/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Device-ID': deviceId,
            'Accept': 'application/json',
          },
        })
        .then((response) => {
          const userData = response.data;
          console.log('Dados recebidos da API:', userData);
          const meals = userData.meals.length > 0
            ? userData.meals.map((meal: any) => ({
                ...meal,
                comidas: meal.comidas
                  ? meal.comidas.map((comida: any) => ({
                      ...comida,
                      name: String(comida.name || ''),
                      amount: String(comida.amount || ''),
                    }))
                  : [{ name: '', amount: '' }],
              }))
            : [{ meal_type: '', comidas: [{ name: '', amount: '' }] }];

          console.log('Dados mapeados para meals:', meals);

          setFormData({
            name: userData.name,
            email: userData.email,
            password: '',
            role: userData.role,
            trainings: userData.trainings.length > 0
              ? userData.trainings.map((training: any) => ({
                  ...training,
                  serie_amount: String(training.serie_amount || ''),
                  repeat_amount: String(training.repeat_amount || ''),
                  exercise_name: String(training.exercise_name || ''),
                  video: String(training.video || ''),
                }))
              : [{ serie_amount: '', repeat_amount: '', exercise_name: '', video: '' }],
            meals,
          });
        })
        .catch((err) => {
          setError(err.response?.data?.error || 'Erro ao carregar usuário');
          if (err.response?.status === 401 || err.response?.status === 403) {
            navigate('/login');
          }
        });
    }
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, section: string, index: number, subSection?: string, subIndex?: number) => {
    setFormData((prev) => {
      if (section === 'trainings') {
        const updatedTrainings = [...prev.trainings];
        updatedTrainings[index] = { ...updatedTrainings[index], [e.target.name]: e.target.value };
        return { ...prev, trainings: updatedTrainings };
      } else if (section === 'meals' && subSection === 'comidas') {
        const updatedMeals = [...prev.meals];
        const updatedComidas = [...updatedMeals[index].comidas];
        updatedComidas[subIndex!] = { ...updatedComidas[subIndex!], [e.target.name]: e.target.value };
        updatedMeals[index] = { ...updatedMeals[index], comidas: updatedComidas };
        return { ...prev, meals: updatedMeals };
      } else if (section === 'meals') {
        const updatedMeals = [...prev.meals];
        updatedMeals[index] = { ...updatedMeals[index], [e.target.name]: e.target.value };
        return { ...prev, meals: updatedMeals };
      }
      return { ...prev, [e.target.name]: e.target.value };
    });
  };

  const addTraining = () => {
    setFormData((prev) => ({
      ...prev,
      trainings: [...prev.trainings, { serie_amount: '', repeat_amount: '', exercise_name: '', video: '' }],
    }));
  };

  const removeTraining = (index: number) => {
    setFormData((prev) => {
      const updatedTrainings = [...prev.trainings];
      if (updatedTrainings[index].id) {
        updatedTrainings[index] = { ...updatedTrainings[index], _destroy: true };
      } else {
        updatedTrainings.splice(index, 1);
      }
      return { ...prev, trainings: updatedTrainings };
    });
  };

  const addMeal = () => {
    setFormData((prev) => ({
      ...prev,
      meals: [...prev.meals, { meal_type: '', comidas: [{ name: '', amount: '' }] }],
    }));
  };

  const removeMeal = (index: number) => {
    setFormData((prev) => {
      const updatedMeals = [...prev.meals];
      if (updatedMeals[index].id) {
        updatedMeals[index] = { ...updatedMeals[index], _destroy: true };
      } else {
        updatedMeals.splice(index, 1);
      }
      return { ...prev, meals: updatedMeals };
    });
  };

  const addComida = (mealIndex: number) => {
    setFormData((prev) => {
      const updatedMeals = [...prev.meals];
      updatedMeals[mealIndex] = {
        ...updatedMeals[mealIndex],
        comidas: [...updatedMeals[mealIndex].comidas, { name: '', amount: '' }],
      };
      return { ...prev, meals: updatedMeals };
    });
  };

  const removeComida = (mealIndex: number, comidaIndex: number) => {
    setFormData((prev) => {
      const updatedMeals = [...prev.meals];
      const updatedComidas = [...updatedMeals[mealIndex].comidas];
      if (updatedComidas[comidaIndex].id) {
        updatedComidas[comidaIndex] = { ...updatedComidas[comidaIndex], _destroy: true };
      } else {
        updatedComidas.splice(comidaIndex, 1);
      }
      updatedMeals[mealIndex] = { ...updatedMeals[mealIndex], comidas: updatedComidas };
      return { ...prev, meals: updatedMeals };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const apiKey = localStorage.getItem('apiKey');
    const deviceId = localStorage.getItem('deviceId');
    const userRole = localStorage.getItem('userRole');

    if (!apiKey || !deviceId || userRole !== 'master') {
      navigate('/login');
      return;
    }

    const mealsAttributes = formData.meals.map((meal) => {
      const { comidas, ...mealWithoutComidas } = meal;
      return {
        ...mealWithoutComidas,
        comidas_attributes: meal.comidas,
      };
    });

    const payload = {
      user: {
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined,
        role: formData.role,
        trainings_attributes: formData.trainings,
        meals_attributes: mealsAttributes,
      },
    };

    try {
      if (id) {
        await axios.put(`http://localhost:3000/api/v1/users/${id}`, payload, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Device-ID': deviceId,
            'Content-Type': 'application/json',
          },
        });
      } else {
        await axios.post('http://localhost:3000/api/v1/users', payload, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Device-ID': deviceId,
            'Content-Type': 'application/json',
          },
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.errors?.join(', ') || 'Erro ao salvar usuário');
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    const apiKey = localStorage.getItem('apiKey');
    const deviceId = localStorage.getItem('deviceId');
    const userRole = localStorage.getItem('userRole');

    if (!apiKey || !deviceId || userRole !== 'master') {
      navigate('/login');
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/api/v1/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Device-ID': deviceId,
        },
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao excluir usuário');
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <FormContainer>
          <Logo>
            Renato <span>Frutuoso</span>
            <div style={{ fontSize: '0.8rem', fontWeight: 'normal', marginTop: '0.5rem' }}>
              Consultoria Esportiva Online
            </div>
          </Logo>
          <Title>{id ? 'Editar Usuário' : 'Novo Usuário'}</Title>
          <form onSubmit={handleSubmit}>
            {/* User Information Section */}
            <Collapsible open={openSections.user} onOpenChange={() => toggleSection('user')}>
              <CollapsibleTrigger>
                <span>Dados do Usuário</span>
                {openSections.user ? <ChevronUp /> : <ChevronDown />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                <FormGroup>
                  <Label>Nome</Label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Nome"
                    value={formData.name}
                    onChange={(e) => handleChange(e, 'user', 0)}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => handleChange(e, 'user', 0)}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Senha</Label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Senha"
                    value={formData.password}
                    onChange={(e) => handleChange(e, 'user', 0)}
                    required={!id}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Função</Label>
                  <Select name="role" value={formData.role} onChange={(e) => handleChange(e, 'user', 0)}>
                    <option value="master">Master</option>
                    <option value="regular">Regular</option>
                  </Select>
                </FormGroup>
              </CollapsibleContent>
            </Collapsible>

            {/* Trainings Section */}
            <Collapsible open={openSections.trainings} onOpenChange={() => toggleSection('trainings')}>
              <CollapsibleTrigger>
                <span>Treinos do Usuário</span>
                {openSections.trainings ? <ChevronUp /> : <ChevronDown />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                {formData.trainings.map((training: Training, index: number) => (
                  !training._destroy && (
                    <EntryCard key={index}>
                      <FormGroup>
                        <Label>Nome do Exercício</Label>
                        <Input
                          type="text"
                          name="exercise_name"
                          placeholder="Nome do Exercício"
                          value={training.exercise_name}
                          onChange={(e) => handleChange(e, 'trainings', index)}
                          required
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Quantidade de Séries</Label>
                        <Input
                          type="number"
                          name="serie_amount"
                          placeholder="Quantidade de Séries"
                          value={training.serie_amount}
                          onChange={(e) => handleChange(e, 'trainings', index)}
                          required
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>Quantidade de Repetições</Label>
                        <Input
                          type="number"
                          name="repeat_amount"
                          placeholder="Quantidade de Repetições"
                          value={training.repeat_amount}
                          onChange={(e) => handleChange(e, 'trainings', index)}
                          required
                        />
                      </FormGroup>
                      <FormGroup>
                        <Label>URL do Vídeo (opcional)</Label>
                        <Input
                          type="text"
                          name="video"
                          placeholder="URL do Vídeo (opcional)"
                          value={training.video}
                          onChange={(e) => handleChange(e, 'trainings', index)}
                        />
                      </FormGroup>
                      <Button type="button" onClick={() => removeTraining(index)}>
                        Remover Treino
                      </Button>
                    </EntryCard>
                  )
                ))}
                <Button type="button" onClick={addTraining}>
                  Adicionar Treino
                </Button>
              </CollapsibleContent>
            </Collapsible>

            {/* Meals Section */}
            <Collapsible open={openSections.meals} onOpenChange={() => toggleSection('meals')}>
              <CollapsibleTrigger>
                <span>Dieta do Usuário</span>
                {openSections.meals ? <ChevronUp /> : <ChevronDown />}
              </CollapsibleTrigger>
              <CollapsibleContent>
                {formData.meals.map((meal: Meal, mealIndex: number) => (
                  !meal._destroy && (
                    <EntryCard key={mealIndex}>
                      <FormGroup>
                        <Label>Tipo de Refeição</Label>
                        <Input
                          type="text"
                          name="meal_type"
                          placeholder="Tipo de Refeição (ex.: Café da Manhã)"
                          value={meal.meal_type}
                          onChange={(e) => handleChange(e, 'meals', mealIndex)}
                          required
                        />
                      </FormGroup>
                      {meal.comidas && meal.comidas.length > 0 ? (
                        meal.comidas.map((comida: Comida, comidaIndex: number) => (
                          !comida._destroy && (
                            <NestedEntryCard key={comidaIndex}>
                              <FormGroup>
                                <Label>Nome da Comida</Label>
                                <Input
                                  type="text"
                                  name="name"
                                  placeholder="Nome da Comida"
                                  value={comida.name ?? ''}
                                  onChange={(e) => handleChange(e, 'meals', mealIndex, 'comidas', comidaIndex)}
                                  required
                                />
                              </FormGroup>
                              <FormGroup>
                                <Label>Quantidade</Label>
                                <Input
                                  type="text"
                                  name="amount"
                                  placeholder="Quantidade (ex.: 100g)"
                                  value={comida.amount ?? ''}
                                  onChange={(e) => handleChange(e, 'meals', mealIndex, 'comidas', comidaIndex)}
                                  required
                                />
                              </FormGroup>
                              <Button type="button" onClick={() => removeComida(mealIndex, comidaIndex)}>
                                Remover Comida
                              </Button>
                            </NestedEntryCard>
                          )
                        ))
                      ) : (
                        <p>Nenhuma comida cadastrada.</p>
                      )}
                      <Button type="button" onClick={() => addComida(mealIndex)}>
                        Adicionar Comida
                      </Button>
                      <Button type="button" onClick={() => removeMeal(mealIndex)}>
                        Remover Refeição
                      </Button>
                    </EntryCard>
                  )
                ))}
                <Button type="button" onClick={addMeal}>
                  Adicionar Refeição
                </Button>
              </CollapsibleContent>
            </Collapsible>

            {/* Form Submission Buttons */}
            <ButtonGroup>
              <Button type="submit">{id ? 'Atualizar' : 'Criar'}</Button>
              {id && (
                <DeleteButton type="button" onClick={handleDelete}>
                  Excluir
                </DeleteButton>
              )}
              <Button type="button" onClick={() => navigate('/dashboard')}>
                Cancelar
              </Button>
            </ButtonGroup>
          </form>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </FormContainer>
      </PageContainer>
    </>
  );
};

export default UserForm;