// src/pages/UserForm.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

const FormContainer = styled.div`
  width: 100%;
  max-width: 600px;
  text-align: center;
  color: #ffffff;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  background-color: #2f3a3b;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #1c2526;
  border: 1px solid #1c2526;
  border-radius: 8px;
  color: #b0b0b0;
  font-size: 1rem;

  &::placeholder {
    color: #b0b0b0;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #1c2526;
  border: 1px solid #1c2526;
  border-radius: 8px;
  color: #b0b0b0;
  font-size: 1rem;
  resize: vertical;

  &::placeholder {
    color: #b0b0b0;
  }
`;

const Button = styled.button`
  width: 100%;
  background-color: #8b0000;
  color: #ffffff;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #a00000;
  }
`;

const SubTitle = styled.h3`
  color: #b0b0b0;
  margin: 0.5rem 0;
`;

const ErrorMessage = styled.p`
  color: #ff4040;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const UserForm: React.FC = () => {
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    trainings: [{ serie_amount: '', repeat_amount: '', exercise_name: '', video: '' }],
    meals: [{ meal_type: '', comidas: [{ name: '', amount: '' }] }],
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (id) {
      const apiKey = localStorage.getItem('apiKey');
      if (!apiKey) {
        navigate('/login');
        return;
      }

      axios
        .get(`http://localhost:3000/api/v1/users`, {
          headers: { 'X-API-Key': apiKey },
        })
        .then((response) => {
          const user = response.data.find((u: any) => u.id === parseInt(id!));
          if (user) {
            setFormData({
              id: user.id,
              name: user.name,
              email: user.email,
              password: '',
              trainings: user.trainings.map((t: any) => ({
                serie_amount: t.serie.amount,
                repeat_amount: t.repeat.amount,
                exercise_name: t.exercise.name,
                video: t.exercise.video,
              })),
              meals: user.meals.map((m: any) => ({
                meal_type: m.meal_type,
                comidas: m.comidas.map((c: any) => ({
                  name: c.name,
                  amount: c.amount_meal?.amount || '',
                })),
              })),
            });
          }
        })
        .catch(() => setError('Erro ao carregar dados do usuário'));
    }
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTrainingChange = (index: number, field: string, value: string) => {
    const newTrainings = [...formData.trainings];
    newTrainings[index] = { ...newTrainings[index], [field]: value };
    setFormData({ ...formData, trainings: newTrainings });
  };

  const handleMealChange = (index: number, field: string, value: string) => {
    const newMeals = [...formData.meals];
    newMeals[index] = { ...newMeals[index], [field]: value };
    setFormData({ ...formData, meals: newMeals });
  };

  const handleComidaChange = (mealIndex: number, comidaIndex: number, field: string, value: string) => {
    const newMeals = [...formData.meals];
    const newComidas = [...newMeals[mealIndex].comidas];
    newComidas[comidaIndex] = { ...newComidas[comidaIndex], [field]: value };
    newMeals[mealIndex].comidas = newComidas;
    setFormData({ ...formData, meals: newMeals });
  };

  const addTraining = () => {
    setFormData({
      ...formData,
      trainings: [...formData.trainings, { serie_amount: '', repeat_amount: '', exercise_name: '', video: '' }],
    });
  };

  const addMeal = () => {
    setFormData({
      ...formData,
      meals: [...formData.meals, { meal_type: '', comidas: [{ name: '', amount: '' }] }],
    });
  };

  const addComida = (mealIndex: number) => {
    const newMeals = [...formData.meals];
    newMeals[mealIndex].comidas.push({ name: '', amount: '' });
    setFormData({ ...formData, meals: newMeals });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const apiKey = localStorage.getItem('apiKey');
    console.log('API Key usada:', apiKey);
    if (!apiKey) {
      setError('Chave API não encontrada. Faça login novamente.');
      return;
    }

    const payload = {
      user: {
        name: formData.name,
        email: formData.email,
        password: formData.password || undefined,
        trainings: formData.trainings,
        meals: formData.meals,
      },
    };

    console.log('Payload enviado:', payload);

    try {
      if (formData.id) {
        await axios.put(`http://localhost:3000/api/v1/users/${formData.id}`, payload, {
          headers: { 'X-API-Key': apiKey },
        });
      } else {
        await axios.post('http://localhost:3000/api/v1/users', payload, {
          headers: { 'X-API-Key': apiKey },
        });
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

  return (
    <FormContainer>
      <Title>{formData.id ? 'Editar Usuário' : 'Adicionar Usuário'}</Title>
      <Form onSubmit={handleSubmit}>
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

        <SubTitle>Treinos</SubTitle>
        {formData.trainings.map((training, index) => (
          <div key={index}>
            <Input
              type="number"
              value={training.serie_amount}
              onChange={(e) => handleTrainingChange(index, 'serie_amount', e.target.value)}
              placeholder={`Quantidade de Séries ${index + 1}`}
            />
            <Input
              type="number"
              value={training.repeat_amount}
              onChange={(e) => handleTrainingChange(index, 'repeat_amount', e.target.value)}
              placeholder={`Quantidade de Repetições ${index + 1}`}
            />
            <Input
              type="text"
              value={training.exercise_name}
              onChange={(e) => handleTrainingChange(index, 'exercise_name', e.target.value)}
              placeholder={`Nome do Exercício ${index + 1}`}
            />
            <Input
              type="text"
              value={training.video}
              onChange={(e) => handleTrainingChange(index, 'video', e.target.value)}
              placeholder={`Link do Vídeo ${index + 1}`}
            />
          </div>
        ))}
        <Button type="button" onClick={addTraining}>
          Adicionar Treino
        </Button>

        <SubTitle>Dietas</SubTitle>
        {formData.meals.map((meal, mealIndex) => (
          <div key={mealIndex}>
            <Input
              type="text"
              value={meal.meal_type}
              onChange={(e) => handleMealChange(mealIndex, 'meal_type', e.target.value)}
              placeholder={`Tipo de Refeição ${mealIndex + 1} (ex.: Café da Manhã)`}
            />
            <SubTitle>Comidas</SubTitle>
            {meal.comidas.map((comida, comidaIndex) => (
              <div key={comidaIndex}>
                <Input
                  type="text"
                  value={comida.name}
                  onChange={(e) => handleComidaChange(mealIndex, comidaIndex, 'name', e.target.value)}
                  placeholder={`Nome da Comida ${comidaIndex + 1}`}
                />
                <Input
                  type="text"
                  value={comida.amount}
                  onChange={(e) => handleComidaChange(mealIndex, comidaIndex, 'amount', e.target.value)}
                  placeholder={`Quantidade ${comidaIndex + 1}`}
                />
              </div>
            ))}
            <Button type="button" onClick={() => addComida(mealIndex)}>
              Adicionar Comida
            </Button>
          </div>
        ))}
        <Button type="button" onClick={addMeal}>
          Adicionar Refeição
        </Button>

        <Button type="submit">{formData.id ? 'Atualizar' : 'Cadastrar'}</Button>
        <Button type="button" onClick={() => navigate('/dashboard')}>
          Cancelar
        </Button>
      </Form>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </FormContainer>
  );
};

export default UserForm;