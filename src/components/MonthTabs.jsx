import './MonthTabs.scss';

function MonthTabs({ months, selectedMonth, onSelect }) {
  return (
    <div className="month-tabs-container">
      <ul className="month-tabs">
        {months.map((month) => (
          <li key={month} className="month-tab-item">
            <button
              className={`month-button ${selectedMonth === month ? 'active' : ''}`}
              onClick={() => onSelect(month)}
            >
              {month}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MonthTabs;
