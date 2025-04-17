import { useState } from 'react';
import { FaDownload, FaUpload, FaTrash, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import { exportData, importData, clearTournamentState } from '../utils/storage';

const DataManagement = ({ onBack }) => {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [exportResult, setExportResult] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const handleExportData = () => {
    const success = exportData();
    setExportResult({
      success,
      message: success 
        ? 'Данные успешно экспортированы' 
        : 'Произошла ошибка при экспорте данных'
    });
    
    // Скрываем сообщение через 3 секунды
    setTimeout(() => {
      setExportResult(null);
    }, 3000);
  };
  
  const handleImportClick = () => {
    setImporting(true);
    setImportResult(null);
  };
  
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImporting(false);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = event.target.result;
        const success = importData(jsonData);
        
        setImportResult({
          success,
          message: success 
            ? 'Данные успешно импортированы' 
            : 'Произошла ошибка при импорте данных'
        });
        
        // Скрываем сообщение через 3 секунды
        setTimeout(() => {
          setImportResult(null);
        }, 3000);
      } catch (error) {
        setImportResult({
          success: false,
          message: 'Произошла ошибка при обработке файла'
        });
      }
      
      setImporting(false);
    };
    
    reader.onerror = () => {
      setImportResult({
        success: false,
        message: 'Ошибка чтения файла'
      });
      setImporting(false);
    };
    
    reader.readAsText(file);
  };
  
  const handleClearData = () => {
    clearTournamentState();
    window.location.reload(); // Перезагружаем страницу для обновления интерфейса
  };
  
  return (
    <div className="p-4 md:p-6">
      <button onClick={onBack} className="mb-4 flex items-center text-darkBlue hover:text-cyan transition-colors">
        <FaDownload className="mr-2" /> Назад
      </button>
      
      <div className="card mx-auto max-w-xl fade-in">
        <h2 className="text-2xl font-bold text-darkBlue mb-6 flex items-center">
          <FaDownload className="mr-3 text-cyan" /> Управление данными
        </h2>
        
        <div className="space-y-6">
          {/* Экспорт данных */}
          <div className="bg-gradient-to-r from-cyan/10 to-darkBlue/5 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-darkBlue mb-3">Экспорт данных</h3>
            <p className="text-darkBlue/80 mb-4">
              Сохраните все данные турниров, историю и рейтинги игроков в файл JSON для резервного копирования или переноса на другое устройство.
            </p>
            <button 
              onClick={handleExportData} 
              className="btn btn-cyan w-full sm:w-auto flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Экспортировать данные
            </button>
            
            {exportResult && (
              <div className={`mt-3 p-2 rounded-lg text-sm flex items-center ${
                exportResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {exportResult.success ? <FaCheck className="mr-2" /> : <FaExclamationTriangle className="mr-2" />}
                {exportResult.message}
              </div>
            )}
          </div>
          
          {/* Импорт данных */}
          <div className="bg-gradient-to-r from-cyan/10 to-darkBlue/5 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-darkBlue mb-3">Импорт данных</h3>
            <p className="text-darkBlue/80 mb-4">
              Загрузите ранее экспортированный файл JSON для восстановления данных о турнирах, истории и рейтингах игроков.
            </p>
            
            {!importing ? (
              <button 
                onClick={handleImportClick} 
                className="btn btn-cyan w-full sm:w-auto flex items-center justify-center"
              >
                <FaUpload className="mr-2" /> Импортировать данные
              </button>
            ) : (
              <div className="bg-white p-3 rounded-lg border border-darkBlue/20">
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleFileSelect} 
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan file:text-white hover:file:bg-cyan/90"
                />
              </div>
            )}
            
            {importResult && (
              <div className={`mt-3 p-2 rounded-lg text-sm flex items-center ${
                importResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {importResult.success ? <FaCheck className="mr-2" /> : <FaExclamationTriangle className="mr-2" />}
                {importResult.message}
              </div>
            )}
          </div>
          
          {/* Очистка данных */}
          <div className="bg-gradient-to-r from-accent/10 to-darkBlue/5 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-darkBlue mb-3">Очистка данных</h3>
            <p className="text-darkBlue/80 mb-4">
              Удаление текущего турнира. Это действие нельзя отменить.
            </p>
            
            {!showClearConfirm ? (
              <button 
                onClick={() => setShowClearConfirm(true)} 
                className="btn btn-accent w-full sm:w-auto flex items-center justify-center"
              >
                <FaTrash className="mr-2" /> Очистить текущий турнир
              </button>
            ) : (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-red-800 mb-3 flex items-center">
                  <FaExclamationTriangle className="mr-2" /> Вы уверены? Это действие нельзя отменить.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowClearConfirm(false)} 
                    className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex-1"
                  >
                    Отмена
                  </button>
                  <button 
                    onClick={handleClearData} 
                    className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 flex-1"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;