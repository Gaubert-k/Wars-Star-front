import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkUserExists, createUser } from "../services/api";

const API_URL = 'http://192.168.230.82:5000/api';
const AUTH_KEY = 'user_auth_data';

const AuthScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [showNewUserForm, setShowNewUserForm] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // Vérification de l'authentification au chargement
    useEffect(() => {
        checkExistingAuth();
    }, []);

    // Fonction pour vérifier si l'utilisateur est déjà authentifié
    const checkExistingAuth = async () => {
        try {
            const userData = await AsyncStorage.getItem(AUTH_KEY);

            if (userData) {
                const parsedUserData = JSON.parse(userData);
                const phoneNumber = parsedUserData.phone;

                try {
                    // Vérifier si l'utilisateur existe
                    const result = await checkUserExists(phoneNumber);

                    if (result.exists) {
                        // L'utilisateur existe, mettre à jour les données locales si nécessaire
                        await saveAuthData({
                            phone: phoneNumber,
                            ...result.user
                        });

                        // Naviguer vers l'app principale
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'MainApp' }],
                        });
                    } else {
                        // L'utilisateur n'existe pas, le créer
                        const newUser = {
                            phone: phoneNumber,
                            first_name: parsedUserData.first_name || 'Utilisateur',
                            last_name: parsedUserData.last_name || 'Nouveau',
                            logo: parsedUserData.logo || `https://ui-avatars.com/api/?name=Utilisateur+Nouveau&background=random`
                        };

                        const createdUser = await createUser(newUser);

                        // Mettre à jour les données locales
                        await saveAuthData({
                            phone: phoneNumber,
                            ...createdUser
                        });

                        // Naviguer vers l'app principale
                        navigation.replace('MainApp');

                    }
                } catch (error) {
                    console.error('Erreur lors de la vérification/création de l\'utilisateur:', error);
                    // En cas d'erreur réseau ou serveur, on reste sur l'écran de connexion
                    setIsCheckingAuth(false);
                }
            } else {
                // Pas de données utilisateur, afficher l'écran de connexion
                setIsCheckingAuth(false);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'authentification:', error);
            setIsCheckingAuth(false);
        }
    };

    const handleLogin = async () => {
        // Validation basique du numéro de téléphone
        if (!phoneNumber || phoneNumber.length < 10) {
            Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
            return;
        }

        setIsLoading(true);

        try {
            // Vérifier si l'utilisateur existe déjà
            const result = await checkUserExists(phoneNumber);

            if (result.exists) {
                // Utilisateur existe, sauvegarder les données et continuer
                await saveAuthData({
                    phone: phoneNumber,
                    ...result.user
                });

                setIsLoading(false);
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainApp' }],
                });
            } else {
                // Nouvel utilisateur, demander des informations supplémentaires
                setIsLoading(false);
                setShowNewUserForm(true);
            }
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            setIsLoading(false);
            Alert.alert('Erreur', 'Impossible de se connecter. Veuillez réessayer.');
        }
    };

    const handleCreateUser = async () => {
        if (!firstName || !lastName) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setIsLoading(true);

        try {
            const newUser = {
                phone: phoneNumber,
                first_name: firstName,
                last_name: lastName,
                logo: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`
            };

            const createdUser = await createUser(newUser);

            // Sauvegarder les données d'authentification
            await saveAuthData({
                phone: phoneNumber,
                ...createdUser
            });

            setIsLoading(false);
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainApp' }],
            });
        } catch (error) {
            console.error('Erreur lors de la création du compte:', error);
            setIsLoading(false);
            Alert.alert('Erreur', 'Impossible de créer le compte. Veuillez réessayer.');
        }
    };

    // Fonction pour sauvegarder les données d'authentification
    const saveAuthData = async (userData) => {
        try {
            await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(userData));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des données d\'authentification:', error);
        }
    };

    if (isCheckingAuth) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={styles.loadingText}>Vérification de la connexion...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <Image
                    source={require('../assets/favicon.png')}
                    style={styles.logo}
                />

                <Text style={styles.title}>
                    {showNewUserForm ? 'Créer un compte' : 'Connexion'}
                </Text>

                {showNewUserForm ? (
                    <View style={styles.inputContainer}>
                        <Text style={styles.phoneLabel}>Votre numéro: {phoneNumber}</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Prénom"
                            value={firstName}
                            onChangeText={setFirstName}
                            autoCapitalize="words"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Nom"
                            value={lastName}
                            onChangeText={setLastName}
                            autoCapitalize="words"
                        />

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleCreateUser}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Créer mon compte</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => setShowNewUserForm(false)}
                            disabled={isLoading}
                        >
                            <Text style={styles.secondaryButtonText}>Retour</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.inputContainer}>
                        <Text style={styles.subtitle}>
                            Entrez votre numéro de téléphone pour vous connecter
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Numéro de téléphone"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Se connecter</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 30,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#666',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007BFF',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
    phoneLabel: {
        fontSize: 16,
        marginBottom: 15,
        fontWeight: 'bold',
        color: '#555',
    },
    secondaryButton: {
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    secondaryButtonText: {
        color: '#007BFF',
        fontSize: 16,
    },
});

export default AuthScreen;