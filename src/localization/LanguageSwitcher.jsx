import { useState, useEffect } from 'react';
import { FaGlobe } from 'react-icons/fa';
import { setLanguage, getLanguage, t } from '.';

const LanguageSwitcher = ({ className }) => {
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

  return (
    <div className={`flex items-center ${className || ''}`}>
      <FaGlobe className="mr-2 text-cyan" />
      <select 
        value={getLanguage()} 
        onChange={handleLanguageChange} 
        className={className}
      >
        <option value="ru">Русский</option>
        <option value="cs">Česky</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;