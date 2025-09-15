// src/components/TrainingForm.tsx
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { InputField, SelectField } from '../components/UserFormComponents';
import { Dumbbell, Video, Calendar, Info, Plus, Minus, Repeat, ChevronDown, Loading } from '../components/Icons';
import trainingStyles from '../styles/trainingForm.module.css';
import { WeekdayOptions } from './FormConstants';
import { debounce } from 'lodash';

interface TrainingExerciseSet {
  id?: number;
  series_amount: string;
  repeats_amount: string;
  _destroy?: boolean;
}

interface TrainingExercise {
  id: number | null;
  exercise_id: string | null;
  exercise_name: string;
  video: string;
  training_exercise_sets: TrainingExerciseSet[];
  _destroy?: boolean;
}

interface Training {
  id: number | null;
  weekday: string;
  description: string;
  training_exercises: TrainingExercise[];
  _destroy?: boolean;
}

interface Exercise {
  id: number;
  name: string;
  video: string | null;
}

interface TrainingProps {
  trainings: Training[];
  handleTrainingChange: (index: number, field: string, value: string) => void;
  handleTrainingExerciseChange: (trainingIndex: number, exerciseIndex: number, field: string, value: string) => void;
  handleExerciseSetChange: (trainingIndex: number, exerciseIndex: number, setIndex: number, field: string, value: string) => void;
  addTrainingExercise: (trainingIndex: number) => void;
  addExerciseSet: (trainingIndex: number, exerciseIndex: number) => void;
  removeTrainingExercise: (trainingIndex: number, exerciseIndex: number) => void;
  removeExerciseSet: (trainingIndex: number, exerciseIndex: number, setIndex: number) => void;
  removeTraining: (index: number) => void;
  addTraining: () => void;
  apiKey: string | null;
  deviceId: string | null;
}

const TrainingForm: React.FC<TrainingProps> = React.memo(
  ({
    trainings,
    handleTrainingChange,
    handleTrainingExerciseChange,
    handleExerciseSetChange,
    addTrainingExercise,
    addExerciseSet,
    removeTrainingExercise,
    removeExerciseSet,
    removeTraining,
    addTraining,
    apiKey,
    deviceId,
  }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(trainings.length - 1);
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const trainingRefs = useRef<(HTMLDivElement | null)[]>([]);

    const fetchExercises = useCallback(async () => {
      if (!apiKey || !deviceId) {
        setErrors((prev) => ({ ...prev, general: 'Credenciais de autenticação ausentes' }));
        return;
      }
      try {
        const response = await axios.get('http://localhost:3000/api/v1/exercises', {
          headers: { Authorization: `Bearer ${apiKey}`, 'Device-ID': deviceId },
        });
        setExercises(response.data);
      } catch (err) {
        console.error('Error fetching exercises:', err);
        setErrors((prev) => ({ ...prev, general: 'Erro ao carregar exercícios' }));
      }
    }, [apiKey, deviceId]);

    useEffect(() => {
      fetchExercises();
    }, [fetchExercises]);

    const validateField = useCallback((field: string, value: string) => {
      if (field === 'series_amount' || field === 'repeats_amount') {
        return Number(value) >= 0 ? '' : 'Deve ser um número positivo';
      }
      if (field === 'exercise_id') {
        return value !== '' ? '' : 'Selecione um exercício';
      }
      return '';
    }, []);

    const handleAddTraining = useCallback(() => {
      addTraining();
      setOpenIndex(trainings.length);
      setTimeout(() => {
        trainingRefs.current[trainings.length]?.focus();
      }, 0);
    }, [addTraining, trainings.length]);

    const handleRemoveTraining = useCallback(
      (index: number) => {
        if (window.confirm('Tem certeza que deseja excluir este treino?')) {
          removeTraining(index);
        }
      },
      [removeTraining]
    );

    const handleRemoveTrainingExercise = useCallback(
      (trainingIndex: number, exerciseIndex: number) => {
        if (window.confirm('Tem certeza que deseja excluir este exercício?')) {
          removeTrainingExercise(trainingIndex, exerciseIndex);
        }
      },
      [removeTrainingExercise]
    );

    const handleRemoveExerciseSet = useCallback(
      (trainingIndex: number, exerciseIndex: number, setIndex: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta série/repetição?')) {
          removeExerciseSet(trainingIndex, exerciseIndex, setIndex);
        }
      },
      [removeExerciseSet]
    );

    const handleExerciseSetChangeWithValidation = useCallback(
      (trainingIndex: number, exerciseIndex: number, setIndex: number, field: string, value: string) => {
        const error = validateField(field, value);
        setErrors((prev) => ({
          ...prev,
          [`${trainingIndex}-${exerciseIndex}-${setIndex}-${field}`]: error,
        }));
        handleExerciseSetChange(trainingIndex, exerciseIndex, setIndex, field, value);
      },
      [handleExerciseSetChange, validateField]
    );

    const handleTrainingExerciseChangeWithValidation = useCallback(
      (trainingIndex: number, exerciseIndex: number, field: string, value: string) => {
        const error = validateField(field, value);
        setErrors((prev) => ({
          ...prev,
          [`${trainingIndex}-${exerciseIndex}-${field}`]: error,
        }));
        handleTrainingExerciseChange(trainingIndex, exerciseIndex, field, value);
        if (field === 'exercise_id') {
          const selectedExercise = exercises.find((ex) => ex.id === Number(value));
          handleTrainingExerciseChange(trainingIndex, exerciseIndex, 'exercise_name', selectedExercise?.name || '');
          handleTrainingExerciseChange(trainingIndex, exerciseIndex, 'video', selectedExercise?.video || '');
        }
      },
      [handleTrainingExerciseChange, validateField, exercises]
    );

    useEffect(() => {
      const debouncedSave = debounce(() => {
        console.log('Salvando automaticamente:', trainings);
      }, 1000);

      const debouncedSaveWithCancel = debouncedSave as typeof debouncedSave & { cancel: () => void };
      debouncedSaveWithCancel();
      return () => debouncedSaveWithCancel.cancel();
    }, [trainings]);

    const toggleTraining = useCallback((index: number) => {
      setOpenIndex((prev) => (prev === index ? null : index));
      if (openIndex !== index) {
        setTimeout(() => trainingRefs.current[index]?.focus(), 0);
      }
    }, [openIndex]);

    const toggleSection = useCallback((trainingIndex: number, exerciseIndex: number, section: 'sets') => {
      const key = `${trainingIndex}-${exerciseIndex}-${section}`;
      setExpandedSections((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    }, []);

    const exerciseOptions = useMemo(
      () => [
        { value: '', label: 'Selecione um exercício' },
        ...exercises.map((exercise) => ({
          value: String(exercise.id),
          label: exercise.name,
        })),
      ],
      [exercises]
    );

    return (
      <div className={trainingStyles.container}>
        <div className={trainingStyles.header}>
          <div className={trainingStyles.headerIcon}>
            <Dumbbell />
          </div>
          <h1 className={trainingStyles.headerTitle}>Plano de Treinamento</h1>
          <p className={trainingStyles.headerSubtitle}>Configure seus treinos semanais</p>
          {isSaving && (
            <span className={trainingStyles.savingIndicator} aria-live="polite">
              <Loading /> Salvando...
            </span>
          )}
          {errors.general && (
            <p className={trainingStyles.errorMessage} role="alert">
              {errors.general}
            </p>
          )}
        </div>

        <div className={trainingStyles.section}>
          <div className={trainingStyles.sectionHeader}>
            <h3>
              <Dumbbell />
              Treinos
            </h3>
            <div className={trainingStyles.sectionHeaderActions}>
              <button
                type="button"
                className={trainingStyles.addButton}
                onClick={handleAddTraining}
                aria-label="Adicionar novo treino"
              >
                <Plus />
                <span>Adicionar Treino</span>
              </button>
            </div>
          </div>

          {trainings.length === 0 || trainings.every((t) => t._destroy) ? (
            <p className={trainingStyles.emptyMessage}>Nenhum treino adicionado ainda.</p>
          ) : (
            trainings.map((training, trainingIndex) =>
              !training._destroy ? (
                <div
                  className={`${trainingStyles.groupCard} ${
                    openIndex === trainingIndex ? '' : trainingStyles.collapsed
                  }`}
                  key={training.id || `training-${trainingIndex}`}
                  role="region"
                  aria-labelledby={`training-header-${trainingIndex}`}
                  ref={(el) => {
                    trainingRefs.current[trainingIndex] = el;
                  }}
                  tabIndex={-1}
                >
                  <div
                    className={trainingStyles.groupCardHeader}
                    onClick={() => toggleTraining(trainingIndex)}
                    onKeyDown={(e) => e.key === 'Enter' && toggleTraining(trainingIndex)}
                    role="button"
                    aria-expanded={openIndex === trainingIndex}
                    aria-controls={`training-content-${trainingIndex}`}
                    id={`training-header-${trainingIndex}`}
                    tabIndex={0}
                  >
                    <span>{`Treino ${trainingIndex + 1} ${training.weekday ? `(${training.weekday})` : ''}`}</span>
                    <span>
                      <ChevronDown />
                    </span>
                  </div>

                  <div
                    id={`training-content-${trainingIndex}`}
                    className={trainingStyles.groupCardContent}
                  >
                    <div className={trainingStyles.sectionGroup}>
                      <SelectField
                        label="Dia da Semana"
                        value={training.weekday}
                        onChange={(e) => handleTrainingChange(trainingIndex, 'weekday', e.target.value)}
                        options={WeekdayOptions}
                        icon={<Calendar />}
                        name={`training-${trainingIndex}-weekday`}
                        error={errors[`${trainingIndex}-weekday`]}
                      />
                      <InputField
                        label="Descrição (opcional)"
                        type="text"
                        name={`training-${trainingIndex}-description`}
                        value={training.description}
                        onChange={(e) => handleTrainingChange(trainingIndex, 'description', e.target.value)}
                        placeholder="Digite a descrição do treino"
                        icon={<Info />}
                        optional
                      />
                    </div>

                    <div className={trainingStyles.subSection}>
                      <div
                        className={trainingStyles.subSectionHeader}
                        onClick={() => toggleSection(trainingIndex, 0, 'sets')}
                        onKeyDown={(e) => e.key === 'Enter' && toggleSection(trainingIndex, 0, 'sets')}
                        role="button"
                        aria-expanded={expandedSections[`${trainingIndex}-0-sets`]}
                        aria-controls={`exercises-${trainingIndex}`}
                        tabIndex={0}
                      >
                        <h4>
                          <Dumbbell />
                          Exercícios ({training.training_exercises.filter((e) => !e._destroy).length})
                        </h4>
                        <button
                          type="button"
                          className={trainingStyles.addSubButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            addTrainingExercise(trainingIndex);
                          }}
                          aria-label="Adicionar novo exercício"
                        >
                          <Plus />
                        </button>
                      </div>

                      {training.training_exercises.filter((e) => !e._destroy).length === 0 ? (
                        <p className={trainingStyles.emptyMessage}>Nenhum exercício adicionado.</p>
                      ) : (
                        training.training_exercises.map((exercise, exerciseIndex) =>
                          !exercise._destroy ? (
                            <div
                              key={exercise.id || `exercise-${exerciseIndex}`}
                              className={trainingStyles.exerciseCard}
                            >
                              <div className={trainingStyles.sectionGroup}>
                                <SelectField
                                  label="Exercício"
                                  name={`training-${trainingIndex}-exercise-${exerciseIndex}-exercise_id`}
                                  value={exercise.exercise_id || ''}
                                  onChange={(e) =>
                                    handleTrainingExerciseChangeWithValidation(
                                      trainingIndex,
                                      exerciseIndex,
                                      'exercise_id',
                                      e.target.value
                                    )
                                  }
                                  options={exerciseOptions}
                                  icon={<Dumbbell />}
                                  error={errors[`${trainingIndex}-${exerciseIndex}-exercise_id`]}
                                />
                                {exercise.video && (
                                  <div className={trainingStyles.videoLink}>
                                    <a
                                      href={exercise.video}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label={`Ver vídeo do exercício ${exercise.exercise_name}`}
                                    >
                                      <Video /> Ver Vídeo
                                    </a>
                                  </div>
                                )}
                              </div>

                              <div className={trainingStyles.subSection}>
                                <div
                                  className={trainingStyles.subSectionHeader}
                                  onClick={() => toggleSection(trainingIndex, exerciseIndex, 'sets')}
                                  onKeyDown={(e) =>
                                    e.key === 'Enter' && toggleSection(trainingIndex, exerciseIndex, 'sets')
                                  }
                                  role="button"
                                  aria-expanded={expandedSections[`${trainingIndex}-${exerciseIndex}-sets`]}
                                  aria-controls={`sets-${trainingIndex}-${exerciseIndex}`}
                                  tabIndex={0}
                                >
                                  <h4>
                                    <Repeat />
                                    Séries e Repetições (
                                    {exercise.training_exercise_sets?.filter((s) => !s._destroy)?.length || 0})
                                  </h4>
                                  <button
                                    type="button"
                                    className={trainingStyles.addSubButton}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addExerciseSet(trainingIndex, exerciseIndex);
                                    }}
                                    aria-label="Adicionar nova série/repetição"
                                  >
                                    <Plus />
                                  </button>
                                </div>

                                {expandedSections[`${trainingIndex}-${exerciseIndex}-sets`] && (
                                  <div
                                    id={`sets-${trainingIndex}-${exerciseIndex}`}
                                    className={trainingStyles.subSectionContent}
                                  >
                                    {exercise.training_exercise_sets?.map((exerciseSet, setIndex) =>
                                      !exerciseSet._destroy ? (
                                        <div
                                          key={exerciseSet.id || `set-${setIndex}`}
                                          className={trainingStyles.itemRow}
                                        >
                                          <InputField
                                            label={`Série ${setIndex + 1}`}
                                            type="number"
                                            name={`training-${trainingIndex}-exercise-${exerciseIndex}-set-${setIndex}-series`}
                                            value={exerciseSet.series_amount}
                                            onChange={(e) =>
                                              handleExerciseSetChangeWithValidation(
                                                trainingIndex,
                                                exerciseIndex,
                                                setIndex,
                                                'series_amount',
                                                e.target.value
                                              )
                                            }
                                            placeholder="3"
                                            icon={<Repeat />}
                                            error={
                                              errors[`${trainingIndex}-${exerciseIndex}-${setIndex}-series_amount`]
                                            }
                                          />
                                          <InputField
                                            label={`Repetições ${setIndex + 1}`}
                                            type="number"
                                            name={`training-${trainingIndex}-exercise-${exerciseIndex}-set-${setIndex}-repeats`}
                                            value={exerciseSet.repeats_amount}
                                            onChange={(e) =>
                                              handleExerciseSetChangeWithValidation(
                                                trainingIndex,
                                                exerciseIndex,
                                                setIndex,
                                                'repeats_amount',
                                                e.target.value
                                              )
                                            }
                                            placeholder="12"
                                            icon={<Repeat />}
                                            error={
                                              errors[`${trainingIndex}-${exerciseIndex}-${setIndex}-repeats_amount`]
                                            }
                                          />
                                          <button
                                            type="button"
                                            className={trainingStyles.removeItemButton}
                                            onClick={() =>
                                              handleRemoveExerciseSet(trainingIndex, exerciseIndex, setIndex)
                                            }
                                            aria-label={`Remover série ${setIndex + 1}`}
                                          >
                                            <Minus />
                                          </button>
                                        </div>
                                      ) : null
                                    )}
                                    {(!exercise.training_exercise_sets ||
                                      exercise.training_exercise_sets.filter((s) => !s._destroy).length === 0) && (
                                      <p className={trainingStyles.emptyMessage}>
                                        Nenhuma série/repetição adicionada.
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className={trainingStyles.buttonRow}>
                                <button
                                  type="button"
                                  className={trainingStyles.removeButton}
                                  onClick={() => handleRemoveTrainingExercise(trainingIndex, exerciseIndex)}
                                  aria-label={`Remover exercício ${exercise.exercise_name}`}
                                >
                                  <Minus />
                                  <span>Remover Exercício</span>
                                </button>
                              </div>
                            </div>
                          ) : null
                        )
                      )}
                    </div>

                    <div className={trainingStyles.buttonRow}>
                      <button
                        type="button"
                        className={trainingStyles.removeButton}
                        onClick={() => handleRemoveTraining(trainingIndex)}
                        aria-label={`Remover treino ${trainingIndex + 1}`}
                      >
                        <Minus />
                        <span>Remover Treino</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : null
            )
          )}
        </div>
      </div>
    );
  }
);

export default TrainingForm;