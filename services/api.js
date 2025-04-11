import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://89.80.190.158:5000/api';

export const checkAndHandleAuth = async (navigation) => {
    try {
        const userData = await AsyncStorage.getItem(AUTH_KEY);

        if (!userData) {
            // Aucune donnée d'authentification trouvée, rediriger vers l'écran d'authentification
            navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }]
            });
            return false;
        }

        // Utilisateur authentifié
        return JSON.parse(userData);
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }]
        });
        return false;
    }
};

export const checkUserExists = async (phone) => {
    try {
        const response = await axios.get(`${API_URL}/users/${phone}`);
        return { exists: true, user: response.data };
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return { exists: false };
        }
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/users`, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMessages = async (userPhone) => {
    try {
        const response = await axios.get(`${API_URL}/messages/${userPhone}`);
        console.log('Réponse API (getMessages):', response.data);
        return response.data;
    } catch (error) {
        // Si l'erreur est 404, renvoyer un tableau vide au lieu de lancer une erreur
        if (error.response && error.response.status === 404) {
            console.log("Aucun message trouvé pour l'utilisateur:", userPhone);
            return []; // Retourner un tableau vide au lieu de lancer une erreur
        }

        // Pour les autres erreurs, continuer à les lancer
        console.error("Erreur API dans getMessages:", error.message, error.response?.data);
        throw error;
    }
};

export const sendMessage = async (messageData) => {
    try {
        // Récupérer le numéro de téléphone du sender depuis AsyncStorage
        const sender = await AsyncStorage.getItem('userPhone');

        if (!sender) {
            throw new Error('Utilisateur non authentifié');
        }

        // Vérification des champs obligatoires
        if (!messageData.message || !messageData.receiver) {
            throw new Error('Les champs message et receiver sont obligatoires');
        }

        // Construction de l'objet avec le sender récupéré automatiquement
        const requiredData = {
            message: messageData.message,
            sender: sender,
            receiver: messageData.receiver,
        };

        // Envoi à l'API
        const response = await axios.post(`${API_URL}/messages`, requiredData);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de l'envoi du message:", error);
        throw error;
    }
}

export const getFriends = async (userPhone) => {
    try {
        const response = await axios.get(`${API_URL}/friends/${userPhone}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};