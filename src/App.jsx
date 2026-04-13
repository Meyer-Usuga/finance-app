import { useState, useEffect } from 'react';
import MonthTabs from './components/MonthTabs';
import FortnightView from './components/FortnightView';
import BackupManager from './components/BackupManager';
import { loadExpenses, saveExpenses, loadExtraIncomes, saveExtraIncomes } from './utils/storage';
import { Wallet } from 'lucide-react';
import './App.scss';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function App() {
  const currentMonthIndex = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[currentMonthIndex]);
  const [expenses, setExpenses] = useState(() => loadExpenses());
  const [extraIncomes, setExtraIncomes] = useState(() => loadExtraIncomes());
  const [clipboardExpense, setClipboardExpense] = useState(null);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveExtraIncomes(extraIncomes);
  }, [extraIncomes]);

  const handleSetExtraIncome = (month, fortnight, amount) => {
    setExtraIncomes(prev => ({
      ...prev,
      [month]: {
        ...(prev[month] || {}),
        [fortnight]: amount
      }
    }));
  };

  const handleRestore = (importedExpenses, importedExtraIncomes) => {
    setExpenses(importedExpenses);
    setExtraIncomes(importedExtraIncomes);
  };

  const handleAddExpense = (month, fortnight, expense) => {
    setExpenses(prev => {
      const expenseObj = expense.id ? expense : { ...expense, id: crypto.randomUUID() };
      return {
        ...prev,
        [month]: {
          ...(prev[month] || {}),
          [fortnight]: [
            ...(prev[month]?.[fortnight] || []),
            expenseObj
          ]
        }
      };
    });
  };

  const handleDeleteExpense = (month, fortnight, id) => {
    setExpenses(prev => {
      return {
        ...prev,
        [month]: {
          ...(prev[month] || {}),
          [fortnight]: (prev[month]?.[fortnight] || []).filter(
            exp => exp.id !== id
          )
        }
      };
    });
  };

  const handleMoveExpense = (sourceMonth, sourceDay, destMonth, destDay, expense) => {
    setExpenses(prev => {
      const newState = JSON.parse(JSON.stringify(prev));


      if (newState[sourceMonth] && newState[sourceMonth][sourceDay]) {
        newState[sourceMonth][sourceDay] = newState[sourceMonth][sourceDay].filter(
          e => e.id !== expense.id
        );
      }


      if (!newState[destMonth]) newState[destMonth] = {};
      if (!newState[destMonth][destDay]) newState[destMonth][destDay] = [];
      newState[destMonth][destDay].push(expense);

      return newState;
    });
  };

  const handleEditExpense = (month, fortnight, id, updatedExpense) => {
    setExpenses(prev => {
      return {
        ...prev,
        [month]: {
          ...(prev[month] || {}),
          [fortnight]: (prev[month]?.[fortnight] || []).map(exp =>
            exp.id === id ? { ...updatedExpense, id } : exp
          )
        }
      };
    });
  };

  const handleToggleExpense = (month, fortnight, id) => {
    setExpenses(prev => {
      return {
        ...prev,
        [month]: {
          ...(prev[month] || {}),
          [fortnight]: (prev[month]?.[fortnight] || []).map(exp =>
            exp.id === id ? { ...exp, completed: !exp.completed } : exp
          )
        }
      };
    });
  };

  const FORTNIGHT_SALARY = 2000000;
  const balances = {};
  let carryover = 0;
  let hasStarted = false;

  MONTHS.forEach(month => {
    balances[month] = { '15': {}, '30': {} };
    ['15', '30'].forEach(day => {
      if (month === 'Abril' && day === '15') {
        hasStarted = true;
        carryover = 300000; 
      }

      const fnExpenses = (expenses[month] && expenses[month][day]) || [];
      const totalExp = fnExpenses.reduce((acc, curr) => acc + curr.amount, 0);

      const extraIncome = (extraIncomes[month] && extraIncomes[month][day]) || 0;

      if (!hasStarted) {
        balances[month][day] = {
          carryover: 0,
          salary: 0,
          extraIncome: 0,
          baseBalance: 0,
          totalExpenses: totalExp,
          disponible: 0
        };
      } else {
        const baseBalance = carryover + FORTNIGHT_SALARY + extraIncome;
        const disponible = baseBalance - totalExp;
        
        balances[month][day] = {
          carryover,
          salary: FORTNIGHT_SALARY,
          extraIncome,
          baseBalance,
          totalExpenses: totalExp,
          disponible
        };
        
        carryover = disponible;
      }
    });
  });

  return (
    <div className="app-container">
      <main className="app-main">
        <BackupManager onRestore={handleRestore} />
        
        <MonthTabs
          months={MONTHS}
          selectedMonth={selectedMonth}
          onSelect={setSelectedMonth}
        />

        <div className="month-content">
          <h2 className="month-title">Resumen de {selectedMonth}</h2>
          <FortnightView
            month={selectedMonth}
            expenses={expenses[selectedMonth] || {}}
            extraIncomes={extraIncomes[selectedMonth] || {}}
            balances={balances[selectedMonth]}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            onEditExpense={handleEditExpense}
            onToggleExpense={handleToggleExpense}
            onSetExtraIncome={handleSetExtraIncome}
            onMoveExpense={handleMoveExpense}
            clipboardExpense={clipboardExpense}
            setClipboardExpense={setClipboardExpense}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
