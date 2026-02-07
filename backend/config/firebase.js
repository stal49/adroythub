
require("dotenv").config();
const admin = require("firebase-admin");
// const file_path = process.env.FIREBASE_CONFIG_PATH || "./firebase-service-account.json";
// const serviceAccount = require(file_path);
const serviceAccount = {
    "type": "service_account",
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY,
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": process.env.FIREBASE_AUTH_URI,
    "token_uri": process.env.FIREBASE_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL,
    "universe_domain": "googleapis.com"
  }
  
  const app1 = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
  }, "app1");
  const db = app1.firestore();

  const serviceAccount2 = {
    "type": "service_account",
    "project_id": process.env.FIREBASE_PROJECT_ID1,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID1,
    "private_key": process.env.FIREBASE_PRIVATE_KEY1,
    "client_email": process.env.FIREBASE_CLIENT_EMAIL1,
    "client_id": process.env.FIREBASE_CLIENT_ID1,
    "auth_uri": process.env.FIREBASE_AUTH_URI1,
    "token_uri": process.env.FIREBASE_TOKEN_URI1,
    "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_CERT_URL1,
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL1,
    "universe_domain": "googleapis.com"
  }
  
  const app2 = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount2),
  }, "app2");
  
  const db2 = app2.firestore();

  module.exports = { db, db2 };