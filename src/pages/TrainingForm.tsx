import React, { useState } from 'react';
import { InputField, SelectField } from '../components/UserFormComponents';
import * as Icons from '../components/Icons';
import styles from '../styles/UserForm.module.css';
import trainingStyles from '../styles/trainingForm.module.css';  
import { WeekdayOptions } from './FormConstants';

interface TrainingProps {
  trainings: any[];
  handleTrainingChange: (index: number, field: string, value: string) => void;
  removeTraining: (index: number) => void;
  addTraining: () => void;
}

const TrainingForm: React.FC<TrainingProps> = ({ 
  trainings, 
  handleTrainingChange, 
  removeTraining, 
  addTraining 
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(trainings.length - 1);

  const handleAddTraining = () => {
    addTraining();
    setOpenIndex(trainings.length);
  };

  const toggleTraining = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={trainingStyles.container}>
      {/* Header opcional */}
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

        {trainings.map((training, index) =>
          !training._destroy ? (
            <div
              className={`${trainingStyles.groupCard} ${
                openIndex === index ? '' : trainingStyles.collapsed
              }`}
              key={training.id || `training-${index}`}
            >
              <div 
                className={trainingStyles.groupCardHeader} 
                onClick={() => toggleTraining(index)}
              >
                <span>{training.exercise_name || `Treino ${index + 1}`}</span>
                <span>
                  <Icons.ChevronDown />
                </span>
              </div>

              <div className={trainingStyles.groupCardContent}>
                <div className={trainingStyles.sectionGroup}>
                  <SelectField
                    label="Dia da Semana"
                    value={training.weekday}
                    onChange={(e) => handleTrainingChange(index, 'weekday', e.target.value)}
                    options={WeekdayOptions}
                    icon={<Icons.Calendar />}
                    name={`training-${index}-weekday`}
                  />
                  <InputField
                    label="Exercício"
                    type="text"
                    name={`training-${index}-exercise_name`}
                    value={training.exercise_name}
                    onChange={(e) => handleTrainingChange(index, 'exercise_name', e.target.value)}
                    placeholder="Nome do exercício"
                    icon={<Icons.Dumbbell />}
                  />
                  <InputField
                    label="Séries"
                    type="number"
                    name={`training-${index}-serie_amount`}
                    value={training.serie_amount}
                    onChange={(e) => handleTrainingChange(index, 'serie_amount', e.target.value)}
                    placeholder="3"
                    icon={<Icons.Repeat />}
                  />
                  <InputField
                    label="Repetições"
                    type="number"
                    name={`training-${index}-repeat_amount`}
                    value={training.repeat_amount}
                    onChange={(e) => handleTrainingChange(index, 'repeat_amount', e.target.value)}
                    placeholder="12"
                    icon={<Icons.Repeat />}
                  />
                  <InputField
                    label="Vídeo (opcional)"
                    type="text"
                    name={`training-${index}-video`}
                    value={training.video}
                    onChange={(e) => handleTrainingChange(index, 'video', e.target.value)}
                    placeholder="URL do vídeo"
                    icon={<Icons.Video />}
                    optional
                  />
                  <InputField
                    label="Descrição (opcional)"
                    type="text"
                    name={`training-${index}-description`}
                    value={training.description}
                    onChange={(e) => handleTrainingChange(index, 'description', e.target.value)}
                    placeholder="Descrição do treino"
                    icon={<Icons.Info />}
                    optional
                  />
                </div>

                <div className={trainingStyles.buttonRow}>
                  <button
                    type="button"
                    className={trainingStyles.removeButton}
                    onClick={() => removeTraining(index)}
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