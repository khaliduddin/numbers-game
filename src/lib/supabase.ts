// This file is kept as a placeholder for future implementation of authentication
// Currently the app is running in guest mode without authentication

export const supabase = {
  // Mock methods to prevent errors in case any code still references supabase
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
    signInWithPassword: async () => ({
      data: null,
      error: { message: "Authentication disabled" },
    }),
    signUp: async () => ({
      data: null,
      error: { message: "Authentication disabled" },
    }),
    resetPasswordForEmail: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
      }),
    }),
  }),
};
