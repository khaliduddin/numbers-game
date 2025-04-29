import { mockAuth } from "@/lib/mockAuth";

export interface UserCredentials {
  email: string;
  password: string;
}

export interface SignupData extends UserCredentials {
  username: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string;
  walletAddress?: string;
  joinDate?: string;
}

export const authService = {
  /**
   * Sign up a new user with email and password
   */
  async signup({ email, password, username }: SignupData): Promise<AuthUser> {
    try {
      const userData = await mockAuth.signup({
        email,
        password,
        username,
      });
      return userData;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Sign in a user with email and password
   */
  async login({ email, password }: UserCredentials): Promise<AuthUser> {
    try {
      const userData = await mockAuth.login(email, password);
      return userData;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Sign out the current user
   */
  async logout(): Promise<void> {
    try {
      await mockAuth.logout();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    // Get user from localStorage
    const userJson = localStorage.getItem("user");
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch (e) {
      return null;
    }
  },
};
