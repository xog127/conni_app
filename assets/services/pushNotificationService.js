// pushNotificationService.js
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebase/firebaseConfig.js";

const functions = getFunctions(app);

export async function triggerPushNotification(token, title, body) {
  const sendPushNotification = httpsCallable(functions, "sendPushNotification");
  try {
    const res = await sendPushNotification({ expoPushToken: token, title, body });
    console.log("Notification result:", res.data);
  } catch (error) {
    console.error("Error triggering push notification:", error);
  }
}

// Add this export
export async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notifications!');
      return null;
    }
    const tokenData = await Notifications.getExpoPushTokenAsync();
    token = tokenData.data;
    console.log('Expo Push Token:', token);
  } else {
    alert('Must use a physical device for push notifications');
  }
  return token;
}
