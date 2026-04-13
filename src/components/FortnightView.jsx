import { useState } from 'react';
import ExpenseForm, { CATEGORIES } from './ExpenseForm';
import { Trash2, Edit2, Check, Copy, ClipboardPaste, GripVertical, X, CheckCircle2, Circle, Plus } from 'lucide-react';
import './FortnightView.scss';

function FortnightView({ month, expenses, extraIncomes, balances, onAddExpense, onDeleteExpense, onEditExpense, onToggleExpense, onSetExtraIncome, clipboardExpense, setClipboardExpense, onMoveExpense }) {
  const fortnight15 = expenses['15'] || [];
  const fortnight30 = expenses['30'] || [];

  const bal15 = balances['15'];
  const bal30 = balances['30'];
  const ext15 = extraIncomes['15'] || 0;
  const ext30 = extraIncomes['30'] || 0;

  const renderFortnight = (day, data, balanceData, extraIncomeVal) => {
    const { carryover, salary, extraIncome, baseBalance, totalExpenses, disponible } = balanceData;
    const porcentajeGastado = baseBalance > 0 ? ((totalExpenses / baseBalance) * 100).toFixed(1) : 0;
    const porcentajeDisponible = baseBalance > 0 ? (100 - porcentajeGastado).toFixed(1) : 0;

    const handleDragStart = (e, sourceDay, expense) => {
      e.dataTransfer.setData('application/json', JSON.stringify({
        sourceMonth: month,
        sourceDay: String(sourceDay),
        expense
      }));

      e.target.style.opacity = '0.4';
    };

    const handleDragEnd = (e) => {
      e.target.style.opacity = '1';
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.currentTarget.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
      e.currentTarget.classList.remove('drag-over');
    };

    const handleDrop = (e, destDay) => {
      e.preventDefault();
      e.currentTarget.classList.remove('drag-over');
      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        const { sourceMonth, sourceDay, expense } = data;


        if (sourceMonth !== month || sourceDay !== String(destDay)) {
          onMoveExpense(sourceMonth, sourceDay, month, String(destDay), expense);
        }
      } catch (error) {
        console.error('Drop error', error);
      }
    };

    return (
      <div className="fortnight-column">
        <div className="fortnight-header">
          <h3>Día {day}</h3>
          {clipboardExpense && (
            <button
              className="paste-button"
              onClick={() => onAddExpense(month, String(day), clipboardExpense)}
              title={`Pegar: ${clipboardExpense.category} ($${clipboardExpense.amount.toLocaleString('es-CO')})`}
            >
              <ClipboardPaste size={16} />
              <span>Pegar</span>
            </button>
          )}
        </div>

        <div className="financial-summary">
          <div className="summary-row carryover">
            <span>Arrastre Anterior:</span>
            <span>${carryover.toLocaleString('es-CO')}</span>
          </div>
          <div className="summary-row salary">
            <span>Sueldo Quincenal:</span>
            <span>${salary.toLocaleString('es-CO')}</span>
          </div>
          
          <ExtraIncomeRow 
            income={extraIncomeVal}
            onSave={(val) => onSetExtraIncome(month, String(day), val)}
          />

          <div className="summary-separator"></div>

          <div className="summary-row base">
            <span><strong>Saldo Base:</strong></span>
            <span><strong>${baseBalance.toLocaleString('es-CO')}</strong></span>
          </div>

          <div className="summary-row expenses">
            <span>Total Gastos:</span>
            <span>-${totalExpenses.toLocaleString('es-CO')}</span>
          </div>

          <div className="summary-separator"></div>

          <div className="summary-row final">
            <span>Disponible:</span>
            <strong className={disponible < 0 ? 'negative' : ''}>
              ${disponible.toLocaleString('es-CO')}
            </strong>
          </div>

          {baseBalance > 0 && (
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className={`progress-fill ${porcentajeGastado > 85 ? 'danger' : porcentajeGastado > 60 ? 'warning' : ''}`}
                  style={{ width: `${Math.min(porcentajeGastado, 100)}%` }}
                ></div>
              </div>
              <div className="progress-labels">
                <span>Gastado: {porcentajeGastado}%</span>
                <span>Queda: {Math.max(porcentajeDisponible, 0)}%</span>
              </div>
            </div>
          )}
        </div>

        <ExpenseForm
          onSubmit={(expense) => onAddExpense(month, String(day), expense)}
        />

        <div className="expense-list"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, day)}
          onDragLeave={handleDragLeave}
        >
          {data.length === 0 ? (
            <p className="empty-state">No hay gastos registrados aún.</p>
          ) : (
            data.map((expense) => (
              <ExpenseItemRow
                key={expense.id}
                expense={expense}
                month={month}
                day={day}
                onDelete={onDeleteExpense}
                onCopy={(exp) => setClipboardExpense({ category: exp.category, description: exp.description, amount: exp.amount })}
                onEdit={onEditExpense}
                onToggle={onToggleExpense}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fortnight-view-container">
      {renderFortnight(15, fortnight15, bal15, ext15)}
      {renderFortnight(30, fortnight30, bal30, ext30)}
    </div>
  );
}

function ExtraIncomeRow({ income, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState('');

  const startEdit = () => {
    setTempVal(income === 0 ? '' : new Intl.NumberFormat('es-CO').format(income));
    setIsEditing(true);
  };

  const save = () => {
    const parsed = parseFloat(tempVal.replace(/\D/g, ""));
    onSave(isNaN(parsed) ? 0 : parsed);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') save();
  };

  if (isEditing) {
    return (
      <div className="summary-row extra-income edit-mode">
        <span>Prima / Extras:</span>
        <div className="income-input-group">
          <input
            type="tel"
            autoFocus
            value={tempVal}
            onKeyDown={handleKeyDown}
            onChange={e => {
              const r = e.target.value.replace(/\D/g, "");
              setTempVal(r ? new Intl.NumberFormat('es-CO').format(Number(r)) : '');
            }}
            placeholder="Monto"
          />
          <div className="income-actions">
            <button onClick={save} className="save-btn" title="Guardar"><Check size={16} /></button>
            <button onClick={() => setIsEditing(false)} className="cancel-btn" title="Cancelar"><X size={16} /></button>
          </div>
        </div>
      </div>
    );
  }

  if (income === 0) {
    return (
      <div className="summary-row extra-income add-mode">
        <button className="add-extra-btn" onClick={startEdit}>
          <Plus size={14} /> Añadir Prima o Extras
        </button>
      </div>
    );
  }

  return (
    <div className="summary-row extra-income">
      <span>Prima / Extras:</span>
      <div className="income-display">
        <span className="positive">+${income.toLocaleString('es-CO')}</span>
        <div className="income-actions">
          <button onClick={startEdit} className="edit-btn" title="Editar"><Edit2 size={14} /></button>
          <button onClick={() => onSave(0)} className="delete-btn" title="Eliminar"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}

function ExpenseItemRow({ expense, day, month, onDelete, onCopy, onEdit, onToggle, onDragStart, onDragEnd }) {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  const startEdit = () => {
    setAmount(new Intl.NumberFormat('es-CO').format(expense.amount));
    setCategory(expense.category);
    setDescription(expense.description || '');
    setIsEditing(true);
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (!rawValue) {
      setAmount("");
      return;
    }
    setAmount(new Intl.NumberFormat('es-CO').format(Number(rawValue)));
  };

  const saveEdit = () => {
    const parsedAmount = parseFloat(amount.replace(/\./g, ""));
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Por favor ingresa un monto válido mayor a 0.");
      return;
    }
    onEdit(month, String(day), expense.id, { amount: parsedAmount, category, description: description.trim() });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="expense-item editing">
        <div className="expense-edit-form">
          <select value={category} onChange={e => setCategory(e.target.value)} className="form-select">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descripción"
            className="form-input"
          />
          <input
            type="tel"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Monto"
            className="form-input amount"
          />
        </div>
        <div className="expense-actions">
          <button className="save-button" onClick={saveEdit} title="Guardar"><Check size={16} /></button>
          <button className="cancel-button" onClick={() => setIsEditing(false)} title="Cancelar"><X size={16} /></button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`expense-item ${expense.completed ? 'completed' : ''}`}
      draggable={true}
      onDragStart={(e) => onDragStart(e, day, expense)}
      onDragEnd={onDragEnd}
    >
      <div className="expense-info">
        <div className="drag-handle" title="Arrastrar para mover">
          <GripVertical size={16} />
        </div>
        <div className="expense-category-container">
          <span className="expense-category">{expense.category}</span>
          {expense.description && (
            <span className="expense-description"> - {expense.description}</span>
          )}
        </div>
        <span className="expense-amount">-${expense.amount.toLocaleString('es-CO')}</span>
      </div>
      <div className="expense-actions">
        <button
          className="toggle-button"
          onClick={() => onToggle(month, String(day), expense.id)}
          title={expense.completed ? "Revertir estado" : "Marcar como pagado"}
        >
          {expense.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
        </button>
        <button className="edit-button" onClick={startEdit} title="Editar gasto"><Edit2 size={16} /></button>
        <button className="copy-button" onClick={() => onCopy(expense)} title="Copiar gasto"><Copy size={16} /></button>
        <button className="delete-button" onClick={() => onDelete(month, String(day), expense.id)} title="Eliminar gasto"><Trash2 size={18} /></button>
      </div>
    </div>
  );
}

export default FortnightView;
