import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { checkUserExists, createUser } from './api'; // Assurez-vous que ce chemin est correct

export const checkAuthStatus = async () => {
    try {
        const userData = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_KEY);
        return !!userData;
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        return false;
    }
};

export const processAuthentication = async (phoneNumber, firstName, lastName) => {
    try {
        // Vérifier si l'utilisateur existe
        const result = await checkUserExists(phoneNumber);

        if (result.exists) {
            // L'utilisateur existe, mettre à jour les données locales
            await saveAuthData({
                phone: phoneNumber,
                ...result.user
            });
            return true;
        } else {
            // L'utilisateur n'existe pas, le créer
            const newUser = {
                phone: phoneNumber,
                first_name: firstName || 'Utilisateur',
                last_name: lastName || 'Nouveau',
                logo: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`
            };

            const createdUser = await createUser(newUser);

            // Mettre à jour les données locales
            await saveAuthData({
                phone: phoneNumber,
                ...createdUser
            });
            return true;
        }
    } catch (error) {
        console.error('Erreur lors de l\'authentification:', error);
        return false;
    }
};

export const saveAuthData = async (userData) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_KEY, JSON.stringify(userData));
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des données d\'authentification:', error);
    }
};