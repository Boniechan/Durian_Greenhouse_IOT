import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Enhanced debug logging
if (__DEV__) {
  console.log('=== Firebase Configuration Debug ===');
  console.log('Environment variables:');
  console.log('API_KEY:', process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? 'EXISTS' : 'MISSING');
  console.log('AUTH_DOMAIN:', process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'EXISTS' : 'MISSING');
  console.log('DATABASE_URL:', process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL ? 'EXISTS' : 'MISSING');
  console.log('PROJECT_ID:', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? 'EXISTS' : 'MISSING');
  console.log('STORAGE_BUCKET:', process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'EXISTS' : 'MISSING');
  console.log('MESSAGING_SENDER_ID:', process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'EXISTS' : 'MISSING');
  console.log('APP_ID:', process.env.EXPO_PUBLIC_FIREBASE_APP_ID ? 'EXISTS' : 'MISSING');
  console.log('MEASUREMENT_ID:', process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ? 'EXISTS' : 'MISSING');
  console.log('=====================================');
}

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validate critical Firebase config values
const requiredFields: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'databaseURL', 'projectId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

if (missingFields.length > 0) {
  console.error('❌ Missing required Firebase configuration:', missingFields);
  throw new Error(`Missing Firebase configuration: ${missingFields.join(', ')}`);
}

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

export const db = getDatabase(app);
export const storage = getStorage(app);
export const firestore = getFirestore(app);
