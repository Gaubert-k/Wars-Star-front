import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import MessageItem from './MessageItem';

const MessageList = ({ messages, userPhone }) => {
  const renderMessage = ({ item }) => {
    const isSender = item.sender === userPhone;
    return <MessageItem message={item} isSender={isSender} />;
  };

  return (
    <FlatList
      style={styles.container}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item._id}
      inverted // Pour afficher les messages les plus récents en bas
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default MessageList;