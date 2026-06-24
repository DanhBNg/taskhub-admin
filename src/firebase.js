import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCNvckFGmRwZSDzUqq9OnJ0PPB2DsCJZUc',
  authDomain: 'ai-project-manager-12d8d.firebaseapp.com',
  projectId: 'ai-project-manager-12d8d',
  storageBucket: 'ai-project-manager-12d8d.firebasestorage.app',
  messagingSenderId: '145809745976',
  appId: '1:145809745976:web:bd24466ac6735702d41ecd',
  measurementId: 'G-61DLK7Q158',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
