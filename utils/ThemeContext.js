import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clé utilisée pour stocker la préférence de thème
export const DARK_MODE_KEY = 'dark_mode';

// Définition des thèmes
export const themes = {
  light: {
    name: 'light',
    backgroundColor: '#FFFFFF',
    textColor: '#2c3e50',
    primaryColor: '#128C7E',
    secondaryColor: '#25D366',
    borderColor: '#F0F0F0',
    headerBackgroundColor: '#FFFFFF',
    placeholderTextColor: '#7f8c8d',
    dangerColor: '#e74c3c',
    inactiveColor: '#95a5a6'
  },
  dark: {
    name: 'dark',
    backgroundColor: '#121212',
    textColor: '#FFFFFF',
    primaryColor: '#128C7E',
    secondaryColor: '#25D366',
    borderColor: '#2c2c2c',
    headerBackgroundColor: '#1a1a1a',
    placeholderTextColor: '#a0a0a0',
    dangerColor: '#e74c3c',
    inactiveColor: '#6c757d'
  }
};

// Création du contexte
export const ThemeContext = createContext();

// Hook personnalisé pour utiliser le thème
export const useTheme = () => useContext(ThemeContext);

// Provider du thème
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(themes.light);
  const [isLoading, setIsLoading] = useState(true);

  // Charger la préférence de thème au démarrage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(DARK_MODE_KEY);
        if (savedTheme !== null) {
          const isDark = JSON.parse(savedTheme);
          setIsDarkMode(isDark);
          setTheme(isDark ? themes.dark : themes.light);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du thème:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  // Fonction pour basculer le thème
  const toggleTheme = async () => {
    try {
      const newValue = !isDarkMode;
      setIsDarkMode(newValue);
      setTheme(newValue ? themes.dark : themes.light);
      await AsyncStorage.setItem(DARK_MODE_KEY, JSON.stringify(newValue));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du thème:', error);
    }
  };

  // Fonction pour définir un thème spécifique
  const setThemeMode = async (isDark) => {
    try {
      setIsDarkMode(isDark);
      setTheme(isDark ? themes.dark : themes.light);
      await AsyncStorage.setItem(DARK_MODE_KEY, JSON.stringify(isDark));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du thème:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, setThemeMode, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};
