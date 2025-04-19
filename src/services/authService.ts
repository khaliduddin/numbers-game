import { supabase } from "@/lib/supabase";

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
    // Register the user with Supabase auth with additional metadata
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        },
      },
    });

    if (signUpError) {
      throw new Error(signUpError.message);
    }

    if (!authData.user) {
      throw new Error("Failed to create user");
    }

    // Create a profile in the unified_profiles table
    const { unifiedProfileService } = await import(
      "@/lib/unifiedProfileService"
    );
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    const joinDate = new Date().toISOString();

    await unifiedProfileService.saveProfile({
      id: authData.user.id,
      username,
      email,
      avatarUrl,
      joinDate,
      isGuest: false,
    });

    return {
      id: authData.user.id,
      email: authData.user.email || email,
      username: username,
      avatarUrl: avatarUrl,
      joinDate: joinDate,
    };
  },

  /**
   * Sign in a user with email and password
   */
  async login({ email, password }: UserCredentials): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Failed to sign in");
    }

    // Get the user profile data from unified_profiles
    const { unifiedProfileService } = await import(
      "@/lib/unifiedProfileService"
    );
    const { profile, error: profileError } =
      await unifiedProfileService.getProfile(data.user.id);

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }

    // If profile doesn't exist, create it
    if (!profile) {
      const { profile: newProfile } = await unifiedProfileService.saveProfile({
        id: data.user.id,
        username: email.split("@")[0],
        email: email,
        isGuest: false,
        joinDate: new Date().toISOString(),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email.split("@")[0]}`,
      });

      return {
        id: data.user.id,
        email: data.user.email || email,
        username: newProfile?.username || email.split("@")[0],
        avatarUrl: newProfile?.avatarUrl,
        walletAddress: newProfile?.walletAddress,
        joinDate: newProfile?.joinDate || new Date().toISOString(),
      };
    }

    return {
      id: data.user.id,
      email: data.user.email || email,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      walletAddress: profile.walletAddress,
      joinDate: profile.joinDate,
    };
  },

  /**
   * Sign out the current user
   */
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      return null;
    }

    // Get the user profile data from unified_profiles
    const { unifiedProfileService } = await import(
      "@/lib/unifiedProfileService"
    );
    const { profile } = await unifiedProfileService.getProfile(data.user.id);

    if (!profile) {
      // If no profile exists, create a basic one
      const username = data.user.email ? data.user.email.split("@")[0] : "User";
      const { profile: newProfile } = await unifiedProfileService.saveProfile({
        id: data.user.id,
        username,
        email: data.user.email || "",
        isGuest: false,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      });

      return {
        id: data.user.id,
        email: data.user.email || "",
        username: newProfile?.username || username,
        avatarUrl: newProfile?.avatarUrl,
        walletAddress: newProfile?.walletAddress,
        joinDate: newProfile?.joinDate,
      };
    }

    return {
      id: data.user.id,
      email: data.user.email || "",
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      walletAddress: profile.walletAddress,
      joinDate: profile.joinDate,
    };
  },
};
