import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    ActivityIndicator,
    TextInput,
    Modal,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.230.82:5000/api';
const AUTH_KEY = 'user_auth_data';

const ContactsScreen = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [friends, setFriends] = useState([]);
    const [friendsDetails, setFriendsDetails] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [newFriendPhone, setNewFriendPhone] = useState('');
    const [addingFriend, setAddingFriend] = useState(false);

    useEffect(() => {
        // Récupérer les données utilisateur depuis le stockage local
        const getUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem(AUTH_KEY);
                if (userData) {
                    const parsedUserData = JSON.parse(userData);
                    setUserInfo(parsedUserData);
                    setUserPhone(parsedUserData.phone);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données utilisateur:', error);
            }
        };

        getUserData();
    }, []);


    useEffect(() => {
        // Charger les amis de l'utilisateur seulement si on a le numéro de téléphone
        const fetchFriends = async () => {
            if (!userPhone) return;

            try {
                setLoading(true);

                // Si on a déjà les informations de l'utilisateur à partir d'AsyncStorage,
                // on peut éviter cet appel API
                if (!userInfo) {
                    try {
                        const userResponse = await axios.get(`${API_URL}/users/${userPhone}`);
                        setUserInfo(userResponse.data);
                    } catch (apiError) {
                        console.error('Erreur API lors de la récupération des infos utilisateur:', apiError);
                        // Si l'API échoue, on continue quand même avec les données locales
                    }
                }

                // Récupérer la liste des amis
                try {
                    const friendsResponse = await axios.get(`${API_URL}/friends/${userPhone}`);
                    setFriends(friendsResponse.data || []);
                } catch (error) {
                    console.error('Erreur lors de la récupération des amis:', error);
                    setFriends([]);
                }

            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, [userPhone]);

    useEffect(() => {
        // Récupérer les détails pour chaque ami
        const fetchFriendsDetails = async () => {
            if (friends.length === 0) {
                setFriendsDetails([]);
                return;
            }

            try {
                const detailsPromises = friends.map(async (friend) => {
                    try {
                        // Tenter de récupérer les détails de l'utilisateur ami
                        const response = await axios.get(`${API_URL}/users/${friend.phone_friend}`);
                        return {
                            ...friend,
                            first_name: response.data.first_name || '',
                            last_name: response.data.last_name || '',
                            logo: response.data.logo || '',
                            phone: friend.phone_friend
                        };
                    } catch (error) {
                        // Si l'ami n'a pas de compte, on retourne juste son numéro
                        return {
                            ...friend,
                            first_name: '',
                            last_name: '',
                            logo: '',
                            phone: friend.phone_friend
                        };
                    }
                });

                const details = await Promise.all(detailsPromises);
                setFriendsDetails(details);
            } catch (error) {
                console.error('Erreur lors de la récupération des détails des amis:', error);
            }
        };

        fetchFriendsDetails();
    }, [friends]);

    const handleLogoPress = () => {
        // Navigation vers l'écran de profil avec les informations utilisateur
        navigation.navigate('Profile', {
            phone: userPhone,
            userInfo: userInfo
        });
    };

    const handleSettingsPress = () => {
        // Navigation vers l'écran des paramètres
        navigation.navigate('Settings');
    };

    const handleAddFriend = async () => {
        if (!newFriendPhone.trim()) {
            Alert.alert("Erreur", "Veuillez saisir un numéro de téléphone");
            return;
        }

        try {
            setAddingFriend(true);

            const friendData = {
                phone_user: userPhone,
                phone_friend: newFriendPhone,
                messages: []
            };

            await axios.post(`${API_URL}/friends`, friendData);

            // Rafraîchir la liste des amis
            const friendsResponse = await axios.get(`${API_URL}/friends/${userPhone}`);
            setFriends(friendsResponse.data || []);

            // Fermer la modal et réinitialiser le champ
            setModalVisible(false);
            setNewFriendPhone('');

            Alert.alert("Succès", "Ami ajouté avec succès");
        } catch (error) {
            console.error('Erreur lors de l\'ajout d\'un ami:', error);
            Alert.alert("Erreur", "Impossible d'ajouter cet ami");
        } finally {
            setAddingFriend(false);
        }
    };

    // Filtrer les amis selon la recherche
    const filteredFriends = friendsDetails.filter(friend => {
        const fullName = `${friend.first_name} ${friend.last_name}`.toLowerCase();
        const phone = friend.phone.toLowerCase();
        const query = searchQuery.toLowerCase();

        return fullName.includes(query) || phone.includes(query);
    });

    const renderFriendItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.friendItem}
                onPress={() => navigation.navigate('ContactDetail', { contact: item, userPhone: userPhone })}
            >
                {/* Votre code existant pour afficher le contact */}
                <View style={styles.avatarContainer}>
                    {item.logo ? (
                        <Image source={{ uri: item.logo }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.noAvatar]}>
                            <Text style={styles.avatarText}>
                                {item.first_name.charAt(0).toUpperCase() || '?'}
                            </Text>
                        </View>
                    )}
                </View>
                <View style={styles.friendDetails}>
                    <Text style={styles.friendName}>
                        {`${item.first_name || ''} ${item.last_name || ''}`}
                    </Text>
                    <Text style={styles.friendPhone}>{item.phone_friend}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleLogoPress}>
                    {userInfo && userInfo.logo ? (
                        <Image source={{ uri: userInfo.logo }} style={styles.userImage} />
                    ) : (
                        <View style={styles.userImagePlaceholder}>
                            <Text style={styles.userImageText}>
                                {userInfo && userInfo.first_name ? userInfo.first_name.charAt(0).toUpperCase() : 'U'}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Wars Star</Text>
                <TouchableOpacity onPress={handleSettingsPress}>
                    <Ionicons name="settings-outline" size={24} color="#128C7E" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher..."
                    placeholderTextColor="#7f8c8d"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#128C7E" />
                    <Text style={styles.loadingText}>Chargement des contacts...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredFriends}
                    renderItem={renderFriendItem}
                    keyExtractor={(item) => item._id.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={60} color="#128C7E" />
                            <Text style={styles.emptyText}>Aucun ami à afficher</Text>
                            <Text style={styles.emptySubText}>Appuyez sur le + pour ajouter des amis</Text>
                        </View>
                    }
                />
            )}

            {/* FAB pour ajouter un ami */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={30} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Modal pour ajouter un ami */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Ajouter un ami</Text>

                        <Text style={styles.modalLabel}>Numéro de téléphone</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Ex: 0601020304"
                            value={newFriendPhone}
                            onChangeText={setNewFriendPhone}
                            keyboardType="phone-pad"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                                disabled={addingFriend}
                            >
                                <Text style={styles.buttonText}>Annuler</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.addButtonModal]}
                                onPress={handleAddFriend}
                                disabled={addingFriend}
                            >
                                {addingFriend ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.buttonText}>Ajouter</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#128C7E',
    },
    userImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userImagePlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#128C7E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userImageText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F3F3',
        borderRadius: 20,
        margin: 16,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: '#2c3e50',
    },
    listContainer: {
        paddingHorizontal: 16,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    contactImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    contactImagePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#DCF8C6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactImageText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#128C7E',
    },
    contactInfo: {
        marginLeft: 16,
        flex: 1,
    },
    contactName: {
        fontSize: 17,
        fontWeight: '500',
        color: '#2c3e50',
    },
    contactPhone: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#7f8c8d',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 8,
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#128C7E',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#128C7E',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalLabel: {
        fontSize: 16,
        color: '#2c3e50',
        marginBottom: 5,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#E5E5E5',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#95a5a6',
        marginRight: 10,
    },
    addButtonModal: {
        backgroundColor: '#128C7E',
        marginLeft: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ContactsScreen;