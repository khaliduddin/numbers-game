// Environment variables type definitions
export const env = {
  // SendGrid
  VITE_SENDGRID_API_KEY: import.meta.env.VITE_SENDGRID_API_KEY as
    | string
    | undefined,
  VITE_SENDGRID_FROM_EMAIL: import.meta.env.VITE_SENDGRID_FROM_EMAIL as
    | string
    | undefined,

  // Firebase
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY as
    | string
    | undefined,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as
    | string
    | undefined,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID as
    | string
    | undefined,

  // Supabase
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY as
    | string
    | undefined,

  // App environment
  MODE: import.meta.env.MODE as string | undefined,
};
