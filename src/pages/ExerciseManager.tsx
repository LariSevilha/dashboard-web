import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/exerciseManager.module.css';

interface Exercise {
  id?: number;
  name: string;
  video?: string;
}

interface ExerciseManagerProps {
  apiKey: string | null;
  deviceId: string | null;
}

const ExerciseManager: React.FC<ExerciseManagerProps> = ({ apiKey, deviceId }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [formData, setFormData] = useState<Exercise>({ name: '', video: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!apiKey || !deviceId) return;

    const fetchExercises = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/v1/exercises', {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Device-ID': deviceId,
          },
        });
        setExercises(response.data);
      } catch (err) {
        console.error('Error fetching exercises:', err);
        setError('Erro ao carregar exercícios');
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [apiKey, deviceId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !deviceId) {
      setError('Credenciais de autenticação ausentes');
      return;
    }

    try {
      setLoading(true);
      console.log('Sending exercise data:', formData);
      const response = await axios.post(
        'http://localhost:3000/api/v1/exercises',
        { exercise: formData },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Device-ID': deviceId,
            'Content-Type': 'application/json',
          },
        }
      );
      setExercises((prev) => [...prev, response.data]);
      setFormData({ name: '', video: '' });
      setError(null);
    } catch (err: any) {
      console.error('Error creating exercise:', err);
      setError(err.response?.data?.errors?.join(', ') || 'Erro ao criar exercício');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!apiKey || !deviceId || !window.confirm('Tem certeza que deseja excluir este exercício?')) return;

    try {
      await axios.delete(`http://localhost:3000/api/v1/exercises/${id}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Device-ID': deviceId,
        },
      });
      setExercises((prev) => prev.filter((ex) => ex.id !== id));
    } catch (err) {
      console.error('Error deleting exercise:', err);
      setError('Erro ao excluir exercício');
    }
  };

  return (
    <div className={styles.exerciseManager}>
      <h2 className={styles.title}>Gerenciar Exercícios</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Nome do Exercício</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Ex: Agachamento"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="video">URL do Vídeo (Opcional)</label>
          <input
            type="url"
            id="video"
            name="video"
            value={formData.video}
            onChange={handleInputChange}
            placeholder="https://example.com/video"
          />
        </div>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? <i className="fas fa-spinner fa-spin" /> : 'Adicionar Exercício'}
        </button>
      </form>

      {loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : exercises.length === 0 ? (
        <p className={styles.empty}>Nenhum exercício encontrado.</p>
      ) : (
        <div className={styles.exerciseList}>
          {exercises.map((exercise) => (
            <div key={exercise.id} className={styles.exerciseItem}>
              <div className={styles.exerciseInfo}>
                <strong>{exercise.name}</strong>
                {exercise.video && (
                  <a href={exercise.video} target="_blank" rel="noopener noreferrer">
                    Vídeo
                  </a>
                )}
              </div>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(exercise.id!)}
                aria-label={`Excluir exercício ${exercise.name}`}
              >
                <i className="fas fa-trash" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseManager;