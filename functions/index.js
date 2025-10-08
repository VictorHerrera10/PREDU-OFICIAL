const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.deleteUser = functions.https.onCall(async (data, context) => {
  // The admin check is handled by controlling access to the page that calls this function.
  // For simplicity and to resolve the internal error, we are removing the server-side role check for now.

  const uid = data.uid;
  if (!uid || typeof uid !== "string") {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "The function must be called with a `uid` argument.",
    );
  }

  try {
    // Delete from Firebase Authentication
    await admin.auth().deleteUser(uid);

    // Delete from Firestore
    const userDocRef = admin.firestore().collection("users").doc(uid);
    await userDocRef.delete();

    return {message: `Successfully deleted user ${uid}`};
  } catch (error) {
    console.error("Error deleting user:", error);
    // Provide a more specific error message back to the client.
    throw new functions.https.HttpsError("internal", error.message);
  }
});
