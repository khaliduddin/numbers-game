# Firebase Migration Guide

## Migration Status

- ✅ Firebase Authentication
- ✅ Firebase Firestore for user profiles
- ✅ Firebase Cloud Functions for OTP email delivery
- ✅ Firebase Firestore for OTP verification

## Remaining Tasks

1. Deploy Firebase Cloud Functions
2. Update environment variables in production
3. Test the full authentication flow in production
4. Remove Supabase dependencies

## How to Deploy

1. Install Firebase CLI if not already installed:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Deploy Firebase Cloud Functions:
   ```
   npm run firebase:deploy:functions
   ```

4. Deploy the entire application:
   ```
   npm run firebase:deploy
   ```

## Local Development

To test Firebase functionality locally:

1. Start Firebase emulators:
   ```
   npm run firebase:emulators
   ```

2. Start the development server:
   ```
   npm run dev
   ```

## Environment Variables

The following environment variables need to be set:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

For Firebase Cloud Functions:

- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
