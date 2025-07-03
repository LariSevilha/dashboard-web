import React, { useState } from 'react';
import { InputField, SelectField } from '../components/UserFormComponents';
import * as Icons from '../components/Icons';
import styles from '../styles/UserForm.module.css';
import { WeekdayOptions } from './FormConstants';

interface TrainingProps {
  trainings: any[];
  handleTrainingChange: (index: number, field: string, value: any) => void;
  removeTraining: (index: number) => void;
  addTraining: () => void;
}

const TrainingForm: React.FC<TrainingProps> = ({ trainings, handleTrainingChange, removeTraining, addTraining }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(trainings.length - 1);

  const handleAddTraining = () => {
    addTraining();
    setOpenIndex(trainings.length);
  };

  const toggleTraining = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handlePhotoChange = (index: number, files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      handleTrainingChange(index, 'photos', fileArray);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3>Treinos</h3>
        <button type="button" className={styles.addButton} onClick={handleAddTraining} aria-label="Adicionar novo treino">
          <Icons.Plus /> Adicionar Treino
        </button>
      </div>
      {trainings.map((training, index) =>
        !training._destroy ? (
          <div
            className={`${styles.groupCard} ${openIndex === index ? '' : styles.collapsed}`}
            key={training.id || `training-${index}`}
          >
            <div className={styles.groupCardHeader} onClick={() => toggleTraining(index)}>
              <span>{training.exercise_name || `Treino ${index + 1}`}</span>
              <Icons.ChevronDown style={{ transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
            </div>
            <div className={styles.groupCardContent}>
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
                  value={training.exercise_name || ''}
                  onChange={(e) => handleTrainingChange(index, 'exercise_name', e.target.value)}
                  placeholder="Nome do exercício"
                  icon={<Icons.Dumbbell />}
                />
                <InputField
                  label="Séries"
                  type="number"
                  name={`training-${index}-serie_amount`}
                  value={training.serie_amount || ''}
                  onChange={(e) => handleTrainingChange(index, 'serie_amount', e.target.value)}
                  placeholder="3"
                />
                <InputField
                  label="Repetições"
                  type="number"
                  name={`training-${index}-repeat_amount`}
                  value={training.repeat_amount || ''}
                  onChange={(e) => handleTrainingChange(index, 'repeat_amount', e.target.value)}
                  placeholder="12"
                />
                <InputField
                  label="Vídeo (opcional)"
                  type="text"
                  name={`training-${index}-video`}
                  value={training.video || ''}
                  onChange={(e) => handleTrainingChange(index, 'video', e.target.value)}
                  placeholder="URL do vídeo"
                  optional
                />
                <div className={styles.fileInputWrapper}>
                  <label htmlFor={`training-${index}-photos`} className={styles.label}>
                    Fotos (opcional)
                  </label>
                  <input
                    type="file"
                    id={`training-${index}-photos`}
                    name={`training-${index}-photos`}
                    onChange={(e) => handlePhotoChange(index, e.target.files)}
                    multiple
                    accept="image/*"
                    className={styles.fileInput}
                  />
                  {training.photos && training.photos.length > 0 && (
                    <div className={styles.selectedFiles}>
                      <p>Fotos selecionadas:</p>
                      <ul>
                        {(training.photos instanceof Array
                          ? training.photos.map((file: File) => file.name)
                          : training.photos.split(',').map((url: string) => url.split('/').pop())
                        ).map((name: string, i: number) => (
                          <li key={i}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
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
          </div>
        ) : null
      )}
    </div>
  );
};

export default TrainingForm;