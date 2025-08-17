const {setGlobalOptions} = require("firebase-functions/v2/options");
const {onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const fetch = require("node-fetch");

setGlobalOptions({maxInstances: 10});

// Enhanced Cloud Function to send push notifications with navigation data
exports.sendPushNotification = onCall(async (request) => {
  const {expoPushToken, title, body, data = {}} = request.data;

  // Validate required fields
  if (!expoPushToken) {
    logger.error("Expo push token missing");
    throw new Error("Expo push token is required");
  }

  if (!title || !body) {
    logger.error("Title or body missing");
    throw new Error("Title and body are required");
  }

  try {
    // Construct the push notification message
    const message = {
      to: expoPushToken,
      sound: "default",
      title: title,
      body: body,
      data: data, // Include navigation and custom data
      priority: "high",
      badge: 1, // Show badge on app icon
    };

    logger.info("📤 Sending push notification:", {
      to: expoPushToken.substring(0, 20) + "...", // Log partial token for privacy
      title: title,
      body: body,
      dataKeys: Object.keys(data) // Log what data keys we're sending
    });

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Check if the push notification was successful
    if (result.data && result.data.status === 'error') {
      logger.error("❌ Push notification failed:", result.data);
      throw new Error(`Push notification failed: ${result.data.message}`);
    }

    logger.info("✅ Push notification sent successfully:", {
      status: result.data?.status || 'unknown',
      id: result.data?.id || 'no-id'
    });

    return {
      success: true, 
      result: result,
      message: "Push notification sent successfully"
    };

  } catch (error) {
    logger.error("❌ Error sending push notification:", {
      error: error.message,
      stack: error.stack
    });
    
    throw new Error(`Failed to send push notification: ${error.message}`);
  }
});

exports.validatePushToken = onCall(async (request) => {
  const {expoPushToken} = request.data;

  if (!expoPushToken) {
    throw new Error("Expo push token is required");
  }

  // Basic validation - Expo push tokens start with "ExponentPushToken["
  const isValidFormat = expoPushToken.startsWith("ExponentPushToken[") && 
                       expoPushToken.endsWith("]");

  logger.info("🔍 Validating push token:", {
    tokenPrefix: expoPushToken.substring(0, 30) + "...",
    isValidFormat: isValidFormat
  });

  return {
    isValid: isValidFormat,
    tokenPrefix: expoPushToken.substring(0, 30) + "..."
  };
});