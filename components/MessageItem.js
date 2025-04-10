import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MessageItem = ({ message, isSender }) => {
  const formattedTime = new Date(message.time).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  return (
    <View style={[
      styles.messageContainer,
      isSender ? styles.senderMessage : styles.receiverMessage
    ]}>
      <Text style={styles.messageText}>{message.message}</Text>
      <Text style={styles.timeText}>{formattedTime}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  senderMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 0,
  },
  receiverMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
  },
  timeText: {
    fontSize: 12,
    color: '#888888',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
});

export default MessageItem;