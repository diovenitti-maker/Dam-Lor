import { useMemo, useState } from 'react'
import { sortByDate } from '../utils/scoring.js'

const FILTERS = [
  { key: 'tutte', label: 'Tutte' },
  { key: 'Damiano', label: 'Damiano' },
  { key: 'Lorenzo', label: 'Lorenzo' },
  { key: 'Pareggio', label: 'Pareggi' },
]

export default function HistoryFeed({ challenges, onDelete }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('tutte')
  const [order, setOrder] = useState('desc')

  const filtered = useMemo(() => {
    let list = sortByDate(challenges)
    if (order === 'desc') list = [...list].reverse()

    if (filter !== 'tutte') {
      list = list.filter((c) =>
        filter === 'Pareggio'
          ? c.vittoria === 'Pareggio' || c.vittoria === 'Annullata'
          : c.vittoria === filter
      )
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
          <li key={c.id} className={`timeline-item side-${winnerSide(c.vittoria)}`}>
            <div className="timeline-card">
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
              {onDelete && (
                <button className="card-delete" onClick={() => onDelete(c.id)} aria-label="Elimina sfida">
                  Elimina
                </button>
              )}
            </div>
          </li>
        ))}
      </ol>

      {filtered.length === 0 && (
        <div className="empty-state">Nessuna sfida trovata. Prova un altro filtro o aggiungine una nuova.</div>
      )}
    </section>
  )
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
