# Web3 Multiplayer Number Game

A browser and Telegram mini app where players compete in number reduction challenges across solo, 1v1, and tournament modes with Web3 integration for payments and user profiles.

## Environment Setup

The application supports three environments:

- **Development**: For local development with full console logs and mock email services
- **Pre-production**: For end-to-end testing with real services but isolated from production
- **Production**: For the live application

### Development Environment

```bash
# Start the development server
npm run dev

# Build for development
npm run build
```

### Pre-production Environment

The pre-production environment is designed for end-to-end testing with real services but in an isolated environment. It has the following features:

- Served under the `/preprod/` path
- Uses real email services (SendGrid) instead of mock services
- Console logs are disabled except for errors and warnings
- Can be used to test the full application flow before deploying to production

```bash
# Start the pre-production server
npm run dev:preprod

# Build for pre-production
npm run build:preprod

# Preview the pre-production build
npm run preview:preprod
```

#### Console Logs in Pre-production

In pre-production, console logs are disabled by default except for `console.error` and `console.warn`. To temporarily enable logs for debugging, use the following function in the browser console:

```js
window.enableLogs(true); // Enable logs
window.enableLogs(false); // Disable logs again
```

### Production Environment

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

## Email Verification

The application uses SendGrid for sending verification emails in pre-production and production environments. In development, emails are logged to the console instead of being sent.

## Supabase Integration

To update Supabase types:

```bash
npm run types:supabase
```
