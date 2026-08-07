import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import path from 'path';
import fs from 'fs';

let app: App;

if (!getApps().length) {
  try {
    const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (envJson) {
      app = initializeApp({
        credential: cert(JSON.parse(envJson)),
      });
      console.log('Firebase Admin initialized successfully from ENV');
    } else {
      const serviceAccountPath = path.join(process.cwd(), 'firebase-admin.json');
      if (fs.existsSync(serviceAccountPath)) {
        app = initializeApp({
          credential: cert(serviceAccountPath),
        });
        console.log('Firebase Admin initialized successfully from file');
      } else {
        console.error('FIREBASE_SERVICE_ACCOUNT_JSON env and firebase-admin.json file not found!');
        app = initializeApp();
      }
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
    app = getApps()[0];
  }
} else {
  app = getApps()[0];
}

export { app };
