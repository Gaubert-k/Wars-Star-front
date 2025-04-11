import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ContactDetailScreen from '../screens/ContactDetailScreen';
import ConversationScreen from '../screens/ConversationScreen';
import ContactsScreen from '../screens/ContactsScreen';

const Stack = createStackNavigator();

const MainNavigator = () => (
    <Stack.Navigator>
        <Stack.Screen name="MainApp" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ContactDetail" component={ContactDetailScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Conversation" component={ConversationScreen} options={{ headerShown: false }}/>
    </Stack.Navigator>
);

export default MainNavigator;