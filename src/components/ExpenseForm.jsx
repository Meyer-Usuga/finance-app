import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import './ExpenseForm.scss';

export const CATEGORIES = [
  'Casa',
  'Mascotas',
  'Transporte',
  'Compras por internet',
  'Salud y pensión',
  'Natillera',
  'Ahorro',
  'Otros'
];

function ExpenseForm({ onSubmit }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');

  const handleAmountChange = (e) => {

    const rawValue = e.target.value.replace(/\D/g, "");
    if (!rawValue) {
      setAmount("");
      return;
    }

    const formattedValue = new Intl.NumberFormat('es-CO').format(Number(rawValue));
    setAmount(formattedValue);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanAmount = amount.replace(/\./g, "");
    const parsedAmount = parseFloat(cleanAmount);
    
    if (!parsedAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Por favor ingresa un monto válido mayor a 0.");
      return;
    }

    onSubmit({ amount: parsedAmount, category, description: description.trim() });
    

    setAmount('');
    setCategory(CATEGORIES[0]);
    setDescription('');
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <select 
        value={category} 
        onChange={(e) => setCategory(e.target.value)}
        className="form-select"
      >
        {CATEGORIES.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      
      <input 
        type="text" 
        placeholder="Ej: Comida" 
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="form-input"
      />

      <input 
        type="tel" 
        placeholder="Monto ($)" 
        value={amount}
        onChange={handleAmountChange}
        className="form-input"
      />
      
      <button type="submit" className="form-submit" title="Añadir gasto">
        <PlusCircle size={20} />
      </button>
    </form>
  );
}

export default ExpenseForm;
