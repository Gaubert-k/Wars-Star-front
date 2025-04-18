import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import AuthScreen from "../screens/AuthScreen";

const Stack = createStackNavigator();

const AppNavigator = ({ isAuthenticated }) => (
    <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="MainApp" component={MainNavigator} />
        </Stack.Navigator>

    </NavigationContainer>
);

export default AppNavigator;
