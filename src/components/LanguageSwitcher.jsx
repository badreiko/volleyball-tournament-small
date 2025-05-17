import React from 'react';
import { getCurrentLanguage, setLanguage, getTranslations } from '../locales';

const LanguageSwitcher = () => {
  const currentLang = getCurrentLanguage();
  const t = getTranslations();

  const handleLanguageChange = (lang) => {
    if (lang !== currentLang) {
      setLanguage(lang);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{t.language}:</span>
      <div className="flex gap-1">
        <button
          onClick={() => handleLanguageChange('ru')}
          className={`px-2 py-1 text-xs rounded-md transition-colors ${
            currentLang === 'ru' 
              ? 'bg-[#0B8E8D] text-white' 
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          {t.languages.ru}
        </button>
        <button
          onClick={() => handleLanguageChange('cs')}
          className={`px-2 py-1 text-xs rounded-md transition-colors ${
            currentLang === 'cs' 
              ? 'bg-[#0B8E8D] text-white' 
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          {t.languages.cs}
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
