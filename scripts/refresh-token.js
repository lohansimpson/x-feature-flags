const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SCOPES = [
  'https://www.googleapis.com/auth/chromewebstore',
];

async function refreshToken(clientId, clientSecret, refreshToken) {
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'urn:ietf:wg:oauth:2.0:oob'
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials.refresh_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

async function main() {
  const clientId = process.env.CLIENT;
  const clientSecret = process.env.SECRET;
  const currentRefreshToken = process.env.TOKEN;

  if (!clientId || !clientSecret || !currentRefreshToken) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  try {
    const newRefreshToken = await refreshToken(clientId, clientSecret, currentRefreshToken);
    console.log('New refresh token:', newRefreshToken);
    
    // Update the token in GitHub Actions environment
    if (process.env.GITHUB_ACTIONS) {
      const tokenFile = process.env.GITHUB_ENV;
      fs.appendFileSync(tokenFile, `\nTOKEN=${newRefreshToken}`);
    }
  } catch (error) {
    console.error('Failed to refresh token:', error);
    process.exit(1);
  }
}

main(); 