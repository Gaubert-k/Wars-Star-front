// screens/MessagesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConversationsList from '../components/ConversationsList';
import { getMessages, checkUserExists } from '../services/api';

const MessagesScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [userPhone, setUserPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newContactPhone, setNewContactPhone] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fonction pour récupérer le numéro de téléphone de l'utilisateur
  const getUserPhone = async () => {
    try {
      const userData = await AsyncStorage.getItem('user_auth_data');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        const phone = parsedUserData.phone || parsedUserData._id;
        setUserPhone(phone);
        return phone;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du numéro:', error);
      Alert.alert('Erreur', 'Impossible de récupérer votre numéro de téléphone');
      return null;
    }
  };

  // Chargement initial
  useEffect(() => {
    const loadInitialData = async () => {
      const phone = await getUserPhone();
      if (phone) {
        fetchMessages(phone);
      } else {
        setLoading(false);
      }
    };

    loadInitialData();

    // Rafraîchir lors du focus de l'écran
    const unsubscribe = navigation.addListener('focus', async () => {
      const phone = await getUserPhone();
      if (phone) {
        fetchMessages(phone);
      }
    });

    return unsubscribe;
  }, [navigation]);

  // Fonction pour organiser les messages par contact
  const organizeConversationsByContact = (messages, userPhone) => {
    if (!messages || messages.length === 0) {
      return [];
    }

    const conversationsMap = {};

    // Regrouper les messages par contact
    messages.forEach(message => {
      // Vérifier que le message contient toutes les informations nécessaires
      if (!message.sender || !message.receiver || !message.time) {
        console.warn("Message ignoré car incomplet:", message);
        return;
      }

      // Déterminer qui est l'autre personne dans la conversation
      const otherPerson = message.sender === userPhone ? message.receiver : message.sender;

      if (!conversationsMap[otherPerson]) {
        conversationsMap[otherPerson] = {
          contactPhone: otherPerson,
          sender: otherPerson,  // Nécessaire pour ConversationsList
          messages: []
        };
      }

      conversationsMap[otherPerson].messages.push(message);
    });

    // Convertir la map en tableau et trier les messages par date
    return Object.values(conversationsMap)
        .map(conversation => {
          // Trier les messages du plus récent au plus ancien
          conversation.messages.sort((a, b) => new Date(b.time) - new Date(a.time));
          // Ajouter le dernier message comme propriété pour faciliter l'affichage
          conversation.lastMessage = conversation.messages[0];
          return conversation;
        })
        // Trier les conversations par date du dernier message
        .sort((a, b) => new Date(b.lastMessage.time) - new Date(a.lastMessage.time));
  };

  // Fonction pour récupérer les messages
  const fetchMessages = async (phone) => {
    setLoading(true);
    try {
      console.log('Début appel API pour récupérer les messages...');
      const messages = await getMessages(phone);
      console.log(`${messages.length} messages reçus depuis l'API`);

      // Organiser les messages par conversation
      const conversationsList = organizeConversationsByContact(messages, phone);

      // Récupérer les détails des contacts pour chaque conversation
      const conversationsWithDetails = await Promise.all(
          conversationsList.map(async (conv) => {
            try {
              const details = await checkUserExists(conv.contactPhone);
              if (details && details.user) {
                // Ajouter les détails du contact à la conversation
                return {
                  ...conv,
                  first_name: details.user.first_name || '',
                  last_name: details.user.last_name || '',
                  contactDetails: details.user
                };
              }
              return {
                ...conv,
                first_name: 'Contact',
                last_name: conv.contactPhone,
                contactDetails: { phone: conv.contactPhone }
              };
            } catch (error) {
              console.error('Erreur lors de la vérification du contact:', error);
              return {
                ...conv,
                first_name: 'Contact',
                last_name: conv.contactPhone,
                contactDetails: { phone: conv.contactPhone }
              };
            }
          })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error.message);

      let errorMessage = "Une erreur est survenue lors du chargement des messages.";
      if (error.response?.status === 404) {
        errorMessage = "Aucun message trouvé.";
        setConversations([]);
      } else {
        errorMessage = "Erreur réseau ou serveur, vérifiez votre connexion.";
      }

      Alert.alert('Erreur de chargement', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fonction pour rafraîchir les conversations
  const onRefresh = async () => {
    setRefreshing(true);
    const phone = await getUserPhone();
    if (phone) {
      fetchMessages(phone);
    } else {
      setRefreshing(false);
    }
  };

  // Fonction pour démarrer une nouvelle conversation
  const handleNewConversation = async () => {
    if (!newContactPhone || newContactPhone.trim() === '') {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return;
    }

    try {
      const result = await checkUserExists(newContactPhone.trim());
      if (result && result.user) {
        setModalVisible(false);
        setNewContactPhone('');

        navigation.navigate('Conversation', {
          contact: {
            phone_friend: newContactPhone.trim(),
            first_name: result.user.first_name || 'Contact',
            last_name: result.user.last_name || newContactPhone.trim()
          },
          userPhone: userPhone
        });
      } else {
        Alert.alert('Erreur', 'Ce contact n\'existe pas dans l\'application');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du contact:', error);
      Alert.alert('Erreur', 'Impossible de vérifier ce contact, réessayez plus tard');
    }
  };

  return (
      <View style={styles.container}>
        {loading && !refreshing ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#075E54" />
              <Text style={styles.loadingText}>Chargement des conversations...</Text>
            </View>
        ) : (
            <>
              {conversations.length === 0 ? (
                  <View style={styles.centered}>
                    <Ionicons name="chatbubble-ellipses-outline" size={100} color="#075E54" />
                    <Text style={styles.noMessagesText}>Aucune conversation</Text>
                    <Text style={styles.startNewText}>Commencez une nouvelle conversation</Text>
                  </View>
              ) : (
                  <ConversationsList
                      conversations={conversations}
                      navigation={navigation}
                      userPhone={userPhone}
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                  />
              )}

              <TouchableOpacity
                  style={styles.newMessageButton}
                  onPress={() => setModalVisible(true)}
              >
                <Ionicons name="create" size={24} color="white" />
              </TouchableOpacity>
            </>
        )}

        {/* Modal pour nouvelle conversation */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.modalContainer}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Nouvelle conversation</Text>

                  <TextInput
                      style={styles.input}
                      placeholder="Numéro de téléphone"
                      keyboardType="phone-pad"
                      value={newContactPhone}
                      onChangeText={setNewContactPhone}
                  />

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={() => {
                          setModalVisible(false);
                          setNewContactPhone('');
                        }}
                    >
                      <Text style={styles.buttonText}>Annuler</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.confirmButton]}
                        onPress={handleNewConversation}
                    >
                      <Text style={styles.buttonText}>Démarrer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#075E54',
  },
  noMessagesText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#075E54',
  },
  startNewText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  newMessageButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    margin: 20,
  },
  modalContent: {
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
    marginBottom: 20,
    textAlign: 'center',
    color: '#075E54',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#888',
  },
  confirmButton: {
    backgroundColor: '#075E54',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MessagesScreen;