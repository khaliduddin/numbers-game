import { connectAuthEmulator } from "firebase/auth";
import { connectFirestoreEmulator } from "firebase/firestore";
import { connectFunctionsEmulator } from "firebase/functions";
import { auth, db } from "./firebase";
import { getFunctions } from "firebase/functions";

export function useFirebaseEmulators() {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.MODE === "development";

  if (isDevelopment) {
    try {
      // Connect to Auth Emulator
      connectAuthEmulator(auth, "http://localhost:9099");
      console.log("Connected to Firebase Auth Emulator");

      // Connect to Firestore Emulator
      connectFirestoreEmulator(db, "localhost", 8080);
      console.log("Connected to Firestore Emulator");

      // Connect to Functions Emulator
      const functions = getFunctions();
      connectFunctionsEmulator(functions, "localhost", 5001);
      console.log("Connected to Firebase Functions Emulator");
    } catch (error) {
      console.error("Error connecting to Firebase Emulators:", error);
    }
  }
}
