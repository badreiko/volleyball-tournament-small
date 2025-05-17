import ru from './ru';
import cs from './cs';
import LanguageSwitcherComponent from './LanguageSwitcher.jsx';

const translations = {
  ru,
  cs,
};

// Default language
let currentLanguage = localStorage.getItem('language') || 'ru';

// Set the language
export const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
  }
};

// Get current language
export const getLanguage = () => currentLanguage;

// Get translation function
export const t = (key, params = {}) => {
  const keys = key.split('.');
  let translation = translations[currentLanguage];
  
  for (const k of keys) {
    if (!translation || !translation[k]) {
      // Fallback to Russian if key not found in current language
      translation = translations['ru'];
      for (const fallbackKey of keys) {
        if (!translation || !translation[fallbackKey]) {
          return key; // If key not found in fallback, return the key itself
        }
        translation = translation[fallbackKey];
      }
      break;
    }
    translation = translation[k];
  }
  
  // Replace parameters
  if (typeof translation === 'string' && Object.keys(params).length > 0) {
    return Object.entries(params).reduce(
      (str, [key, value]) => str.replace(new RegExp(`{${key}}`, 'g'), value),
      translation
    );
  }
  
  return translation;
};

// Export the LanguageSwitcher component
export const LanguageSwitcher = LanguageSwitcherComponent;

// Simple hook to force rerender when language changes
export const useTranslation = () => {
  return { t, currentLanguage, setLanguage };
};

export default {
  t,
  getLanguage,
  setLanguage,
  LanguageSwitcher,
  useTranslation,
};