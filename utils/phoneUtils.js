import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import * as Contacts from 'expo-contacts';

export const getPhoneNumber = async () => {
    try {
        // Vérifier d'abord la plateforme
        if (Platform.OS === 'android') {
            return await getPhoneNumberAndroid();
        } else if (Platform.OS === 'ios') {
            return await getPhoneNumberIOS();
        } else {
            // Pour le développement Web ou autres plateformes
            return promptForPhoneNumber();
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du numéro de téléphone:', error);
        return promptForPhoneNumber();
    }
};

const getPhoneNumberAndroid = async () => {
    try {
        // Demander la permission de lire les contacts
        const { status } = await Contacts.requestPermissionsAsync();

        if (status === 'granted') {
            // Essayer de récupérer le numéro via les contacts
            return await getPhoneFromContacts();
        } else {
            // Si les permissions ne sont pas accordées
            return promptForPhoneNumber();
        }
    } catch (error) {
        console.error('Erreur sur Android:', error);
        return promptForPhoneNumber();
    }
};

const getPhoneNumberIOS = async () => {
    try {
        // Sur iOS nous essayons d'obtenir le numéro via les contacts
        return await getPhoneFromContacts();
    } catch (error) {
        console.error('Erreur sur iOS:', error);
        return promptForPhoneNumber();
    }
};

const getPhoneFromContacts = async () => {
    try {
        const { status } = await Contacts.requestPermissionsAsync();

        if (status === 'granted') {
            const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.PhoneNumbers],
            });

            // Trouver un contact avec le numéro de téléphone (idéalement le propriétaire)
            if (data.length > 0) {
                // Trier les contacts pour essayer de trouver "Moi" ou le propriétaire
                const myContact = data.find(c => {
                    const name = (c.name || '').toLowerCase();
                    return name.includes('moi') || name.includes('me') || name.includes('owner') ||
                        name.includes('my') || name.includes('personal');
                });

                const contactToUse = myContact || data.find(c => c.phoneNumbers && c.phoneNumbers.length > 0);

                if (contactToUse && contactToUse.phoneNumbers && contactToUse.phoneNumbers.length > 0) {
                    const number = cleanPhoneNumber(contactToUse.phoneNumbers[0].number);
                    return number;
                }
            }
        }

        return promptForPhoneNumber();
    } catch (error) {
        console.error('Erreur lors de l\'accès aux contacts:', error);
        return promptForPhoneNumber();
    }
};

const promptForPhoneNumber = () => {
    // Cette fonction retourne une promesse qui sera résolue
    // lorsque l'utilisateur aura saisi son numéro
    return '';
};

const cleanPhoneNumber = (number) => {
    if (!number) return '';

    // Supprimer tous les caractères non numériques
    let cleaned = number.replace(/\D/g, '');

    // Si le numéro commence par un code pays (comme +33 pour la France)
    // Supprimer le premier chiffre (généralement 0 ou 1) si nécessaire
    if (cleaned.length > 10) {
        // Prendre les 10 derniers chiffres
        cleaned = cleaned.slice(-10);
    }

    return cleaned;
};