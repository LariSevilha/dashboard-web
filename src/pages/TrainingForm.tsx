import React, { useState, useCallback, useEffect } from 'react';
import { InputField, SelectField } from '../components/UserFormComponents';
import * as Icons from '../components/Icons';
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
  exercise_id: number | null;
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
}

// Remove the local InputFieldProps interface as it conflicts with the imported component

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
  }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(trainings.length - 1);
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateField = useCallback((field: string, value: string) => {
      if (field === 'series_amount' || field === 'repeats_amount') {
        return Number(value) >= 0 ? '' : 'O valor deve ser maior ou igual a 0';
      }
      if (field === 'video') {
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        return value === '' || urlPattern.test(value) ? '' : 'URL inválida';
      }
      if (field === 'exercise_name') {
        return value.trim() !== '' ? '' : 'O nome do exercício é obrigatório';
      }
      return '';
    }, []);

    const handleAddTraining = useCallback(() => {
      addTraining();
      setOpenIndex(trainings.length);
    }, [addTraining, trainings.length]);

    const handleRemoveTraining = useCallback(
      (index: number) => {
        if (window.confirm('Tem certeza que deseja remover este treino?')) {
          removeTraining(index);
        }
      },
      [removeTraining]
    );

    const handleRemoveTrainingExercise = useCallback(
      (trainingIndex: number, exerciseIndex: number) => {
        if (window.confirm('Tem certeza que deseja remover este exercício?')) {
          removeTrainingExercise(trainingIndex, exerciseIndex);
        }
      },
      [removeTrainingExercise]
    );

    const handleRemoveExerciseSet = useCallback(
      (trainingIndex: number, exerciseIndex: number, setIndex: number) => {
        if (window.confirm('Tem certeza que deseja remover esta série/repetição?')) {
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
      },
      [handleTrainingExerciseChange, validateField]
    );

    useEffect(() => {
      const debouncedSave = debounce(() => {
        console.log('Salvando automaticamente:', trainings);
      }, 1000);
    
      // TypeScript fix: Explicitly cast the debounced function
      const debouncedSaveWithCancel = debouncedSave as typeof debouncedSave & { cancel: () => void };
    
      debouncedSaveWithCancel();
      return () => debouncedSaveWithCancel.cancel();
    }, [trainings]);

    const toggleTraining = useCallback((index: number) => {
      setOpenIndex((prev) => (prev === index ? null : index));
    }, []);

    const toggleSection = useCallback((trainingIndex: number, exerciseIndex: number, section: 'sets') => {
      const key = `${trainingIndex}-${exerciseIndex}-${section}`;
      setExpandedSections((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    }, []);

    return (
      <div className={trainingStyles.container}>
        <div className={trainingStyles.header}>
          <div className={trainingStyles.headerIcon}>
            <Icons.Dumbbell />
          </div>
          <h1 className={trainingStyles.headerTitle}>Plano de Treinos</h1>
          <p className={trainingStyles.headerSubtitle}>Configure seus exercícios semanais</p>
        </div>

        <div className={trainingStyles.section}>
          <div className={trainingStyles.sectionHeader}>
            <h3>
              <Icons.Dumbbell />
              Treinos
            </h3>
            <button
              type="button"
              className={trainingStyles.addButton}
              onClick={handleAddTraining}
              aria-label="Adicionar novo treino"
            >
              <Icons.Plus />
              <span>Adicionar Treino</span>
            </button>
          </div>

          {trainings.map((training, trainingIndex) =>
            !training._destroy ? (
              <div
                className={`${trainingStyles.groupCard} ${
                  openIndex === trainingIndex ? '' : trainingStyles.collapsed
                }`}
                key={training.id || `training-${trainingIndex}`}
                role="region"
                aria-labelledby={`training-header-${trainingIndex}`}
              >
                <div
                  className={trainingStyles.groupCardHeader}
                  onClick={() => toggleTraining(trainingIndex)}
                  role="button"
                  aria-expanded={openIndex === trainingIndex}
                  aria-controls={`training-content-${trainingIndex}`}
                  id={`training-header-${trainingIndex}`}
                  tabIndex={0}
                >
                  <span>{`Treino ${trainingIndex + 1}`}</span>
                  <span>
                    <Icons.ChevronDown />
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
                      icon={<Icons.Calendar />}
                      name={`training-${trainingIndex}-weekday`}
                    />
                    <InputField
                      label="Descrição (opcional)"
                      type="text"
                      name={`training-${trainingIndex}-description`}
                      value={training.description}
                      onChange={(e) => handleTrainingChange(trainingIndex, 'description', e.target.value)}
                      placeholder="Descrição do treino"
                      icon={<Icons.Info />}
                      optional
                    />
                  </div>

                  <div className={trainingStyles.subSection}>
                    <div
                      className={trainingStyles.subSectionHeader}
                      onClick={() => toggleSection(trainingIndex, 0, 'sets')}
                      role="button"
                      aria-expanded={expandedSections[`${trainingIndex}-0-sets`]}
                      aria-controls={`exercises-${trainingIndex}`}
                      tabIndex={0}
                    >
                      <h4>
                        <Icons.Dumbbell />
                        Exercícios (
                        {training.training_exercises?.filter((e) => !e._destroy)?.length || 0})
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
                        <Icons.Plus />
                      </button>
                    </div>

                    {training.training_exercises?.map((exercise, exerciseIndex) =>
                      !exercise._destroy ? (
                        <div
                          key={exercise.id || `exercise-${exerciseIndex}`}
                          className={trainingStyles.exerciseCard}
                        >
                          <div className={trainingStyles.sectionGroup}>
                            <InputField
                              label="Exercício"
                              type="text"
                              name={`training-${trainingIndex}-exercise-${exerciseIndex}-name`}
                              value={exercise.exercise_name}
                              onChange={(e) =>
                                handleTrainingExerciseChangeWithValidation(
                                  trainingIndex,
                                  exerciseIndex,
                                  'exercise_name',
                                  e.target.value
                                )
                              }
                              placeholder="Nome do exercício"
                              icon={<Icons.Dumbbell />}
                              error={errors[`${trainingIndex}-${exerciseIndex}-exercise_name`]}
                            />
                            <InputField
                              label="Vídeo (opcional)"
                              type="text"
                              name={`training-${trainingIndex}-exercise-${exerciseIndex}-video`}
                              value={exercise.video}
                              onChange={(e) =>
                                handleTrainingExerciseChangeWithValidation(
                                  trainingIndex,
                                  exerciseIndex,
                                  'video',
                                  e.target.value
                                )
                              }
                              placeholder="URL do vídeo"
                              icon={<Icons.Video />}
                              optional
                              error={errors[`${trainingIndex}-${exerciseIndex}-video`]}
                            />
                          </div>

                          <div className={trainingStyles.subSection}>
                            <div
                              className={trainingStyles.subSectionHeader}
                              onClick={() => toggleSection(trainingIndex, exerciseIndex, 'sets')}
                              role="button"
                              aria-expanded={expandedSections[`${trainingIndex}-${exerciseIndex}-sets`]}
                              aria-controls={`sets-${trainingIndex}-${exerciseIndex}`}
                              tabIndex={0}
                            >
                              <h4>
                                <Icons.Repeat />
                                Séries e Repetições (
                                {exercise.training_exercise_sets?.filter((s) => !s._destroy)?.length || 0}
                                )
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
                                <Icons.Plus />
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
                                        label={`Séries ${setIndex + 1}`}
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
                                        icon={<Icons.Repeat />}
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
                                        icon={<Icons.Repeat />}
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
                                        aria-label="Remover série/repetição"
                                      >
                                        <Icons.Minus />
                                      </button>
                                    </div>
                                  ) : null
                                )}
                                {(!exercise.training_exercise_sets ||
                                  exercise.training_exercise_sets.filter((s) => !s._destroy).length === 0) && (
                                  <p className={trainingStyles.emptyMessage}>
                                    Nenhuma série/repetição adicionada
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
                              aria-label="Remover exercício"
                            >
                              <Icons.Minus />
                              <span>Remover Exercício</span>
                            </button>
                          </div>
                        </div>
                      ) : null
                    )}
                    {(!training.training_exercises ||
                      training.training_exercises.filter((e) => !e._destroy).length === 0) && (
                      <p className={trainingStyles.emptyMessage}>Nenhum exercício adicionado</p>
                    )}
                  </div>

                  <div className={trainingStyles.buttonRow}>
                    <button
                      type="button"
                      className={trainingStyles.removeButton}
                      onClick={() => handleRemoveTraining(trainingIndex)}
                      aria-label="Remover treino"
                    >
                      <Icons.Minus />
                      <span>Remover Treino</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>
    );
  }
);

export default TrainingForm;