import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Alert,
    ScrollView,
    ActivityIndicator,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { translate, getCurrentLanguage, setLanguage, availableLanguages } from '../utils/i18nUtils';

const API_URL = 'http://192.168.230.82:5000/api';
const AUTH_KEY = 'user_auth_data';

const SettingsScreen = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState('fr');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);

                // Récupérer les données utilisateur
                const userData = await AsyncStorage.getItem(AUTH_KEY);
                if (userData) {
                    const parsedUserData = JSON.parse(userData);
                    setUserInfo(parsedUserData);
                }

                // Récupérer la langue sauvegardée
                const savedLanguage = await getCurrentLanguage();
                setSelectedLanguage(savedLanguage);

            } catch (error) {
                console.error('Erreur lors du chargement des paramètres:', error);
                Alert.alert(
                    translate('error', selectedLanguage),
                    translate('settings_load_error', selectedLanguage) || 'Impossible de charger vos paramètres'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleGoBack = () => {
        navigation.goBack();
    };

    const toggleDarkMode = () => {
        setDarkMode(previousState => !previousState);
        // Ici on pourrait sauvegarder ce paramètre
    };

    const toggleNotifications = () => {
        setNotifications(previousState => !previousState);
        // Ici on pourrait sauvegarder ce paramètre
    };

    const handleLanguageSelect = async (languageCode) => {
        try {
            setSelectedLanguage(languageCode);
            await setLanguage(languageCode);
            // Dans une vraie application, on changerait la langue de l'app ici
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la langue:', error);
            Alert.alert(
                translate('error', selectedLanguage),
                translate('language_save_error', selectedLanguage) || 'Impossible de sauvegarder votre choix de langue'
            );
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            translate('logout', selectedLanguage),
            translate('confirm_logout', selectedLanguage),
            [
                {
                    text: translate('cancel_button', selectedLanguage),
                    style: 'cancel'
                },
                {
                    text: translate('logout_button', selectedLanguage),
                    onPress: async () => {
                        try {
                            // Supprimer les données d'authentification
                            await AsyncStorage.removeItem(AUTH_KEY);

                            // Marquer l'utilisateur comme non authentifié
                            await AsyncStorage.setItem('isAuthenticated', 'false');

                            // Navigation vers l'écran Auth (pas Login)
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Auth' }],
                            });
                        } catch (error) {
                            console.error('Erreur lors de la déconnexion:', error);
                            Alert.alert(
                                translate('error', selectedLanguage),
                                translate('logout_error', selectedLanguage) || 'Impossible de se déconnecter'
                            );
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#128C7E" />
                <Text style={styles.loadingText}>
                    {translate('loading', selectedLanguage)}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#128C7E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {translate('settings', selectedLanguage)}
                </Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                {/* Section profil utilisateur */}
                <TouchableOpacity
                    style={styles.profileSection}
                    onPress={() => navigation.navigate('Profile', { phone: userInfo?.phone, userInfo })}
                >
                    <View style={styles.profileImageContainer}>
                        {userInfo && userInfo.logo ? (
                            <Image source={{ uri: userInfo.logo }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.profileImagePlaceholder}>
                                <Text style={styles.profileImageText}>
                                    {userInfo && userInfo.first_name ? userInfo.first_name.charAt(0).toUpperCase() : 'U'}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>
                            {userInfo ? `${userInfo.first_name || ''} ${userInfo.last_name || ''}` : translate('user', selectedLanguage) || 'Utilisateur'}
                        </Text>
                        <Text style={styles.profilePhone}>
                            {userInfo ? userInfo.phone : ''}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#95a5a6" />
                </TouchableOpacity>

                {/* Section pour le mode sombre */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {translate('appearance', selectedLanguage)}
                    </Text>
                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="moon-outline" size={24} color="#128C7E" style={styles.settingIcon} />
                            <Text style={styles.settingText}>
                                {translate('dark_mode', selectedLanguage)}
                            </Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#95a5a6", true: "#25D366" }}
                            thumbColor={darkMode ? "#FFFFFF" : "#FFFFFF"}
                            ios_backgroundColor="#95a5a6"
                            onValueChange={toggleDarkMode}
                            value={darkMode}
                        />
                    </View>
                </View>

                {/* Section pour les notifications */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {translate('notifications', selectedLanguage)}
                    </Text>
                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="notifications-outline" size={24} color="#128C7E" style={styles.settingIcon} />
                            <Text style={styles.settingText}>
                                {translate('enable_notifications', selectedLanguage)}
                            </Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#95a5a6", true: "#25D366" }}
                            thumbColor={notifications ? "#FFFFFF" : "#FFFFFF"}
                            ios_backgroundColor="#95a5a6"
                            onValueChange={toggleNotifications}
                            value={notifications}
                        />
                    </View>
                </View>

                {/* Section pour la langue */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        {translate('language', selectedLanguage)}
                    </Text>
                    {availableLanguages.map((language) => (
                        <TouchableOpacity
                            key={language.code}
                            style={styles.settingItem}
                            onPress={() => handleLanguageSelect(language.code)}
                        >
                            <View style={styles.settingInfo}>
                                <Ionicons
                                    name="globe-outline"
                                    size={24}
                                    color="#128C7E"
                                    style={styles.settingIcon}
                                />
                                <Text style={styles.settingText}>{language.name}</Text>
                            </View>
                            {selectedLanguage === language.code && (
                                <Ionicons name="checkmark" size={24} color="#128C7E" />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Section pour la déconnexion */}
                <TouchableOpacity
                    style={[styles.section, styles.logoutSection]}
                    onPress={handleLogout}
                >
                    <View style={styles.settingInfo}>
                        <Ionicons name="log-out-outline" size={24} color="#e74c3c" style={styles.settingIcon} />
                        <Text style={[styles.settingText, styles.logoutText]}>
                            {translate('logout', selectedLanguage)}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Information sur la version */}
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>
                        {translate('version', selectedLanguage, { version: '1.0.0' })}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#128C7E',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#7f8c8d',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    profileImageContainer: {
        marginRight: 16,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    profileImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#128C7E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImageText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    profilePhone: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 4,
    },
    section: {
        marginTop: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F0F0F0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#7f8c8d',
        marginVertical: 8,
        paddingHorizontal: 16,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingIcon: {
        marginRight: 16,
    },
    settingText: {
        fontSize: 16,
        color: '#2c3e50',
    },
    logoutSection: {
        marginTop: 40,
    },
    logoutText: {
        color: '#e74c3c',
    },
    versionContainer: {
        padding: 24,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 14,
        color: '#95a5a6',
    },
});

export default SettingsScreen;