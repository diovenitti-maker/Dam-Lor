import { useEffect, useState } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase.js'
import Scoreboard from './components/Scoreboard.jsx'
import HistoryFeed from './components/HistoryFeed.jsx'
import AddChallengeForm from './components/AddChallengeForm.jsx'
import StatsView from './components/StatsView.jsx'
import { computeScore } from './utils/scoring.js'
import seedData from './data/seed.json'
import './App.css'

const TABS = [
  { key: 'storico', label: 'Storico' },
  { key: 'aggiungi', label: 'Aggiungi' },
  { key: 'statistiche', label: 'Statistiche' },
]

export default function App() {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('storico')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'sfide'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setChallenges(list)
      setLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    importSeedIfNeeded()
  }, [])

  async function importSeedIfNeeded() {
    const flagRef = doc(db, 'meta', 'import_status')
    const flagSnap = await getDoc(flagRef)
    if (flagSnap.exists()) return

    const existing = await getDocs(collection(db, 'sfide'))
    if (!existing.empty) {
      await setDoc(flagRef, { done: true, note: 'collezione già popolata' })
      return
    }

    const batch = writeBatch(db)
    for (const item of seedData) {
      const ref = doc(collection(db, 'sfide'))
      batch.set(ref, { ...item, createdAt: serverTimestamp() })
    }
    await batch.commit()
    await setDoc(flagRef, { done: true, imported: seedData.length })
  }

  async function handleAdd(form) {
    setSaving(true)
    try {
      await addDoc(collection(db, 'sfide'), { ...form, createdAt: serverTimestamp() })
      setTab('storico')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Eliminare questa sfida dal tabellone?')) return
    await deleteDoc(doc(db, 'sfide', id))
  }

  const { dam, lor } = computeScore(challenges)

  return (
    <div className="app">
      <Scoreboard challenges={challenges} dam={dam} lor={lor} />

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'tab-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="main">
        {loading ? (
          <p className="empty-state">Caricamento del tabellone…</p>
        ) : (
          <>
            {tab === 'storico' && <HistoryFeed challenges={challenges} onDelete={handleDelete} />}
            {tab === 'aggiungi' && <AddChallengeForm onSubmit={handleAdd} saving={saving} />}
            {tab === 'statistiche' && <StatsView challenges={challenges} />}
          </>
        )}
      </main>

      <footer className="footer">SFIDE · Damiano vs Lorenzo · dal 2011</footer>
    </div>
  )
}
