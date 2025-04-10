import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

const API_URL = 'http://89.80.190.158:5000/api';

const ProfileScreen = ({ route, navigation }) => {
    const { phone, userInfo } = route.params;

    const [loading, setLoading] = useState(false);
    const [fetchingProfile, setFetchingProfile] = useState(true);
    const [firstName, setFirstName] = useState(userInfo?.first_name || '');
    const [lastName, setLastName] = useState(userInfo?.last_name || '');
    const [logo, setLogo] = useState(userInfo?.logo || '');

    // Effet pour charger les informations utilisateur depuis le serveur au chargement de la page
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setFetchingProfile(true);
                const response = await axios.get(`${API_URL}/users/${phone}`);
                const userData = response.data;

                if (userData) {
                    setFirstName(userData.first_name || '');
                    setLastName(userData.last_name || '');
                    setLogo(userData.logo || '');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données utilisateur:', error);
                Alert.alert("Erreur", "Impossible de récupérer les informations du profil");
            } finally {
                setFetchingProfile(false);
            }
        };

        fetchUserData();
    }, [phone]); // Dépendance à phone pour que l'effet se relance si le numéro change

    const handleSave = async () => {
        if (!firstName.trim()) {
            return Alert.alert("Erreur", "Le prénom est requis");
        }

        if (!lastName.trim()) {
            return Alert.alert("Erreur", "Le nom est requis");
        }

        try {
            setLoading(true);

            const userData = {
                first_name: firstName,
                last_name: lastName,
                logo: logo
            };

            await axios.put(`${API_URL}/users/${phone}`, userData);

            Alert.alert(
                "Succès",
                "Profil mis à jour avec succès",
                [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            Alert.alert("Erreur", "Impossible de mettre à jour le profil");
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert("Permission refusée", "Nous avons besoin de l'accès à votre galerie pour changer votre photo de profil");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                // Dans une vraie application, vous téléchargeriez l'image sur un serveur
                // Pour simplifier, nous utilisons un avatar généré avec le nom
                setLogo(`https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&size=200`);
            }
        } catch (error) {
            console.error('Erreur lors de la sélection de l\'image:', error);
            Alert.alert("Erreur", "Impossible de sélectionner l'image");
        }
    };

    if (loading || fetchingProfile) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#128C7E" />
                <Text style={styles.loadingText}>
                    {loading ? "Mise à jour du profil..." : "Chargement du profil..."}
                </Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : null}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Modifier le profil</Text>
                    <View style={{ width: 24 }}>
                        {/* Pour centrer le titre */}
                    </View>
                </View>

                <View style={styles.profileImageContainer}>
                    <TouchableOpacity onPress={pickImage}>
                        {logo ? (
                            <Image source={{ uri: logo }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Text style={styles.placeholderText}>
                                    {firstName ? firstName.charAt(0) : ''}{lastName ? lastName.charAt(0) : ''}
                                </Text>
                            </View>
                        )}
                        <View style={styles.cameraIconContainer}>
                            <Ionicons name="camera" size={20} color="#FFFFFF" />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Prénom</Text>
                    <TextInput
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Entrez votre prénom"
                    />

                    <Text style={styles.label}>Nom</Text>
                    <TextInput
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Entrez votre nom"
                    />

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Enregistrer</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F7F7F7',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#128C7E',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#128C7E',
        padding: 15,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    profileImageContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#128C7E',
    },
    placeholderImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#128C7E',
    },
    placeholderText: {
        fontSize: 32,
        color: '#128C7E',
        fontWeight: 'bold',
    },
    cameraIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#128C7E',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    formContainer: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        color: '#333333',
        marginBottom: 5,
        marginTop: 15,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 5,
        padding: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    saveButton: {
        backgroundColor: '#128C7E',
        borderRadius: 5,
        padding: 15,
        alignItems: 'center',
        marginTop: 30,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ProfileScreen;