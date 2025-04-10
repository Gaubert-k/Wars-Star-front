import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ConversationItem = ({ conversation, onPress }) => {
  const lastMessageTime = new Date(conversation.lastMessage.time).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.avatar}>
        <Ionicons name="person-circle" size={50} color="#075E54" />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>
            {conversation.first_name} {conversation.last_name}
          </Text>
          <Text style={styles.time}>{lastMessageTime}</Text>
        </View>
        <Text style={styles.message} numberOfLines={1}>
          {conversation.lastMessage.message}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    marginRight: 15,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  time: {
    fontSize: 14,
    color: '#888888',
  },
  message: {
    fontSize: 14,
    color: '#666666',
  },
});

export default ConversationItem;