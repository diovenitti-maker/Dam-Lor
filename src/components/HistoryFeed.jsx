import { useMemo, useState } from 'react'
import { sortByDate } from '../utils/scoring.js'

const FILTERS = [
  { key: 'tutte', label: 'Tutte' },
  { key: 'Damiano', label: 'Damiano' },
  { key: 'Lorenzo', label: 'Lorenzo' },
  { key: 'Pareggio', label: 'Pareggi' },
  { key: 'Annullata', label: 'Annullate' },
]

export default function HistoryFeed({ challenges, onDelete, onUpdate }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('tutte')
  const [order, setOrder] = useState('desc')

  const filtered = useMemo(() => {
    let list = sortByDate(challenges)
    if (order === 'desc') list = [...list].reverse()

    if (filter !== 'tutte') {
      list = list.filter((c) => c.vittoria === filter)
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((c) =>
        [c.gara, c.descrizione, c.luogo, c.proposta]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(q))
      )
    }

    return list
  }, [challenges, query, filter, order])

  return (
    <section className="history">
      <div className="history-controls">
        <input
          className="search-input"
          type="text"
          placeholder="Cerca per gara, luogo, descrizione…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="filter-row">
          <div className="filter-pills">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`pill ${filter === f.key ? 'pill-active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button className="order-toggle" onClick={() => setOrder(order === 'desc' ? 'asc' : 'desc')}>
            {order === 'desc' ? '↓ Più recenti' : '↑ Più vecchie'}
          </button>
        </div>
      </div>

      <div className="history-count">{filtered.length} sfide</div>

      <ol className="timeline">
        {filtered.map((c) => (
          <HistoryCard key={c.id} challenge={c} onDelete={onDelete} onUpdate={onUpdate} />
        ))}
      </ol>

      {filtered.length === 0 && (
        <div className="empty-state">Nessuna sfida trovata. Prova un altro filtro o aggiungine una nuova.</div>
      )}
    </section>
  )
}

function HistoryCard({ challenge: c, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(toFormState(c))
  const [saving, setSaving] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function startEditing() {
    setForm(toFormState(c))
    setEditing(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await onUpdate(c.id, form)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <li className={`timeline-item side-${winnerSide(c.vittoria)}`}>
      <div className="timeline-card">
        {!editing ? (
          <>
            <div className="card-top">
              <span className="card-date">{formatData(c.data)}</span>
              <span className={`card-winner-badge badge-${winnerSide(c.vittoria)}`}>
                {c.vittoria === 'Pareggio' ? 'Pareggio' : c.vittoria === 'Annullata' ? 'Annullata' : c.vittoria}
              </span>
            </div>
            <h3 className="card-title">{c.gara}</h3>
            {c.descrizione && <p className="card-desc">{c.descrizione}</p>}
            <div className="card-meta">
              {c.luogo && <span>📍 {c.luogo}</span>}
              {c.proposta && <span>💡 Proposta di {c.proposta}</span>}
            </div>
            <div className="card-card-actions">
              {onUpdate && (
                <button className="card-edit" onClick={startEditing}>
                  Modifica
                </button>
              )}
              {onDelete && (
                <button className="card-delete" onClick={() => onDelete(c.id)} aria-label="Elimina sfida">
                  Elimina
                </button>
              )}
            </div>
          </>
        ) : (
          <form className="inline-complete-form" onSubmit={handleSave}>
            <label className="field">
              <span>Nome della gara</span>
              <input type="text" value={form.gara} onChange={(e) => update('gara', e.target.value)} required />
            </label>
            <div className="field-row">
              <label className="field">
                <span>Data</span>
                <input type="date" value={form.data} onChange={(e) => update('data', e.target.value)} required />
              </label>
              <label className="field">
                <span>Luogo</span>
                <input type="text" value={form.luogo} onChange={(e) => update('luogo', e.target.value)} />
              </label>
            </div>
            <div className="field-row">
              <label className="field">
                <span>Proposta da</span>
                <select value={form.proposta} onChange={(e) => update('proposta', e.target.value)}>
                  <option>Damiano</option>
                  <option>Lorenzo</option>
                  <option>Entrambi</option>
                </select>
              </label>
              <label className="field">
                <span>Chi ha vinto</span>
                <select value={form.vittoria} onChange={(e) => update('vittoria', e.target.value)}>
                  <option>Damiano</option>
                  <option>Lorenzo</option>
                  <option>Pareggio</option>
                  <option>Annullata</option>
                </select>
              </label>
            </div>
            <label className="field">
              <span>Descrizione</span>
              <textarea value={form.descrizione} onChange={(e) => update('descrizione', e.target.value)} rows={3} />
            </label>
            <div className="proposal-actions">
              <button type="button" className="btn-counter" onClick={() => setEditing(false)}>
                Annulla
              </button>
              <button type="submit" className="btn-accept" disabled={saving}>
                {saving ? 'Salvataggio…' : 'Salva modifiche'}
              </button>
            </div>
          </form>
        )}
      </div>
    </li>
  )
}

function toFormState(c) {
  return {
    gara: c.gara || '',
    descrizione: c.descrizione || '',
    luogo: c.luogo || '',
    data: c.data || '',
    proposta: c.proposta || 'Entrambi',
    vittoria: c.vittoria || 'Damiano',
  }
}

function winnerSide(vittoria) {
  if (vittoria === 'Damiano') return 'dam'
  if (vittoria === 'Lorenzo') return 'lor'
  return 'draw'
}

function formatData(dataStr) {
  const d = new Date(dataStr)
  if (isNaN(d)) return dataStr
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
}
