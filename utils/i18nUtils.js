import AsyncStorage from '@react-native-async-storage/async-storage';

// Clé pour stocker la langue dans AsyncStorage
export const LANGUAGE_KEY = 'app_language';

// Langue par défaut
const DEFAULT_LANGUAGE = 'fr';

// Importation des fichiers de traduction
import frTranslations from '../translations/fr.json';
import enTranslations from '../translations/en.json';
import esTranslations from '../translations/es.json';
import deTranslations from '../translations/de.json';

// Dictionnaire des traductions disponibles
const translations = {
  fr: frTranslations,
  en: enTranslations,
  es: esTranslations,
  de: deTranslations,
};

// Langues disponibles dans l'application
export const availableLanguages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
];

/**
 * Récupère la langue actuelle de l'application depuis AsyncStorage
 * @returns {Promise<string>} Code de langue
 */
export const getCurrentLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    return savedLanguage || DEFAULT_LANGUAGE;
  } catch (error) {
    console.error('Erreur lors de la récupération de la langue:', error);
    return DEFAULT_LANGUAGE;
  }
};

/**
 * Change la langue de l'application
 * @param {string} languageCode - Code de la langue à définir
 * @returns {Promise<boolean>} - Succès ou échec
 */
export const setLanguage = async (languageCode) => {
  try {
    if (translations[languageCode]) {
      await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erreur lors du changement de langue:', error);
    return false;
  }
};

/**
 * Traduit un code dans la langue spécifiée
 * @param {string} code - Code de traduction à rechercher
 * @param {string} languageCode - Code de la langue (fr, en, es, de)
 * @param {Object} params - Paramètres à insérer dans la traduction
 * @returns {string|null} - Texte traduit ou null si non trouvé
 */
export const translate = (code, languageCode = DEFAULT_LANGUAGE, params = {}) => {
  // Vérifier si la langue existe
  if (!translations[languageCode]) {
    console.warn(`Langue non prise en charge: ${languageCode}, utilisation de ${DEFAULT_LANGUAGE}`);
    languageCode = DEFAULT_LANGUAGE;
  }

  // Récupérer la traduction
  const translation = translations[languageCode][code];
  
  // Si pas de traduction, renvoyer null
  if (!translation) {
    console.warn(`Traduction non trouvée pour le code: "${code}" en ${languageCode}`);
    return null;
  }

  // Remplacer les paramètres dans la traduction si nécessaire
  if (Object.keys(params).length > 0) {
    return Object.keys(params).reduce((text, key) => {
      return text.replace(new RegExp(`{${key}}`, 'g'), params[key]);
    }, translation);
  }

  return translation;
};

/**
 * Hook simplifié pour utiliser les traductions dans les composants React
 */
export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = React.useState(DEFAULT_LANGUAGE);

  React.useEffect(() => {
    const loadLanguage = async () => {
      const lang = await getCurrentLanguage();
      setCurrentLanguage(lang);
    };
    
    loadLanguage();
  }, []);

  const t = (code, params = {}) => translate(code, currentLanguage, params);

  return { t, currentLanguage, setLanguage };
};

export default {
  translate,
  getCurrentLanguage,
  setLanguage,
  availableLanguages,
  useTranslation,
};