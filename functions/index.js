const {setGlobalOptions} = require("firebase-functions/v2/options");
const {onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const fetch = require("node-fetch");

setGlobalOptions({maxInstances: 10});

// Cloud Function to send a push notification
exports.sendPushNotification = onCall(async (request) => {
  const {expoPushToken, title, body} = request.data;

  if (!expoPushToken) {
    logger.error("Expo push token missing");
    throw new Error("Expo push token is required");
  }

  try {
    const message = {
      to: expoPushToken,
      sound: "default",
      title,
      body,
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const result = await response.json();
    logger.info("Push notification sent", result);

    return {success: true, result};
  } catch (error) {
    logger.error("Error sending push notification", error);
    throw new Error(error.message);
  }
});
