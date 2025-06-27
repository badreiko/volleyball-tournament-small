import { useState, useEffect } from 'react';
import { FaGlobe } from 'react-icons/fa';
import { setLanguage, getLanguage, t } from '.';

const LanguageSwitcher = ({ className, darkMode }) => {
  const [currentLang, setCurrentLang] = useState(getLanguage() || 'ru');

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCurrentLang(newLang);
    // Перезагрузка не нужна, если используем React Context для локализации
    // Но пока добавим небольшую задержку и перезагрузку страницы
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Определяем стили для темной и светлой темы
  const selectStyles = darkMode 
    ? "bg-gray-800 border-gray-600 text-white focus:ring-cyan focus:border-cyan" 
    : "bg-white border-[#0B8E8D] text-[#06324F] focus:ring-[#0B8E8D] focus:border-[#0B8E8D]";

  const iconStyles = darkMode ? "text-cyan" : "text-cyan";

  return (
    <div className={`flex items-center ${className || ''}`}>
      <FaGlobe className={`mr-2 ${iconStyles}`} />
      <select 
        value={getLanguage()} 
        onChange={handleLanguageChange} 
        className={`rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${selectStyles}`}
      >
        <option value="ru" className={darkMode ? "bg-gray-800 text-white" : "bg-white text-[#06324F]"}>
          Русский
        </option>
        <option value="cs" className={darkMode ? "bg-gray-800 text-white" : "bg-white text-[#06324F]"}>
          Česky
        </option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;