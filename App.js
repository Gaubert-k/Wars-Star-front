// src/App.js
import React, { useState, useEffect } from 'react';
import AppNavigator from './navigation/AppNavigator';
import LoadingSpinner from './components/common/LoadingSpinner';
import { checkAuthStatus } from './services/authService';

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuthStatus = async () => {
        try {
            const userData = await AsyncStorage.getItem(AUTH_KEY);
            const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
            return userData !== null && isAuthenticated === 'true';
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'authentification:', error);
            return false;
        }
    };

    useEffect(() => {
        const initializeApp = async () => {
            const authStatus = await checkAuthStatus();
            setIsAuthenticated(authStatus);
            setIsLoading(false);
        };
        initializeApp();
    }, []);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return <AppNavigator isAuthenticated={isAuthenticated} />;
}