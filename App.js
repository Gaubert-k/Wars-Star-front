// App.js
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importation des écrans
import ContactsScreen from './screens/ContactsScreen';
import MessagesScreen from './screens/MessagesScreen';
import AuthScreen from './screens/AuthScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import ContactDetailScreen from "./screens/ContactDetailScreen";
import ConversationScreen from './screens/ConversationScreen';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const AUTH_KEY = 'user_auth_data';

// Composant TabNavigator séparé
const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Contacts') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'Messages') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#128C7E',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Contacts" component={ContactsScreen} />
            <Tab.Screen name="Messages" component={MessagesScreen} />
        </Tab.Navigator>
    );
};

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const userData = await AsyncStorage.getItem(AUTH_KEY);
                setIsAuthenticated(!!userData);
            } catch (error) {
                console.error('Erreur lors de la vérification de l\'authentification:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthentication();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#128C7E" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={isAuthenticated ? "MainApp" : "Auth"} >
                <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
                <Stack.Screen name="MainApp" component={TabNavigator} options={{ headerShown: false }} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="Contacts" component={ContactsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ContactDetail" component={ContactDetailScreen} options={{ headerShown: false }}/>
                <Stack.Screen name="Conversation" component={ConversationScreen} options={{ headerShown: false }}/>

            </Stack.Navigator>
        </NavigationContainer>
    );

}
