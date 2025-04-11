// src/App.js
import React, { useState, useEffect } from 'react';
import AppNavigator from './navigation/AppNavigator';
import LoadingSpinner from './components/common/LoadingSpinner';
import { checkAuthStatus } from './services/authService';

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

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