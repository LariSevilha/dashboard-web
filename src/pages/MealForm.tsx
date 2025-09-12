import React from 'react';
import { WeekdayOptions } from './FormConstants';
import * as Icons from '../components/Icons';

interface Meal {
  id: number | null;
  meal_type: string;
  weekday: string;
  _destroy: boolean;
  comidas_attributes: Comida[];
}

interface Comida {
  id: number | null;
  name: string;
  amount: string;
  _destroy: boolean;
}

interface MealFormProps {
  meals: Meal[];
  handleMealChange: (mealIndex: number, field: string, value: string) => void;
  removeMeal: (mealIndex: number) => void;
  addMeal: () => void;
  handleComidaChange: (mealIndex: number, comidaIndex: number, field: string, value: string) => void;
  removeComida: (mealIndex: number, comidaIndex: number) => void;
  addComida: (mealIndex: number) => void;
  styles: any; // Styles from UserForm.module.css
}

const MealForm: React.FC<MealFormProps> = ({
  meals,
  handleMealChange,
  removeMeal,
  addMeal,
  handleComidaChange,
  removeComida,
  addComida,
  styles,
}) => {
  return (
    <div className={styles.formSection}>
      <h2 className={styles.sectionTitle}>
        <Icons.Food /> Dietas
      </h2>
      {meals.map((meal, mealIndex) => (
        !meal._destroy && (
          <div key={mealIndex} className={styles.itemContainer}>
            <div className={styles.itemHeader}>
              <span className={styles.itemTitle}>Refeição {mealIndex + 1}</span>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeMeal(mealIndex)}
                aria-label={`Remover refeição ${mealIndex + 1}`}
              >
                <Icons.Minus />
              </button>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tipo de Refeição</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={meal.meal_type}
                  onChange={(e) => handleMealChange(mealIndex, 'meal_type', e.target.value)}
                  placeholder="Ex: Café da Manhã"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Dia da Semana</label>
                <select
                  className={styles.formSelect}
                  value={meal.weekday}
                  onChange={(e) => handleMealChange(mealIndex, 'weekday', e.target.value)}
                >
                  <option value="">Selecione</option>
                  {WeekdayOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.dynamicSection}>
              <h3 className={styles.sectionTitle}>Alimentos</h3>
              {meal.comidas_attributes.map((comida, comidaIndex) => (
                !comida._destroy && (
                  <div key={comidaIndex} className={styles.itemContainer}>
                    <div className={styles.itemHeader}>
                      <span className={styles.itemTitle}>Alimento {comidaIndex + 1}</span>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => removeComida(mealIndex, comidaIndex)}
                        aria-label={`Remover alimento ${comidaIndex + 1}`}
                      >
                        <Icons.Minus />
                      </button>
                    </div>
                    <div className={styles.formGrid}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Nome do Alimento</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={comida.name}
                          onChange={(e) =>
                            handleComidaChange(mealIndex, comidaIndex, 'name', e.target.value)
                          }
                          placeholder="Ex: Arroz"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Quantidade</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={comida.amount}
                          onChange={(e) =>
                            handleComidaChange(mealIndex, comidaIndex, 'amount', e.target.value)
                          }
                          placeholder="Ex: 100g"
                        />
                      </div>
                    </div>
                  </div>
                )
              ))}
              <button
                type="button"
                className={styles.addButton}
                onClick={() => addComida(mealIndex)}
                aria-label="Adicionar alimento"
              >
                <Icons.Plus /> Adicionar Alimento
              </button>
            </div>
          </div>
        )
      ))}
      <button
        type="button"
        className={styles.addButton}
        onClick={addMeal}
        aria-label="Adicionar refeição"
      >
        <Icons.Plus /> Adicionar Refeição
      </button>
    </div>
  );
};

export default MealForm;