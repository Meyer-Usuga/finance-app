import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { loadExpenses, saveExpenses, loadExtraIncomes, saveExtraIncomes } from '../utils/storage';
import './BackupManager.scss';

function BackupManager({ onRestore }) {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const data = {
      expenses: loadExpenses(),
      extraIncomes: loadExtraIncomes(),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.expenses || parsed.extraIncomes) {
          const exp = parsed.expenses || {};
          const ext = parsed.extraIncomes || {};
          saveExpenses(exp);
          saveExtraIncomes(ext);
          onRestore(exp, ext);
        } else {
          alert('El archivo no tiene el formato correcto para ser restaurado.');
        }
      } catch (error) {
        alert('Error al leer el archivo. Asegúrate de que sea el archivo JSON de respaldo.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="backup-manager">
      <button onClick={handleExport} className="backup-btn export" title="Descargar copia de seguridad">
        <Download size={14} /> Exportar Backup
      </button>
      <button onClick={() => fileInputRef.current.click()} className="backup-btn import" title="Restaurar de copia de seguridad">
        <Upload size={14} /> Importar Datos
      </button>
      <input 
        type="file" 
        accept=".json" 
        ref={fileInputRef} 
        onChange={handleImport} 
        style={{ display: 'none' }} 
      />
    </div>
  );
}

export default BackupManager;
