import React from 'react';
import { InputField, SelectField } from '../components/UserFormComponents'
import * as Icons from '../components/Icons';
import styles from '../styles/UserForm.module.css';
import { WeekdayOptions } from './FormConstants';
 
interface Comida {
  id: number | null;
  name: string;
  amount: string;
  _destroy: boolean;
}

interface Meal {
  id: number | null;
  meal_type: string;
  weekday: string;
  _destroy: boolean;
  comidas_attributes: Comida[];
}

interface MealProps {
  meals: Meal[];
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
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3>Dietas</h3>
        <button type="button" className={styles.addButton} onClick={addMeal} aria-label="Adicionar nova refeição">
          <Icons.Plus /> Adicionar Refeição
        </button>
      </div>
      
      {meals.map((meal, mealIndex) =>
        !meal._destroy ? (
          <div className={styles.groupCard} key={meal.id || `meal-${mealIndex}`}>
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
              {meal.comidas_attributes.map((comida: Comida, comidaIndex: number) =>
                !comida._destroy ? (
                  <div className={styles.foodItem} key={comida.id || `comida-${comidaIndex}`}>
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
                    />
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => removeComida(mealIndex, comidaIndex)}
                      aria-label="Remover comida"
                    >
                      ✕
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
        ) : null
      )}
    </div>
  );
};

export default MealForm;