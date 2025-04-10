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
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {checkUserExists, createUser} from "../services/api";

const API_URL = 'http://89.80.190.158:5000/api';
const AUTH_KEY = 'user_auth_data';

const AuthScreen = ({ navigation }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'MainApp' }],
                        });
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
                // Utilisateur existe, sauvegarder ses informations
                await saveAuthData({
                    phone: phoneNumber,
                    ...result.user
                });
            } else {
                // Utilisateur n'existe pas, le créer
                const newUser = {
                    phone: phoneNumber,
                    first_name: 'Utilisateur',
                    last_name: 'Nouveau',
                    logo: `https://ui-avatars.com/api/?name=Utilisateur+Nouveau&background=random`
                };

                const createdUser = await createUser(newUser);

                // Sauvegarder les informations du nouvel utilisateur
                await saveAuthData({
                    phone: phoneNumber,
                    ...createdUser
                });
            }

            // Naviguer vers l'application principale
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainApp' }],
            });
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            Alert.alert('Erreur', 'Impossible de se connecter. Serveur indisponible ou problème réseau.');
        } finally {
            setIsLoading(false);
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

    // Afficher un indicateur de chargement pendant la vérification de l'authentification
    if (isCheckingAuth) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#128C7E" />
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.logoContainer}>
                <Image
                    source={{ uri: 'https://placekitten.com/200/200' }} // Image placeholder
                    style={styles.logo}
                />
                <Text style={styles.appName}>Wars-star</Text>
                <Text style={styles.tagline}>Connectez-vous simplement</Text>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.inputLabel}>Numéro de téléphone</Text>
                <TextInput
                    style={styles.input}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Entrez votre numéro de téléphone"
                    keyboardType="phone-pad"
                    maxLength={15}
                />

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.loginButtonText}>Se connecter</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#F5F5F5',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#128C7E',
        marginTop: 10,
    },
    tagline: {
        fontSize: 16,
        color: '#666',
        marginTop: 5,
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    inputLabel: {
        fontSize: 16,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#128C7E',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AuthScreen;
