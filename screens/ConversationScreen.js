// screens/ConversationScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMessages, sendMessage, checkUserExists, checkAndHandleAuth } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = 'user_auth_data'; // Définir la constante AUTH_KEY

const ConversationScreen = ({ route, navigation }) => {
  const { contact } = route.params; // Ne plus utiliser userPhone de route.params
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userPhone, setUserPhone] = useState(''); // Définir userPhone comme état local
  const messageInputRef = useRef(null);
  const flatListRef = useRef(null);

  // Charger le numéro de téléphone de l'utilisateur depuis AsyncStorage
  useEffect(() => {
    const getUserPhone = async () => {
      try {
        const userData = await AsyncStorage.getItem(AUTH_KEY);
        if (userData) {
          const parsedUserData = JSON.parse(userData);
          setUserPhone(parsedUserData.phone);
          console.log('Numéro de téléphone récupéré:', parsedUserData.phone);
        } else {
          console.error('AUTH_KEY non trouvé dans le stockage');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }]
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du numéro:', error);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }]
        });
      }
    };

    getUserPhone();
  }, []);

  // Configurer l'en-tête de navigation
  useEffect(() => {
    navigation.setOptions({
      title: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || contact.phone_friend,
      headerLeft: () => (
          <TouchableOpacity
              style={{ marginLeft: 15 }}
              onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#075E54" />
          </TouchableOpacity>
      ),
    });
  }, [navigation, contact]);

  // Charger les données au montage
  useEffect(() => {
    if (!userPhone) return; // Ne pas exécuter si userPhone n'est pas encore disponible

    const initialize = async () => {
      await Promise.all([
        fetchUserInfo(),
        fetchMessages()
      ]);
    };

    initialize();

    // Configurer l'intervalle de rafraîchissement
    const intervalId = setInterval(() => {
      if (!sending && !refreshing && userPhone) {
        fetchMessages(false);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [userPhone]); // Ajouter userPhone comme dépendance

  // Le reste de votre code reste inchangé, mais assurez-vous d'utiliser l'état userPhone

  // Récupérer les informations de l'utilisateur
  const fetchUserInfo = async () => {
    try {
      const result = await checkUserExists(userPhone);
      if (result && result.user) {
        setUserInfo(result.user);
      } else {
        setUserInfo({
          first_name: 'Utilisateur',
          last_name: '',
          phone: userPhone
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des infos utilisateur:', error);
      setUserInfo({
        first_name: 'Utilisateur',
        last_name: '',
        phone: userPhone
      });
    }
  };


  // Récupérer les messages de la conversation
  const fetchMessages = async (showLoadingIndicator = true) => {
    if (refreshing) return;

    if (showLoadingIndicator) {
      setLoading(true);
    }
    setRefreshing(true);

    try {
      // Récupérer tous les messages
      const allMessages = await getMessages(userPhone);
      console.log('Messages récupérés depuis API:', allMessages.length);

      // Filtrer les messages de cette conversation
      const conversationMessages = allMessages.filter(msg => {
        // Debug pour vérifier les messages
        console.log('Message évalué:', msg, 'userPhone:', userPhone, 'contact.phone_friend:', contact.phone_friend || contact.contactPhone);

        const contactPhoneNumber = contact.phone_friend || contact.contactPhone;
        return (msg.sender === userPhone && msg.receiver === contactPhoneNumber) ||
            (msg.receiver === userPhone && msg.sender === contactPhoneNumber);
      });

      console.log('Messages filtrés pour cette conversation:', conversationMessages.length);

      // Trier du plus récent au plus ancien
      conversationMessages.sort((a, b) => new Date(b.time) - new Date(a.time));

      setMessages(conversationMessages);
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      // Gestion d'erreur
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      // S'assurer que les champs obligatoires sont présents
      const messageData = {
        message: messageText,
        sender: userPhone,
        receiver: contact.phone_friend
      };

      console.log('Envoi du message avec les données:', messageData);

      // Envoyer le message
      await sendMessage(messageData);

      // Rafraîchir les messages
      await fetchMessages(false);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      Alert.alert(
          'Erreur d\'envoi',
          'Le message n\'a pas pu être envoyé. Veuillez réessayer.'
      );
      // Remettre le message dans le champ de texte
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  // Formater la date du message
  const formatMessageTime = (timeString) => {
    try {
      const date = new Date(timeString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();

      if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString([], {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return 'Heure inconnue';
    }
  };

  // Rendu des éléments de message
  const renderMessageItem = ({ item }) => {
    const isSentByMe = item.sender === userPhone;

    return (
        <View style={[
          styles.messageContainer,
          isSentByMe ? styles.sentMessageContainer : styles.receivedMessageContainer
        ]}>
          <View style={[
            styles.messageBubble,
            isSentByMe ? styles.sentMessageBubble : styles.receivedMessageBubble,
            item.pending && styles.pendingMessage,
            item.error && styles.errorMessage
          ]}>
            <Text style={styles.messageText}>{item.message}</Text>
            <View style={styles.messageFooter}>
              <Text style={styles.messageTime}>
                {formatMessageTime(item.time)}
              </Text>
              {item.pending && <Ionicons name="time-outline" size={14} color="#888" style={styles.statusIcon} />}
              {item.error && <Ionicons name="alert-circle-outline" size={14} color="#ff4040" style={styles.statusIcon} />}
              {!item.pending && !item.error && isSentByMe && <Ionicons name="checkmark-done" size={14} color="#0084ff" style={styles.statusIcon} />}
            </View>
          </View>
        </View>
    );
  };

  // Extraire la clé pour FlatList
  const keyExtractor = (item) => {
    return item._id || `${item.sender}_${item.time}`;
  };

  // Rafraîchir sur glissement vers le bas
  const handleRefresh = () => {
    fetchMessages(false);
  };

  return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          {loading && messages.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#075E54" />
                <Text style={styles.loadingText}>Chargement des messages...</Text>
              </View>
          ) : (
              <FlatList
                  ref={flatListRef}
                  data={messages}
                  renderItem={renderMessageItem}
                  keyExtractor={keyExtractor}
                  inverted
                  contentContainerStyle={styles.messagesContainer}
                  refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#075E54']}
                        tintColor="#075E54"
                    />
                  }
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Ionicons name="chatbubble-ellipses-outline" size={80} color="#075E54" />
                      <Text style={styles.emptyText}>Aucun message</Text>
                      <Text style={styles.emptySubText}>Commencez la conversation !</Text>
                    </View>
                  }
              />
          )}

          <View style={styles.inputContainer}>
            <TextInput
                ref={messageInputRef}
                style={styles.input}
                placeholder="Écrivez un message..."
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
                maxLength={500}
            />
            <TouchableOpacity
                style={[styles.sendButton, !newMessage.trim() && styles.disabledButton]}
                onPress={handleSendMessage}
                disabled={!newMessage.trim() || sending}
            >
              {sending ? (
                  <ActivityIndicator size="small" color="#fff" />
              ) : (
                  <Ionicons name="send" size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#075E54',
  },
  messagesContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  sentMessageContainer: {
    alignSelf: 'flex-end',
  },
  receivedMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    minWidth: 80,
  },
  sentMessageBubble: {
    backgroundColor: '#DCF8C6',
    borderTopRightRadius: 5,
  },
  receivedMessageBubble: {
    backgroundColor: 'white',
    borderTopLeftRadius: 5,
  },
  pendingMessage: {
    opacity: 0.8,
  },
  errorMessage: {
    backgroundColor: '#ffebee',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 5,
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  statusIcon: {
    marginLeft: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#075E54',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#90A4AE',
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 300,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#075E54',
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default ConversationScreen;