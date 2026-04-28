import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

async function test() {
  try {
    console.log("Testing with AMBIENT INITIALIZATION");
    const app = getApps().length === 0 ? initializeApp() : getApp();
    
    // We try to access the database ID from config
    console.log("Using Database ID from config:", firebaseConfig.firestoreDatabaseId);
    const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    
    console.log("Attempting to list collections...");
    const collections = await db.listCollections();
    console.log("Success! Collections found:", collections.length);
  } catch (e: any) {
    console.error("Test Failed!");
    console.error("Message:", e.message);
    if (e.code) console.error("Code:", e.code);
  }
}

test();
