import { useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'

const RULES_DOC = doc(db, 'meta', 'regolamento')

export default function Regolamento() {
  const [testo, setTesto] = useState('')
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(RULES_DOC, (snap) => {
      const t = snap.exists() ? snap.data().testo || '' : ''
      setTesto(t)
      setLoading(false)
    })
    return unsub
  }, [])

  function startEditing() {
    setDraft(testo)
    setEditing(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await setDoc(RULES_DOC, { testo: draft, updatedAt: serverTimestamp() })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rules-panel">
      <div className="rules-header">
        <h2 className="form-title">📜 Regolamento</h2>
        {!editing && (
          <button className="pill pill-active" onClick={startEditing}>
            Modifica
          </button>
        )}
      </div>

      {loading ? (
        <p className="empty-state">Caricamento…</p>
      ) : editing ? (
        <>
          <textarea
            className="rules-textarea"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={16}
            placeholder="Scrivi qui le regole ufficiali della rivalità Damiano vs Lorenzo…"
          />
          <div className="rules-actions">
            <button className="pill" onClick={() => setEditing(false)}>
              Annulla
            </button>
            <button className="submit-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvataggio…' : 'Salva regolamento'}
            </button>
          </div>
        </>
      ) : testo ? (
        <p className="rules-text">{testo}</p>
      ) : (
        <p className="empty-state">
          Nessun regolamento scritto ancora. Clicca "Modifica" per iniziare.
        </p>
      )}
    </section>
  )
}
