# Authentication System

## Current Implementation

The application currently uses a hybrid authentication system:

1. **Frontend Authentication Logic**: Uses Firebase services through the `authService.ts` interface
2. **Email Delivery**: Uses Supabase Edge Functions to send emails
3. **OTP Verification**: Stores and verifies OTPs using both local storage (for development) and Supabase database

## Migration Plan

We are in the process of migrating fully to Firebase:

1. ✅ Frontend authentication logic using Firebase Auth
2. ⏳ Email delivery using Firebase Cloud Functions (currently using Supabase Edge Functions)
3. ⏳ OTP verification using Firebase Firestore (currently using Supabase database)

## Why the Hybrid Approach?

The hybrid approach allows us to:

1. Gradually migrate from Supabase to Firebase without disrupting the user experience
2. Leverage existing Supabase Edge Functions for email delivery until Firebase Cloud Functions are set up
3. Maintain backward compatibility with existing user data

## Next Steps

1. Create Firebase Cloud Functions for email delivery
2. Migrate OTP storage and verification to Firebase Firestore
3. Remove Supabase dependencies once migration is complete
