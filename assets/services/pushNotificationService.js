// pushNotificationService.js
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "../firebase/firebaseConfig.js";

const functions = getFunctions(app);

export async function triggerPushNotification(token, title, body, data = {}) {
  const sendPushNotification = httpsCallable(functions, "sendPushNotification");
  try {
    const res = await sendPushNotification({ 
      expoPushToken: token, 
      title, 
      body,
      data
    });
    console.log("✅ Push notification result:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error triggering push notification:", error);
    throw error;
  }
}


export async function registerForPushNotificationsAsync() {
  try {
    console.log('🔍 Getting permissions...');
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
    
    console.log('🎫 Getting push token...');
    
    // Use your Expo project ID (not Firebase project ID)
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '080aeb66-6827-48e4-b7bc-8035d863a5cb'
    });
    
    const token = tokenData.data;
    console.log('✅ Expo Push Token:', token);
    return token;
    
  } catch (error) {
    console.error('❌ Error getting push token:', error);
    alert('Error: ' + error.message);
    return null;
  }
}