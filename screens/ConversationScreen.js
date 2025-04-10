import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MessageList from '../components/MessageList';
import {getMessages, sendMessage, checkUserExists} from '../services/api'; // Utilisation correcte de l'API

const ConversationScreen = ({ route, navigation }) => {
  const { contact, userPhone } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const messageInputRef = useRef(null);


  useEffect(() => {
    // Configurer la barre de navigation

    navigation.setOptions({
      title: `${contact.first_name} ${contact.last_name}`,
      headerLeft: () => (
          <TouchableOpacity
              style={{ marginLeft: 10 }}
              onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#075E54" />
          </TouchableOpacity>
      ),
    });

    fetchUserInfo();

    // Charger les messages
    fetchMessages();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const result = await checkUserExists(userPhone);
      if (result.exists) {
        setUserInfo(result.user);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des infos utilisateur:', error);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const messagesData = await getMessages(contact.phone_friend);
      // Trier les messages du plus récent au plus ancien
      const sortedMessages = messagesData.sort((a, b) =>
          new Date(b.time) - new Date(a.time)
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages :', error);
      Alert.alert('Erreur', 'Impossible de charger les messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      // Format attendu par l'API
      const messageData = {
        message: newMessage,
        sender: userPhone,
        first_name: userInfo ? userInfo.first_name : 'Utilisateur',
        last_name: userInfo ? userInfo.last_name : '',
        receiver: contact.phone_friend
      };

      // Envoyer le message
      await sendMessage(messageData);

      // Ajouter le message à la liste locale
      const sentMessage = {
        ...messageData,
        time: new Date(),
        _id: Date.now().toString() // ID temporaire
      };

      setMessages([sentMessage, ...messages]);
      setNewMessage('');

      // Rafraîchir les messages pour obtenir l'ID réel du serveur
      fetchMessages();
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message :', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  return (
      <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#075E54" />
            </View>
        ) : (
            <MessageList messages={messages} userPhone={userPhone} />
        )}

        <View style={styles.inputContainer}>
          <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Écrivez un message..."
              multiline
              ref={messageInputRef}
          />
          <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={!newMessage.trim()}
          >
            <Ionicons
                name="send"
                size={24}
                color={newMessage.trim() ? "#075E54" : "#CCCCCC"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4DDD6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    padding: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ConversationScreen;