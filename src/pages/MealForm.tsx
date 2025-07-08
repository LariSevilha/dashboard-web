import React, { useState } from 'react';
import { InputField, SelectField } from '../components/UserFormComponents';
import * as Icons from '../components/Icons';
import styles from '../styles/UserForm.module.css';
import { WeekdayOptions } from './FormConstants';

interface MealProps {
  meals: any[];
  handleMealChange: (mealIndex: number, field: string, value: string) => void;
  removeMeal: (mealIndex: number) => void;
  addMeal: () => void;
  handleComidaChange: (mealIndex: number, comidaIndex: number, field: string, value: string) => void;
  removeComida: (mealIndex: number, comidaIndex: number) => void;
  addComida: (mealIndex: number) => void;
}

const MealForm: React.FC<MealProps> = ({
  meals,
  handleMealChange,
  removeMeal,
  addMeal,
  handleComidaChange,
  removeComida,
  addComida,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(meals.length - 1);

  const handleAddMeal = () => {
    addMeal();
    setOpenIndex(meals.length);
  };

  const toggleMeal = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3>Dietas</h3>
        <button type="button" className={styles.addButton} onClick={handleAddMeal} aria-label="Adicionar nova refeição">
          <Icons.Plus /> Adicionar Refeição
        </button>
      </div>
      {meals.map((meal, mealIndex) =>
        !meal._destroy ? (
          <div
            className={`${styles.groupCard} ${openIndex === mealIndex ? '' : styles.collapsed}`}
            key={meal.id || `meal-${mealIndex}`}
          >
            <div className={styles.groupCardHeader} onClick={() => toggleMeal(mealIndex)}>
              <span>{meal.meal_type || `Refeição ${mealIndex + 1}`}</span>
              <span style={{ transform: openIndex === mealIndex ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                <Icons.ChevronDown />
              </span>
            </div>
            <div className={styles.groupCardContent}>
              <div className={styles.sectionGroup}>
                <SelectField
                  label="Dia da Semana"
                  value={meal.weekday}
                  onChange={(e) => handleMealChange(mealIndex, 'weekday', e.target.value)}
                  options={WeekdayOptions}
                  icon={<Icons.Calendar />}
                  name={`meal-${mealIndex}-weekday`}
                />
                <InputField
                  label="Tipo da Refeição"
                  type="text"
                  name={`meal-${mealIndex}-meal_type`}
                  value={meal.meal_type}
                  onChange={(e) => handleMealChange(mealIndex, 'meal_type', e.target.value)}
                  placeholder="Café da manhã"
                  icon={<Icons.Food />}
                />
              </div>
              <div className={styles.foodSection}>
                <div className={styles.sectionSubheader}>
                  <h4>Comidas</h4>
                  <button
                    type="button"
                    className={styles.addFoodButton}
                    onClick={() => addComida(mealIndex)}
                    aria-label="Adicionar nova comida"
                  >
                    <Icons.Plus /> Adicionar Comida
                  </button>
                </div>
                {meal.comidas_attributes.map((comida: any, comidaIndex: number) =>
                  !comida._destroy ? (
                    <div className={styles.foodItem} key={comida.id || `comida-${mealIndex}-${comidaIndex}`}>
                      <InputField
                        label="Nome"
                        type="text"
                        name={`comida-${mealIndex}-${comidaIndex}-name`}
                        value={comida.name}
                        onChange={(e) => handleComidaChange(mealIndex, comidaIndex, 'name', e.target.value)}
                        placeholder="Alimento"
                        icon={<Icons.Food />}
                      />
                      <InputField
                        label="Quantidade"
                        type="text"
                        name={`comida-${mealIndex}-${comidaIndex}-amount`}
                        value={comida.amount}
                        onChange={(e) => handleComidaChange(mealIndex, comidaIndex, 'amount', e.target.value)}
                        placeholder="100g"
                        icon={<Icons.Scale />}
                      />
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeComida(mealIndex, comidaIndex)}
                        aria-label="Remover comida"
                      >
                        <Icons.Minus />
                      </button>
                    </div>
                  ) : null
                )}
              </div>
              <div className={styles.buttonRow}>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeMeal(mealIndex)}
                  aria-label="Remover refeição"
                >
                  <Icons.Minus /> Remover Refeição
                </button>
              </div>
            </div>
          </div>
        ) : null
      )}
    </div>
  );
};

export default MealForm;