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
import { API_URL } from '../services/api';
import { useTheme, DARK_MODE_KEY } from '../utils/ThemeContext';

// Définition de la constante utilisée pour l'authentification - identique à celle de App.js
const AUTH_KEY = 'user_auth_data';
const NOTIFICATIONS_KEY = 'notifications_enabled';
const PRIVACY_SETTINGS_KEY = 'privacy_settings';

const SettingsScreen = ({ navigation }) => {
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState('fr');
    const [privacySettings, setPrivacySettings] = useState({
        lastSeen: true,
        status: true,
        readReceipts: true
    });    useEffect(() => {
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

                // Récupérer les préférences de notifications
                const savedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
                if (savedNotifications !== null) {
                    setNotifications(JSON.parse(savedNotifications));
                }

                // Récupérer les paramètres de confidentialité
                const savedPrivacySettings = await AsyncStorage.getItem(PRIVACY_SETTINGS_KEY);
                if (savedPrivacySettings !== null) {
                    setPrivacySettings(JSON.parse(savedPrivacySettings));
                }

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

    const toggleDarkMode = async () => {
        try {
            const newValue = !darkMode;
            setDarkMode(newValue);
            await AsyncStorage.setItem(DARK_MODE_KEY, JSON.stringify(newValue));
            
            // Dans une vraie application, on utiliserait ici un contexte global pour 
            // appliquer le thème à toute l'application
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du mode sombre:', error);
            Alert.alert(
                translate('error', selectedLanguage),
                translate('settings_save_error', selectedLanguage) || 'Impossible de sauvegarder vos paramètres'
            );
        }
    };

    const toggleNotifications = async () => {
        try {
            const newValue = !notifications;
            setNotifications(newValue);
            await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(newValue));
            
            // Dans une vraie application, on enregistrerait ou désenregistrerait 
            // les notifications push ici
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des notifications:', error);
            Alert.alert(
                translate('error', selectedLanguage),
                translate('settings_save_error', selectedLanguage) || 'Impossible de sauvegarder vos paramètres'
            );
        }
    };

    const togglePrivacySetting = async (setting) => {
        try {
            const updatedSettings = {
                ...privacySettings,
                [setting]: !privacySettings[setting]
            };
            
            setPrivacySettings(updatedSettings);
            await AsyncStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(updatedSettings));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des paramètres de confidentialité:', error);
            Alert.alert(
                translate('error', selectedLanguage),
                translate('settings_save_error', selectedLanguage) || 'Impossible de sauvegarder vos paramètres'
            );
        }
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
                            await AsyncStorage.removeItem(AUTH_KEY);
                            // Rediriger vers l'écran de connexion
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } catch (error) {
                            console.error('Erreur lors de la déconnexion:', error);
                            Alert.alert(
                                translate('error', selectedLanguage),
                                translate('logout_error', selectedLanguage) || 'Impossible de vous déconnecter'
                            );
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            translate('delete_account', selectedLanguage) || 'Supprimer le compte',
            translate('delete_account_confirmation', selectedLanguage) || 'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
            [
                {
                    text: translate('cancel_button', selectedLanguage) || 'Annuler',
                    style: 'cancel'
                },
                {
                    text: translate('delete_button', selectedLanguage) || 'Supprimer',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            
                            // Dans une vraie application, on appellerait l'API pour supprimer le compte
                            // await axios.delete(`${API_URL}/users/id/${userInfo.id}`);
                            
                            // Simuler un appel API avec un délai
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            
                            // Supprimer toutes les données locales
                            await AsyncStorage.multiRemove([
                                AUTH_KEY,
                                DARK_MODE_KEY,
                                NOTIFICATIONS_KEY,
                                PRIVACY_SETTINGS_KEY
                            ]);
                            
                            // Rediriger vers l'écran de connexion
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } catch (error) {
                            console.error('Erreur lors de la suppression du compte:', error);
                            Alert.alert(
                                translate('error', selectedLanguage) || 'Erreur',
                                translate('delete_account_error', selectedLanguage) || 'Impossible de supprimer votre compte'
                            );
                        } finally {
                            setLoading(false);
                        }
                    },
                    style: 'destructive'
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
        <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <View style={[styles.header, { backgroundColor: theme.headerBackgroundColor, borderBottomColor: theme.borderColor }]}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.primaryColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.primaryColor }]}>
                    {translate('settings', selectedLanguage)}
                </Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={[styles.content, { backgroundColor: theme.backgroundColor }]}>                {/* Section profil utilisateur */}
                <TouchableOpacity
                    style={[styles.profileSection, { backgroundColor: theme.backgroundColor, borderBottomColor: theme.borderColor }]}
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
                        <Text style={[styles.profileName, { color: theme.textColor }]}>
                            {userInfo ? `${userInfo.first_name || ''} ${userInfo.last_name || ''}` : translate('user', selectedLanguage) || 'Utilisateur'}
                        </Text>
                        <Text style={[styles.profilePhone, { color: theme.placeholderTextColor }]}>
                            {userInfo ? userInfo.phone : ''}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color={theme.inactiveColor} />
                </TouchableOpacity>

                {/* Section pour le mode sombre */}                <View style={[styles.section, { backgroundColor: theme.backgroundColor, borderColor: theme.borderColor }]}>
                    <Text style={[styles.sectionTitle, { color: theme.placeholderTextColor }]}>
                        {translate('appearance', selectedLanguage)}
                    </Text>
                    <View style={[styles.settingItem, { borderBottomColor: theme.borderColor }]}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="moon-outline" size={24} color={theme.primaryColor} style={styles.settingIcon} />
                            <Text style={[styles.settingText, { color: theme.textColor }]}>
                                {translate('dark_mode', selectedLanguage)}
                            </Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#95a5a6", true: "#25D366" }}
                            thumbColor={isDarkMode ? "#FFFFFF" : "#FFFFFF"}
                            ios_backgroundColor="#95a5a6"
                            onValueChange={toggleTheme}
                            value={isDarkMode}
                        />
                    </View>
                </View>                {/* Section pour les notifications */}
                <View style={[styles.section, { backgroundColor: theme.backgroundColor, borderColor: theme.borderColor }]}>
                    <Text style={[styles.sectionTitle, { color: theme.placeholderTextColor }]}>
                        {translate('notifications', selectedLanguage)}
                    </Text>
                    <View style={[styles.settingItem, { borderBottomColor: theme.borderColor }]}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="notifications-outline" size={24} color={theme.primaryColor} style={styles.settingIcon} />
                            <Text style={[styles.settingText, { color: theme.textColor }]}>
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
                </View>                {/* Section pour la confidentialité */}
                <View style={[styles.section, { backgroundColor: theme.backgroundColor, borderColor: theme.borderColor }]}>
                    <Text style={[styles.sectionTitle, { color: theme.placeholderTextColor }]}>
                        {translate('privacy', selectedLanguage) || 'Confidentialité'}
                    </Text>
                    
                    <View style={[styles.settingItem, { borderBottomColor: theme.borderColor }]}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="eye-outline" size={24} color={theme.primaryColor} style={styles.settingIcon} />
                            <Text style={[styles.settingText, { color: theme.textColor }]}>
                                {translate('last_seen', selectedLanguage) || 'Dernière connexion'}
                            </Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#95a5a6", true: "#25D366" }}
                            thumbColor={privacySettings.lastSeen ? "#FFFFFF" : "#FFFFFF"}
                            ios_backgroundColor="#95a5a6"
                            onValueChange={() => togglePrivacySetting('lastSeen')}
                            value={privacySettings.lastSeen}
                        />
                    </View>
                      <View style={[styles.settingItem, { borderBottomColor: theme.borderColor }]}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="information-circle-outline" size={24} color={theme.primaryColor} style={styles.settingIcon} />
                            <Text style={[styles.settingText, { color: theme.textColor }]}>
                                {translate('status', selectedLanguage) || 'Statut'}
                            </Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#95a5a6", true: "#25D366" }}
                            thumbColor={privacySettings.status ? "#FFFFFF" : "#FFFFFF"}
                            ios_backgroundColor="#95a5a6"
                            onValueChange={() => togglePrivacySetting('status')}
                            value={privacySettings.status}
                        />
                    </View>
                    
                    <View style={[styles.settingItem, { borderBottomColor: theme.borderColor }]}>
                        <View style={styles.settingInfo}>
                            <Ionicons name="checkmark-done-outline" size={24} color={theme.primaryColor} style={styles.settingIcon} />
                            <Text style={[styles.settingText, { color: theme.textColor }]}>
                                {translate('read_receipts', selectedLanguage) || 'Confirmations de lecture'}
                            </Text>
                        </View>
                        <Switch
                            trackColor={{ false: "#95a5a6", true: "#25D366" }}
                            thumbColor={privacySettings.readReceipts ? "#FFFFFF" : "#FFFFFF"}
                            ios_backgroundColor="#95a5a6"
                            onValueChange={() => togglePrivacySetting('readReceipts')}
                            value={privacySettings.readReceipts}
                        />
                    </View>
                </View>                {/* Section pour la langue */}
                <View style={[styles.section, { backgroundColor: theme.backgroundColor, borderColor: theme.borderColor }]}>
                    <Text style={[styles.sectionTitle, { color: theme.placeholderTextColor }]}>
                        {translate('language', selectedLanguage)}
                    </Text>
                    {availableLanguages.map((language) => (
                        <TouchableOpacity
                            key={language.code}
                            style={[styles.settingItem, { borderBottomColor: theme.borderColor }]}
                            onPress={() => handleLanguageSelect(language.code)}
                        >
                            <View style={styles.settingInfo}>
                                <Ionicons
                                    name="globe-outline"
                                    size={24}
                                    color={theme.primaryColor}
                                    style={styles.settingIcon}
                                />
                                <Text style={[styles.settingText, { color: theme.textColor }]}>{language.name}</Text>
                            </View>
                            {selectedLanguage === language.code && (
                                <Ionicons name="checkmark" size={24} color={theme.primaryColor} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>                {/* Section pour la déconnexion */}
                <TouchableOpacity
                    style={[styles.section, styles.logoutSection, { backgroundColor: theme.backgroundColor, borderColor: theme.borderColor }]}
                    onPress={handleLogout}
                >
                    <View style={styles.settingInfo}>
                        <Ionicons name="log-out-outline" size={24} color={theme.dangerColor} style={styles.settingIcon} />
                        <Text style={[styles.settingText, styles.logoutText]}>
                            {translate('logout', selectedLanguage)}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Section pour supprimer le compte */}
                <TouchableOpacity
                    style={[styles.section, styles.dangerSection, { backgroundColor: theme.backgroundColor, borderColor: theme.borderColor }]}
                    onPress={handleDeleteAccount}
                >
                    <View style={styles.settingInfo}>
                        <Ionicons name="trash-outline" size={24} color={theme.dangerColor} style={styles.settingIcon} />
                        <Text style={[styles.settingText, styles.dangerText]}>
                            {translate('delete_account', selectedLanguage) || 'Supprimer le compte'}
                        </Text>
                    </View>
                </TouchableOpacity>                {/* Information sur la version */}
                <View style={[styles.versionContainer, { backgroundColor: theme.backgroundColor }]}>
                    <Text style={[styles.versionText, { color: theme.inactiveColor }]}>
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
        marginTop: 20,
    },
    logoutText: {
        color: '#e74c3c',
    },
    dangerSection: {
        marginTop: 20,
    },
    dangerText: {
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

// Assurez-vous que ce composant est bien exporté correctement
export default SettingsScreen;