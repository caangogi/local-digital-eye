# Local Digital Eye - Firebase Studio Project

This is a Next.js application built with Firebase Studio. It's designed to analyze and provide AI-driven insights for local businesses.

## 🚀 Getting Started

To run this project, you need to configure your environment variables. This is a crucial step for the application to connect to Firebase and other Google services.

### 1. Create a `.env.local` file

Create a new file named `.env.local` in the root of the project. You can do this by copying the provided example file:

```bash
cp .env.local.example .env.local
```

### 2. Configure Firebase Client Variables

You need to get your Firebase project's client-side configuration keys.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project (or create a new one).
3.  Click the gear icon next to "Project Overview" and select **Project settings**.
4.  In the "Your apps" card, select your web app.
5.  Under **Firebase SDK snippet**, select the **Config** option.
6.  Copy the key-value pairs from the `firebaseConfig` object and paste them into your `.env.local` file.

They should look like this:

```
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_public_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
# ... and so on for the other keys.
```

### 3. Configure Firebase Admin (Server) Variables

You also need to set up credentials for the server-side code (Firebase Admin SDK).

1.  In your Firebase project settings, go to the **Service accounts** tab.
2.  Click **Generate new private key**. A JSON file will be downloaded.
3.  Open the JSON file and copy the values for `project_id`, `client_email`, and `private_key`.
4.  Paste these values into the corresponding variables in your `.env.local` file.

```
FIREBASE_PROJECT_ID="..."
FIREBASE_CLIENT_EMAIL="..."
FIREBASE_PRIVATE_KEY="..."
```

**Important**: For a production deployment (like on Vercel), these admin keys should be stored in the environment variable settings of your hosting provider, not in the `.env.local` file.

### 4. Configure Google Maps API Key

Some features require the Google Maps Places API.

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Make sure you have the **Places API** enabled for your project.
3.  Go to **APIs & Services > Credentials**.
4.  Create a new API key or copy an existing one.
5.  Paste the key into the `GOOGLE_MAPS_API_KEY` variable in your `.env.local` file.

### 5. Install Dependencies and Run

```bash
npm install
npm run dev
```

Your application should now be running locally on `http://localhost:3000` with a successful connection to Firebase.
