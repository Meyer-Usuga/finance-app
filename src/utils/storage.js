const STORAGE_KEY = 'finance_app_data';
const EXTRA_INCOMES_KEY = 'finance_app_extra_incomes';

export const loadExpenses = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading expenses from storage:', error);
    return {};
  }
};

export const saveExpenses = (expenses) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving expenses to storage:', error);
  }
};

export const loadExtraIncomes = () => {
  try {
    const data = localStorage.getItem(EXTRA_INCOMES_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    return {};
  }
};

export const saveExtraIncomes = (incomes) => {
  try {
    localStorage.setItem(EXTRA_INCOMES_KEY, JSON.stringify(incomes));
  } catch (error) {
    console.error('Error saving extra incomes', error);
  }
};
