import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import path from 'path';
import fs from 'fs';

let app: App;

if (!getApps().length) {
  try {
    const serviceAccountPath = path.join(process.cwd(), 'firebase-admin.json');
    if (fs.existsSync(serviceAccountPath)) {
      app = initializeApp({
        credential: cert(serviceAccountPath),
      });
      console.log('Firebase Admin initialized successfully');
    } else {
      console.error('firebase-admin.json not found!');
      app = initializeApp();
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
    app = getApps()[0];
  }
} else {
  app = getApps()[0];
}

export { app };
