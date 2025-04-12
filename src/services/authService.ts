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
    // Register the user with Supabase auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      throw new Error(signUpError.message);
    }

    if (!authData.user) {
      throw new Error("Failed to create user");
    }

    // Create a profile record in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: authData.user.id,
          username,
          email,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          join_date: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // If profile creation fails, we should ideally delete the auth user
      // but Supabase doesn't expose a delete user API for client-side
      throw new Error(
        `Failed to create profile: ${profileError.message || "Database error"}`,
      );
    }

    return {
      id: authData.user.id,
      email: authData.user.email || email,
      username: profileData?.username,
      avatarUrl: profileData?.avatar_url,
      joinDate: profileData?.join_date,
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

    // Get the user profile data
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 is the error code for no rows returned
      console.error("Error fetching profile:", profileError);
    }

    return {
      id: data.user.id,
      email: data.user.email || email,
      username: profileData?.username,
      avatarUrl: profileData?.avatar_url,
      walletAddress: profileData?.wallet_address,
      joinDate: profileData?.join_date,
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

    // Get the user profile data
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    return {
      id: data.user.id,
      email: data.user.email || "",
      username: profileData?.username,
      avatarUrl: profileData?.avatar_url,
      walletAddress: profileData?.wallet_address,
      joinDate: profileData?.join_date,
    };
  },
};
