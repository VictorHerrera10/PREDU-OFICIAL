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
    // Provide a more specific error message back to the client.
    if (error.code === 'permission-denied' || error.code === 7) { // 7 is the gRPC code for PERMISSION_DENIED
        throw new functions.https.HttpsError(
            "permission-denied",
            "The function does not have permission to delete users. Please check IAM roles for the service account."
        );
    }
    
    throw new functions.https.HttpsError("internal", error.message);
  }
});
