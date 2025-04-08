import DeviceInfo from 'react-native-device-info';
import { Platform, PermissionsAndroid } from 'react-native';

class PhoneUtils {
    static async getPhoneNumber() {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
                    {
                        title: "Permission de lecture du téléphone",
                        message: "L'application a besoin d'accéder aux informations de votre téléphone pour récupérer votre numéro.",
                        buttonNeutral: "Demander plus tard",
                        buttonNegative: "Annuler",
                        buttonPositive: "OK"
                    }
                );

                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("Permission refusée");
                    return null;
                }
            }

            const phoneNumber = await DeviceInfo.getPhoneNumber();

            if (phoneNumber && phoneNumber !== '') {
                return phoneNumber;
            } else {
                console.log("Numéro de téléphone non disponible");
                return null;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération du numéro de téléphone:", error);
            return null;
        }
    }

    static async hasSimCard() {
        try {
            const isSimPresent = await DeviceInfo.isEmulator();
            if (isSimPresent) {
                return false;
            }

            const simCountryCode = await DeviceInfo.getPhoneNumber();
            return simCountryCode !== null && simCountryCode !== '';
        } catch (error) {
            console.error("Erreur lors de la vérification de la carte SIM:", error);
            return false;
        }
    }
}

export default PhoneUtils;