import ru from './ru';
import cs from './cs';

const locales = {
  ru,
  cs
};

// Получаем текущий язык из localStorage или используем русский по умолчанию
export const getCurrentLanguage = () => {
  return localStorage.getItem('language') || 'ru';
};

// Устанавливаем язык
export const setLanguage = (lang) => {
  if (locales[lang]) {
    localStorage.setItem('language', lang);
    // Перезагружаем страницу для применения изменений
    window.location.reload();
  }
};

// Получаем строки для текущего языка
export const getTranslations = () => {
  const currentLang = getCurrentLanguage();
  return locales[currentLang] || locales.ru; // Русский как запасной вариант
};

export default {
  getCurrentLanguage,
  setLanguage,
  getTranslations
};
