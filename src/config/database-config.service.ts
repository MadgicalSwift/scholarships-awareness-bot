import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')),
});

const db = admin.firestore();

export default db;
