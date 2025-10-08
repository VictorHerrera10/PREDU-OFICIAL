const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.deleteUser = functions.https.onCall(async (data, context) => {
  // Check if the user is an admin.
  if (context.auth.token.role !== "admin") {
    throw new functions.https.HttpsError(
        "permission-denied",
        "Must be an administrative user to delete users.",
    );
  }

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
    throw new functions.https.HttpsError("internal", error.message);
  }
});
