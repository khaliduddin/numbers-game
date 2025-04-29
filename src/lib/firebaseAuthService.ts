import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";
import { AuthUser, SignupData, UserCredentials } from "@/services/authService";

export const firebaseAuthService = {
  /**
   * Sign up a new user with email and password
   */
  async signup({ email, password, username }: SignupData): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Update the user profile with the username
      if (username) {
        await updateProfile(user, { displayName: username });
      }

      const userData: AuthUser = {
        id: user.uid,
        email: user.email || email,
        username: username || user.displayName || undefined,
        avatarUrl: user.photoURL || undefined,
        joinDate: user.metadata.creationTime,
      };

      // Store user data in localStorage for persistence
      localStorage.setItem("user", JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error("Firebase signup error:", error);
      throw error;
    }
  },

  /**
   * Sign in a user with email and password
   */
  async login({ email, password }: UserCredentials): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      const userData: AuthUser = {
        id: user.uid,
        email: user.email || email,
        username: user.displayName || undefined,
        avatarUrl: user.photoURL || undefined,
        joinDate: user.metadata.creationTime,
      };

      // Store user data in localStorage for persistence
      localStorage.setItem("user", JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error("Firebase login error:", error);
      throw error;
    }
  },

  /**
   * Sign out the current user
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Firebase logout error:", error);
      throw error;
    }
  },
};
