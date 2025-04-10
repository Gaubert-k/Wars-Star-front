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
import { getMessages, getFriends } from '../services/api';

const MessagesScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [userPhone, setUserPhone] = useState('0123456789');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newContactPhone, setNewContactPhone] = useState('');

  useEffect(() => {
    fetchMessages(userPhone);

    // Rafraîchir lors du focus de l'écran
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMessages(userPhone);
    });

    return unsubscribe;
  }, [navigation, userPhone]);

  const fetchMessages = async (phone) => {
    setLoading(true);
    try {
      // Récupérer tous les amis (contacts)
      const friends = await getFriends(phone);

      // Pour chaque ami, récupérer les messages
      const conversationsData = [];

      if (friends && friends.length > 0) {
        // Créer un tableau de promesses pour récupérer tous les messages en parallèle
        const messagePromises = friends.map(friend =>
            getMessages(friend.phone_friend)
        );

        // Attendre que toutes les promesses soient résolues
        const messageResponses = await Promise.all(messagePromises);

        // Traiter les réponses
        for (let i = 0; i < friends.length; i++) {
          const friend = friends[i];
          const messages = messageResponses[i];

          if (messages && messages.length > 0) {
            // Trier les messages par date
            const sortedMessages = messages.sort((a, b) =>
                new Date(b.time) - new Date(a.time)
            );

            // Ajouter à la liste des conversations
            conversationsData.push({
              sender: friend.phone_friend,
              first_name: friend.first_name || 'Contact',
              last_name: friend.last_name || '',
              lastMessage: sortedMessages[0]
            });
          } else {
            // Ajouter le contact même s'il n'y a pas de messages
            conversationsData.push({
              sender: friend.phone_friend,
              first_name: friend.first_name || 'Contact',
              last_name: friend.last_name || '',
              lastMessage: {
                content: 'Commencer une conversation',
                time: new Date().toISOString(),
                is_read: true
              }
            });
          }
        }

        // Trier les conversations par heure du dernier message
        const sortedConversations = conversationsData.sort((a, b) =>
            new Date(b.lastMessage.time) - new Date(a.lastMessage.time)
        );

        setConversations(sortedConversations);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des messages :', error);
      Alert.alert('Erreur', 'Impossible de charger les conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setModalVisible(true);
  };

  const handleAddContact = () => {
    // Vérifier que le numéro de téléphone est valide
    if (!newContactPhone || newContactPhone.length < 5) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return;
    }

    // Fermer la modal
    setModalVisible(false);

    // Réinitialiser le champ
    const phoneToUse = newContactPhone;
    setNewContactPhone('');

    // Naviguer vers la conversation avec ce contact - noter le nom de l'écran corrigé
    navigation.navigate('Conversation', {
      contact: {
        phone_friend: phoneToUse,
        first_name: 'Contact',
        last_name: ''
      },
      userPhone: userPhone
    });

  };


  if (loading) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#075E54" />
        </View>
    );
  }

  return (
      <View style={styles.container}>
        {conversations.length > 0 ? (
            <ConversationsList
                conversations={conversations}
                navigation={navigation}
                userPhone={userPhone}
            />
        ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucune conversation</Text>
            </View>
        )}

        {/* Bouton d'ajout de nouvelle conversation */}
        <TouchableOpacity
            style={styles.newConversationButton}
            onPress={handleNewConversation}
        >
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>

        {/* Modal pour ajouter un nouveau contact */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
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
                    autoFocus={true}
                />

                <View style={styles.buttonContainer}>
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
                      style={[styles.button, styles.addButton]}
                      onPress={handleAddContact}
                  >
                    <Text style={styles.buttonText}>Discuter</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888888',
  },
  newConversationButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#075E54',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#075E54'
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginVertical: 8
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#ccc'
  },
  addButton: {
    backgroundColor: '#075E54'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

export default MessagesScreen;