# Local Digital Eye - Firebase Studio Project

This is a Next.js application built with Firebase Studio. It's designed to analyze and provide AI-driven insights for local businesses.

## 🚀 Getting Started

To run this project, you need to configure your environment variables. This is a crucial step for the application to connect to Firebase and other Google services.

### 1. Create a `.env.local` file

Create a new file named `.env.local` in the root of the project. You can do this by copying the provided example file:

```bash
cp .env .env.local
```

### 2. Configure Firebase Admin (Server) Variable (CRITICAL ERROR)

**This is the most critical step and is likely the cause of the current error.** The application's backend requires service account credentials to run.

1.  In your Firebase project settings, go to the **Service accounts** tab.
2.  Click **Generate new private key**. A JSON file will be downloaded.
3.  Open the JSON file and copy its **entire content**.
4.  Paste this entire JSON content as the value for the `FIREBASE_SERVICE_ACCOUNT_KEY` variable in your `.env.local` file. It must be on a single line.

```ini
# .env.local
FIREBASE_SERVICE_ACCOUNT_KEY='{"type": "service_account", "project_id": "...", ...}'
```

### 3. Configure Firebase Client Variables

You also need to get your Firebase project's client-side (browser) configuration keys.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project (or create a new one).
3.  Click the gear icon next to "Project Overview" and select **Project settings**.
4.  In the "Your apps" card, select your web app (or create one if it doesn't exist).
5.  Under **Firebase SDK snippet**, select the **Config** option.
6.  Copy the key-value pairs from the `firebaseConfig` object and paste them into your `.env.local` file.

They should look like this:

```ini
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
# ... and so on for the other keys.
```

### 4. Configure Google Maps API Key

Some features require the Google Maps Places API.

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Make sure you have the **Places API** enabled for your project.
3.  Go to **APIs & Services > Credentials**.
4.  Create a new API key or copy an existing one.
5.  Paste the key into the `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` variable in your `.env.local` file. Note the `NEXT_PUBLIC_` prefix, as it may be used on the client.

### 5. Install Dependencies and Run

After configuring your `.env.local` file, you can run the app.

```bash
npm install
npm run dev
```

Your application should now be running locally on `http://localhost:3000` with a successful connection to Firebase.

**Important**: For a production deployment (like on Vercel), these variables must be stored in the environment variable settings of your hosting provider, not committed in a `.env.local` file.
