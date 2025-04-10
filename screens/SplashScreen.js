import React from 'react';
import { View, Image, StyleSheet, Text, ActivityIndicator } from 'react-native';

const SplashScreen = () => {
    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/favicon.png')}
                style={styles.logo}
            />
            <Text style={styles.appName}>Wars-star</Text>
            <ActivityIndicator
                size="large"
                color="#128C7E"
                style={styles.loader}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#128C7E',
        marginTop: 20,
    },
    loader: {
        marginTop: 30,
    }
});

export default SplashScreen;