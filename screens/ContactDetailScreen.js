import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    StatusBar,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = 'http://89.80.190.158:5000/api';

const ContactDetailScreen = ({ route, navigation }) => {
    const { contact, userPhone } = route.params;
    
    const [firstName, setFirstName] = useState(contact.first_name || '');
    const [lastName, setLastName] = useState(contact.last_name || '');
    const [isEditing, setIsEditing] = useState(false);
    
    const handleSave = async () => {
        try {
            // Mise à jour du contact dans l'API
            await axios.put(`${API_URL}/friends/update`, {
                user_phone: userPhone,
                friend_phone: contact.phone_friend,
                first_name: firstName,
                last_name: lastName
            });
            
            // Retourner à l'écran des contacts avec les informations mises à jour
            navigation.navigate('Contacts', { refreshContacts: true });
            
        } catch (error) {
            console.error('Erreur lors de la mise à jour du contact :', error);
            Alert.alert('Erreur', 'Impossible de mettre à jour le contact');
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Confirmation',
            'Êtes-vous sûr de vouloir supprimer ce contact ?',
            [
                {
                    text: 'Annuler',
                    style: 'cancel'
                },
                {
                    text: 'Supprimer',
                    onPress: async () => {
                        try {
                            // Utilisation de l'ID de la relation pour la suppression
                            await axios.delete(`${API_URL}/friends/${contact._id}`);

                            // Retourner à l'écran des contacts
                            navigation.navigate('Contacts', { refreshContacts: true });

                        } catch (error) {
                            console.error('Erreur lors de la suppression du contact :', error);
                            Alert.alert('Erreur', 'Impossible de supprimer le contact');
                        }
                    },
                    style: 'destructive'
                }
            ]
        );
    };
    
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#075E54" barStyle="light-content" />
            
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="close-circle" size={26} color="#075E54" />
                </TouchableOpacity>
                
                <Text style={styles.headerTitle}>Détails du contact</Text>
                
                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={handleDelete}
                >
                    <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>
            
            <View style={styles.content}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Prénom</Text>
                    <TextInput
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Prénom"
                    />
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Nom</Text>
                    <TextInput
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Nom"
                    />
                </View>
                
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Numéro de téléphone</Text>
                    <TextInput
                        style={[styles.input, styles.disabledInput]}
                        value={contact.phone_friend}
                        editable={false}
                    />
                </View>
                
                <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>Enregistrer</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#075E54',
    },
    closeButton: {
        padding: 8,
    },
    deleteButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DCE0E9',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#F9FAFB',
    },
    disabledInput: {
        backgroundColor: '#EFEFEF',
        color: '#666',
    },
    saveButton: {
        backgroundColor: '#075E54',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ContactDetailScreen;