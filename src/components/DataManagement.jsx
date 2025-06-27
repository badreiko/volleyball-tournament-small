import { useState, useEffect } from 'react';
import { FaDownload, FaUpload, FaTrash, FaExclamationTriangle, FaCheck, FaArrowLeft } from 'react-icons/fa';
import { exportData, importData, clearTournamentState } from '../utils/storage';
import { t } from '../localization';

const DataManagement = ({ onBack }) => {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [exportResult, setExportResult] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const handleExportData = async () => {
    const success = await exportData();
    setExportResult({
      success,
      message: success 
        ? t('dataManagement.exportSuccess')
        : t('dataManagement.exportError')
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
    reader.onload = async (event) => {
      try {
        const jsonData = event.target.result;
        const success = await importData(jsonData);
        
        setImportResult({
          success,
          message: success 
            ? t('dataManagement.importSuccess')
            : t('dataManagement.importError')
        });
        
        // Скрываем сообщение через 3 секунды
        setTimeout(() => {
          setImportResult(null);
        }, 3000);
      } catch (error) {
        setImportResult({
          success: false,
          message: t('dataManagement.fileError')
        });
      }
      
      setImporting(false);
    };
    
    reader.onerror = () => {
      setImportResult({
        success: false,
        message: t('dataManagement.readError')
      });
      setImporting(false);
    };
    
    reader.readAsText(file);
  };
  
  const handleClearData = async () => {
    await clearTournamentState();
    window.location.reload(); // Перезагружаем страницу для обновления интерфейса
  };
  
  return (
    <div className="p-4 md:p-6 pb-16">
      <button onClick={onBack} className="mb-4 flex items-center text-darkBlue hover:text-cyan transition-colors">
        <FaArrowLeft className="mr-2" /> {t('common.back')}
      </button>
      
      <div className="card mx-auto max-w-xl fade-in">
        <h2 className="text-2xl font-bold text-darkBlue mb-6 flex items-center">
          <FaDownload className="mr-3 text-cyan" /> {t('dataManagement.title')}
        </h2>
        
        <div className="space-y-6">
          {/* Экспорт данных */}
          <div className="bg-gradient-to-r from-cyan/10 to-darkBlue/5 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-darkBlue mb-3">{t('dataManagement.exportData')}</h3>
            <p className="text-darkBlue/80 mb-4">
              {t('dataManagement.exportDescription')}
            </p>
            <button 
              onClick={handleExportData} 
              className="btn btn-cyan w-full sm:w-auto flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> {t('dataManagement.exportButton')}
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
            <h3 className="text-lg font-semibold text-darkBlue mb-3">{t('dataManagement.importData')}</h3>
            <p className="text-darkBlue/80 mb-4">
              {t('dataManagement.importDescription')}
            </p>
            
            {!importing ? (
              <button 
                onClick={handleImportClick} 
                className="btn btn-cyan w-full sm:w-auto flex items-center justify-center"
              >
                <FaUpload className="mr-2" /> {t('dataManagement.importButton')}
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
            <h3 className="text-lg font-semibold text-darkBlue mb-3">{t('dataManagement.dataClear')}</h3>
            <p className="text-darkBlue/80 mb-4">
              {t('dataManagement.clearDescription')}
            </p>
            
            {!showClearConfirm ? (
              <button 
                onClick={() => setShowClearConfirm(true)} 
                className="btn btn-accent w-full sm:w-auto flex items-center justify-center"
              >
                <FaTrash className="mr-2" /> {t('dataManagement.clearButton')}
              </button>
            ) : (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-red-800 mb-3 flex items-center">
                  <FaExclamationTriangle className="mr-2" /> {t('dataManagement.clearConfirm')}
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowClearConfirm(false)} 
                    className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex-1"
                  >
                    {t('common.cancel')}
                  </button>
                  <button 
                    onClick={handleClearData} 
                    className="py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 flex-1"
                  >
                    {t('common.delete')}
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