import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

class NotificationUtils {

    static async initialize() {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
            }),
        });

        await this.requestPermissions();
    }

    static async requestPermissions() {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        return finalStatus === 'granted';
    }

    static async showNotification(title, body, data = {}, options = {}) {
        try {
            // Vérification des permissions
            const hasPermission = await this.requestPermissions();
            if (!hasPermission) {
                console.warn("Permissions de notifications non accordées");
                return null;
            }

            // Configuration de base de la notification
            const notificationContent = {
                title,
                body,
                data,
                ...options,
            };

            // Si nous sommes sur iOS, ajoutons quelques options spécifiques
            if (Platform.OS === 'ios') {
                notificationContent.sound = true;
            }

            // Affichage de la notification
            const notificationId = await Notifications.scheduleNotificationAsync({
                content: notificationContent,
                trigger: null, // null signifie immédiatement
            });

            return notificationId;
        } catch (error) {
            console.error("Erreur lors de l'affichage de la notification:", error);
            return null;
        }
    }

    static async vibrate(pattern = 'default') {
        try {
            if (Platform.OS === 'android') {
                switch (pattern) {
                    case 'short':
                        await Notifications.setNotificationChannelAsync('default', {
                            name: 'default',
                            importance: Notifications.AndroidImportance.MAX,
                            vibrationPattern: [0, 100, 50, 100],
                        });
                        break;
                    case 'long':
                        await Notifications.setNotificationChannelAsync('default', {
                            name: 'default',
                            importance: Notifications.AndroidImportance.MAX,
                            vibrationPattern: [0, 250, 250, 250],
                        });
                        break;
                    default:
                        await Notifications.setNotificationChannelAsync('default', {
                            name: 'default',
                            importance: Notifications.AndroidImportance.MAX,
                            vibrationPattern: [0, 250, 250, 250],
                        });
                }
            }
        } catch (error) {
            console.error("Erreur lors de la vibration:", error);
        }
    }

    static async cancelNotification(notificationId) {
        try {
            await Notifications.cancelScheduledNotificationAsync(notificationId);
        } catch (error) {
            console.error("Erreur lors de l'annulation de la notification:", error);
        }
    }

    static async cancelAllNotifications() {
        try {
            await Notifications.cancelAllScheduledNotificationsAsync();
        } catch (error) {
            console.error("Erreur lors de l'annulation de toutes les notifications:", error);
        }
    }

    static async setBadgeCount(count) {
        try {
            await Notifications.setBadgeCountAsync(count);
        } catch (error) {
            console.error("Erreur lors de la définition du badge:", error);
        }
    }
}

export default NotificationUtils;