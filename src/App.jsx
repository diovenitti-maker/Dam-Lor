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
  updateDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase.js'
import Scoreboard from './components/Scoreboard.jsx'
import HistoryFeed from './components/HistoryFeed.jsx'
import AddChallengeForm from './components/AddChallengeForm.jsx'
import StatsView from './components/StatsView.jsx'
import Regolamento from './components/Regolamento.jsx'
import ChallengeProposals from './components/ChallengeProposals.jsx'
import { computeScore } from './utils/scoring.js'
import seedData from './data/seed.json'
import './App.css'

const TABS_TOP = [
  { key: 'storico', label: 'Storico' },
  { key: 'statistiche', label: 'Statistiche' },
]

const TABS_BOTTOM = [
  { key: 'regolamento', label: 'Regolamento' },
  { key: 'aggiungi', label: 'Aggiungi sfida' },
]

export default function App() {
  const [challenges, setChallenges] = useState([])
  const [proposte, setProposte] = useState([])
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
    const unsub = onSnapshot(collection(db, 'proposte'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setProposte(list)
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

  async function handleUpdate(id, form) {
    await updateDoc(doc(db, 'sfide', id), { ...form })
  }

  async function handleLancia(form) {
    await addDoc(collection(db, 'proposte'), { ...form, stato: 'in_sospeso', createdAt: serverTimestamp() })
  }

  async function handleAccetta(id) {
    await updateDoc(doc(db, 'proposte', id), { stato: 'accettata' })
  }

  async function handleRilancia(proposta, nuovoForm) {
    await addDoc(collection(db, 'proposte'), { ...nuovoForm, stato: 'in_sospeso', createdAt: serverTimestamp() })
    await deleteDoc(doc(db, 'proposte', proposta.id))
  }

  async function handleCompletaProposta(proposta, result) {
    await addDoc(collection(db, 'sfide'), {
      gara: proposta.gara,
      proposta: proposta.lanciataDa,
      descrizione: proposta.descrizione || '',
      luogo: proposta.luogo || '',
      data: result.data,
      vittoria: result.vittoria,
      createdAt: serverTimestamp(),
    })
    await deleteDoc(doc(db, 'proposte', proposta.id))
  }

  const { dam, lor } = computeScore(challenges)
  const pendingCount = proposte.filter((p) => p.stato === 'in_sospeso').length

  return (
    <div className="app">
      <Scoreboard challenges={challenges} dam={dam} lor={lor} />

      <nav className="tabs">
        {TABS_TOP.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'tab-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <nav className="tabs tabs-secondary">
        {TABS_BOTTOM.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'tab-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.key === 'aggiungi' && pendingCount > 0 && (
              <span className="tab-badge">{pendingCount}</span>
            )}
          </button>
        ))}
      </nav>

      <main className="main">
        {loading ? (
          <p className="empty-state">Caricamento del tabellone…</p>
        ) : (
          <>
            {tab === 'storico' && (
              <HistoryFeed challenges={challenges} onDelete={handleDelete} onUpdate={handleUpdate} />
            )}
            {tab === 'statistiche' && <StatsView challenges={challenges} />}
            {tab === 'regolamento' && <Regolamento />}
            {tab === 'aggiungi' && (
              <>
                <ChallengeProposals
                  proposte={proposte}
                  onLancia={handleLancia}
                  onAccetta={handleAccetta}
                  onRilancia={handleRilancia}
                  onCompleta={handleCompletaProposta}
                />
                <div className="section-divider">Oppure registra subito un risultato</div>
                <AddChallengeForm onSubmit={handleAdd} saving={saving} />
              </>
            )}
          </>
        )}
      </main>

      <footer className="footer">SFIDE · Damiano vs Lorenzo · dal 2011</footer>
    </div>
  )
}
