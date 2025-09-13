import React, { useState } from 'react';
import { InputField, SelectField } from '../components/UserFormComponents';
import * as Icons from '../components/Icons';
import styles from '../styles/UserForm.module.css';
import trainingStyles from '../styles/trainingForm.module.css';
import { WeekdayOptions } from './FormConstants';

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

const TrainingForm: React.FC<TrainingProps> = ({
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

  const handleAddTraining = () => {
    addTraining();
    setOpenIndex(trainings.length);
  };

  const toggleTraining = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const toggleSection = (trainingIndex: number, exerciseIndex: number, section: 'sets') => {
    const key = `${trainingIndex}-${exerciseIndex}-${section}`;
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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
          <h3>Treinos</h3>
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
              className={`${trainingStyles.groupCard} ${openIndex === trainingIndex ? '' : trainingStyles.collapsed}`}
              key={training.id || `training-${trainingIndex}`}
            >
              <div className={trainingStyles.groupCardHeader} onClick={() => toggleTraining(trainingIndex)}>
                <span>{`Treino ${trainingIndex + 1}`}</span>
                <span>
                  <Icons.ChevronDown />
                </span>
              </div>

              <div className={trainingStyles.groupCardContent}>
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
                  <div className={trainingStyles.subSectionHeader}>
                    <h4>
                      <Icons.Dumbbell />
                      Exercícios ({training.training_exercises?.filter((e) => !e._destroy)?.length || 0})
                    </h4>
                    <button
                      type="button"
                      className={trainingStyles.addSubButton}
                      onClick={() => addTrainingExercise(trainingIndex)}
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
                              handleTrainingExerciseChange(trainingIndex, exerciseIndex, 'exercise_name', e.target.value)
                            }
                            placeholder="Nome do exercício"
                            icon={<Icons.Dumbbell />}
                          />
                          <InputField
                            label="Vídeo (opcional)"
                            type="text"
                            name={`training-${trainingIndex}-exercise-${exerciseIndex}-video`}
                            value={exercise.video}
                            onChange={(e) =>
                              handleTrainingExerciseChange(trainingIndex, exerciseIndex, 'video', e.target.value)
                            }
                            placeholder="URL do vídeo"
                            icon={<Icons.Video />}
                            optional
                          />
                        </div>

                        {/* Seção de Séries e Repetições Combinadas */}
                        <div className={trainingStyles.subSection}>
                          <div
                            className={trainingStyles.subSectionHeader}
                            onClick={() => toggleSection(trainingIndex, exerciseIndex, 'sets')}
                          >
                            <h4>
                              <Icons.Repeat />
                              Séries e Repetições ({exercise.training_exercise_sets?.filter((s) => !s._destroy)?.length || 0})
                            </h4>
                            <button
                              type="button"
                              className={trainingStyles.addSubButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                addExerciseSet(trainingIndex, exerciseIndex);
                              }}
                            >
                              <Icons.Plus />
                            </button>
                          </div>

                          {expandedSections[`${trainingIndex}-${exerciseIndex}-sets`] && (
                            <div className={trainingStyles.subSectionContent}>
                              {exercise.training_exercise_sets?.map((exerciseSet, setIndex) =>
                                !exerciseSet._destroy ? (
                                  <div
                                    key={exerciseSet.id || `set-${setIndex}`}
                                    className={trainingStyles.setRow}
                                  >
                                    <div className={trainingStyles.setGroup}>
                                      <InputField
                                        label={`Séries ${setIndex + 1}`}
                                        type="number"
                                        name={`training-${trainingIndex}-exercise-${exerciseIndex}-set-${setIndex}-series`}
                                        value={exerciseSet.series_amount}
                                        onChange={(e) =>
                                          handleExerciseSetChange(trainingIndex, exerciseIndex, setIndex, 'series_amount', e.target.value)
                                        }
                                        placeholder="3"
                                        icon={<Icons.Repeat />}
                                      />
                                      <InputField
                                        label={`Repetições ${setIndex + 1}`}
                                        type="number"
                                        name={`training-${trainingIndex}-exercise-${exerciseIndex}-set-${setIndex}-repeats`}
                                        value={exerciseSet.repeats_amount}
                                        onChange={(e) =>
                                          handleExerciseSetChange(trainingIndex, exerciseIndex, setIndex, 'repeats_amount', e.target.value)
                                        }
                                        placeholder="12"
                                        icon={<Icons.Repeat />}
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      className={trainingStyles.removeItemButton}
                                      onClick={() => removeExerciseSet(trainingIndex, exerciseIndex, setIndex)}
                                      aria-label="Remover série/repetição"
                                    >
                                      <Icons.Minus />
                                    </button>
                                  </div>
                                ) : null
                              )}
                              {(!exercise.training_exercise_sets || exercise.training_exercise_sets.filter((s) => !s._destroy).length === 0) && (
                                <p className={trainingStyles.emptyMessage}>Nenhuma série/repetição adicionada</p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className={trainingStyles.buttonRow}>
                          <button
                            type="button"
                            className={trainingStyles.removeButton}
                            onClick={() => removeTrainingExercise(trainingIndex, exerciseIndex)}
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
                    onClick={() => removeTraining(trainingIndex)}
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
};

export default TrainingForm;