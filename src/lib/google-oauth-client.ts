import { OAuth2Client } from 'google-auth-library';

let oauth2Client: OAuth2Client | null = null;

export function getGoogleOAuthClient(): OAuth2Client {
  if (oauth2Client) {
    return oauth2Client;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:9002/api/oauth/callback';

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are not set in environment variables.');
  }

  oauth2Client = new OAuth2Client(
    clientId,
    clientSecret,
    redirectUri
  );

  console.log('[GoogleOAuthClient] OAuth2Client initialized successfully.');
  return oauth2Client;
}
