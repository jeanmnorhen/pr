import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// IMPORTANT: Replace with your actual Firebase project configuration
// It's highly recommended to use environment variables for this sensitive information.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// --- ADDED FOR DIAGNOSIS ---
console.log("Attempting to initialize Firebase with the following config:");
console.log("API Key Loaded:", firebaseConfig.apiKey ? "Set (value not logged for security)" : "MISSING or undefined");
console.log("Auth Domain Loaded:", firebaseConfig.authDomain || "MISSING or undefined");
console.log("Project ID Loaded:", firebaseConfig.projectId || "MISSING or undefined");
console.log("Storage Bucket Loaded:", firebaseConfig.storageBucket || "MISSING or undefined");
console.log("Messaging Sender ID Loaded:", firebaseConfig.messagingSenderId || "MISSING or undefined");
console.log("App ID Loaded:", firebaseConfig.appId || "MISSING or undefined");

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error(
    "Critical Firebase configuration is missing (apiKey, authDomain, or projectId). " +
    "Please ensure your .env.local file is correctly set up with all NEXT_PUBLIC_FIREBASE_ variables " +
    "and that you have restarted your development server."
  );
}
// --- END ADDED FOR DIAGNOSIS ---

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);

export { app, auth };

/*
Reminder: Create a .env.local file in the root of your project and add your Firebase config:

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id (optional)

*/
