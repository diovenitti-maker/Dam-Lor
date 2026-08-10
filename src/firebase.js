import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// ⚠️ Progetto Firebase DEDICATO per questa app (Sfide Dam vs Lor).
// Non riusare il progetto "app-flussi" o altri progetti esistenti:
// crea un progetto nuovo su console.firebase.google.com e incolla qui il suo config.
const firebaseConfig = {
  apiKey: 'AIzaSyDWy0Loi79D09E2x5gVa1VCbjBP-IHatgM',
  authDomain: 'dam-lor.firebaseapp.com',
  projectId: 'dam-lor',
  storageBucket: 'dam-lor.firebasestorage.app',
  messagingSenderId: '379966910964',
  appId: '1:379966910964:web:916c63c4a27a48881109a1',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
