import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ title, userLogo, onLogoPress, onSettingsPress }) => {
    // Logo par défaut si aucun n'est fourni
    const defaultLogo = 'https://ui-avatars.com/api/?name=User&background=random';

    return (
        <View style={styles.header}>
            <TouchableOpacity style={styles.logoContainer} onPress={onLogoPress}>
                <Image
                    source={{ uri: userLogo || defaultLogo }}
                    style={styles.logo}
                />
            </TouchableOpacity>

            <Text style={styles.title}>{title}</Text>

            <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress}>
                <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#128C7E', // Couleur de WhatsApp
        paddingVertical: 10,
        paddingHorizontal: 15,
        height: 60,
    },
    logoContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    title: {
        flex: 1,
        textAlign: 'center',
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    settingsButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Header;