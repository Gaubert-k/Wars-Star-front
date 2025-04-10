import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button } from 'react-native';

const MessagesScreen = () => {
  // Exemple d’état local pour gérer les messages
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Au montage, on peut récupérer la liste depuis l’API
  useEffect(() => {
    fetchMessages();
  }, []);

  // Fonction pour récupérer les messages
  const fetchMessages = async () => {
    try {
      // Adapter l'URL au backend
      const response = await fetch('http://localhost:3001/api/messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Erreur fetch messages:', error);
    }
  };

  // Fonction pour envoyer un nouveau message
  const sendMessage = async () => {
    try {
      // Idéalement, tu récupères l'ID de l'émetteur depuis ton store / context
      const response = await fetch('http://localhost:3001/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 1,  // Id fictif de l’émetteur
          to: 2,    // Id fictif du destinataire
          text: newMessage
        }),
      });
      const data = await response.json();

      // On ajoute le message au tableau local
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  // Rendu d’un seul message
  const renderMessageItem = ({ item }) => {
    return (
      <View style={styles.messageItem}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.meta}>
          from: {item.from} | to: {item.to}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      
      {/* Liste des messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessageItem}
        style={styles.list}
      />

      {/* Section pour rédiger un message */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Écrire un nouveau message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <Button title="Envoyer" onPress={sendMessage} />
      </View>
    </View>
  );
};

export default MessagesScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
  },
  list: {
    flex: 1,
    marginBottom: 16,
  },
  messageItem: {
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 4,
    borderRadius: 6,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
  },
  meta: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginRight: 8,
    backgroundColor: '#fff',
  },
});
