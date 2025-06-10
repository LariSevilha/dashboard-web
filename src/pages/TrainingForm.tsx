import React from 'react';
import { InputField, SelectField } from '../components/UserFormComponents';
import * as Icons from '../components/Icons';
import styles from '../styles/UserForm.module.css';
import { WeekdayOptions } from './FormConstants';

interface TrainingProps {
  trainings: any[];
  handleTrainingChange: (index: number, field: string, value: string) => void;
  removeTraining: (index: number) => void;
  addTraining: () => void;
}

const TrainingForm: React.FC<TrainingProps> = ({ trainings, handleTrainingChange, removeTraining, addTraining }) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3>Treinos</h3>
        <button type="button" className={styles.addButton} onClick={addTraining} aria-label="Adicionar novo treino">
          <Icons.Plus /> Adicionar Treino
        </button>
      </div>
      <small className={styles.fileHint}>
        Nota: O cadastro de treinos é opcional. Você pode adicionar apenas dietas, se preferir.
      </small>
      {trainings.map((training, index) =>
        !training._destroy ? (
          <div className={styles.groupCard} key={training.id || `training-${index}`}>
            <div className={styles.sectionGroup}>
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
                icon={<Icons.Food />}
              />
              <InputField
                label="Séries"
                type="number"
                name={`training-${index}-serie_amount`}
                value={training.serie_amount}
                onChange={(e) => handleTrainingChange(index, 'serie_amount', e.target.value)}
                placeholder="3"
              />
              <InputField
                label="Repetições"
                type="number"
                name={`training-${index}-repeat_amount`}
                value={training.repeat_amount}
                onChange={(e) => handleTrainingChange(index, 'repeat_amount', e.target.value)}
                placeholder="12"
              />
              <InputField
                label="Vídeo (opcional)"
                type="text"
                name={`training-${index}-video`}
                value={training.video}
                onChange={(e) => handleTrainingChange(index, 'video', e.target.value)}
                placeholder="URL do vídeo"
                optional
              />
            </div>
            <div className={styles.buttonRow}>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeTraining(index)}
                aria-label="Remover treino"
              >
                <Icons.Minus /> Remover Treino
              </button>
            </div>
          </div>
        ) : null
      )}
    </div>
  );
};

export default TrainingForm;