// components/ConversationsList.js
import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import ConversationItem from './ConversationItem';

const ConversationsList = ({ conversations, navigation, userPhone }) => {
  const handleConversationPress = (conversation) => {
    navigation.navigate('Conversation', {
      contact: {
        phone_friend: conversation.sender,
        first_name: conversation.first_name,
        last_name: conversation.last_name
      },
      userPhone: userPhone
    });
  };

  return (
      <FlatList
          style={styles.container}
          data={conversations}
          renderItem={({ item }) => (
              <ConversationItem
                  conversation={item}
                  onPress={() => handleConversationPress(item)}
              />
          )}
          keyExtractor={(item) => item.sender}
      />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});

export default ConversationsList;