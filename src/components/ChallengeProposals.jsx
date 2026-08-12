import { useState } from 'react'

const EMPTY_LANCIO = {
  gara: '',
  descrizione: '',
  luogo: '',
  dataProposta: new Date().toISOString().slice(0, 10),
  lanciataDa: 'Damiano',
}

export default function ChallengeProposals({ proposte, onLancia, onAccetta, onRifiuta, onElimina, onCompleta }) {
  const [form, setForm] = useState(EMPTY_LANCIO)
  const [sending, setSending] = useState(false)

  const inSospeso = proposte.filter((p) => p.stato === 'in_sospeso')
  const accettate = proposte.filter((p) => p.stato === 'accettata')
  const rifiutate = proposte.filter((p) => p.stato === 'rifiutata')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.gara.trim()) return
    setSending(true)
    try {
      await onLancia(form)
      setForm(EMPTY_LANCIO)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="proposals">
      <form className="add-form" onSubmit={handleSubmit}>
        <h2 className="form-title">🚀 Lancia una sfida</h2>
        <label className="field">
          <span>Nome della gara</span>
          <input
            type="text"
            value={form.gara}
            onChange={(e) => update('gara', e.target.value)}
            placeholder="Es. Torneo di freccette"
            required
          />
        </label>
        <div className="field-row">
          <label className="field">
            <span>Data proposta</span>
            <input type="date" value={form.dataProposta} onChange={(e) => update('dataProposta', e.target.value)} required />
          </label>
          <label className="field">
            <span>Chi lancia la sfida</span>
            <select value={form.lanciataDa} onChange={(e) => update('lanciataDa', e.target.value)}>
              <option>Damiano</option>
              <option>Lorenzo</option>
            </select>
          </label>
        </div>
        <label className="field">
          <span>Luogo (opzionale)</span>
          <input type="text" value={form.luogo} onChange={(e) => update('luogo', e.target.value)} placeholder="Dove si terrà" />
        </label>
        <label className="field">
          <span>Descrizione / regole della sfida</span>
          <textarea
            value={form.descrizione}
            onChange={(e) => update('descrizione', e.target.value)}
            placeholder="Come si gioca, condizioni di vittoria…"
            rows={3}
          />
        </label>
        <button className="submit-btn" type="submit" disabled={sending}>
          {sending ? 'Lancio in corso…' : 'Lancia la sfida'}
        </button>
      </form>

      {inSospeso.length > 0 && (
        <div className="proposal-group">
          <h3 className="panel-title">⏳ In sospeso — in attesa di risposta</h3>
          {inSospeso.map((p) => (
            <div key={p.id} className="proposal-card">
              <div className="proposal-top">
                <span className={`badge-mini ${p.lanciataDa === 'Damiano' ? 'text-dam' : 'text-lor'}`}>
                  Lanciata da {p.lanciataDa}
                </span>
                <span className="card-date">{formatData(p.dataProposta)}</span>
              </div>
              <h4 className="card-title">{p.gara}</h4>
              {p.descrizione && <p className="card-desc">{p.descrizione}</p>}
              {p.luogo && <p className="card-meta">📍 {p.luogo}</p>}
              <div className="proposal-actions">
                <button className="btn-accept" onClick={() => onAccetta(p.id)}>
                  ✅ Accetta
                </button>
                <button className="btn-reject" onClick={() => onRifiuta(p.id)}>
                  ❌ Rifiuta
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {accettate.length > 0 && (
        <div className="proposal-group">
          <h3 className="panel-title">✅ Accettate — da giocare</h3>
          {accettate.map((p) => (
            <ProposalToComplete key={p.id} proposta={p} onCompleta={onCompleta} />
          ))}
        </div>
      )}

      {rifiutate.length > 0 && (
        <div className="proposal-group">
          <h3 className="panel-title">❌ Rifiutate</h3>
          {rifiutate.map((p) => (
            <div key={p.id} className="proposal-card proposal-card-muted">
              <div className="proposal-top">
                <span className="card-date">{p.gara}</span>
              </div>
              <button className="card-delete" onClick={() => onElimina(p.id)}>
                Elimina
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProposalToComplete({ proposta, onCompleta }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [vittoria, setVittoria] = useState('Damiano')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await onCompleta(proposta, { data, vittoria })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="proposal-card">
      <div className="proposal-top">
        <span className="card-date">Lanciata da {proposta.lanciataDa}</span>
      </div>
      <h4 className="card-title">{proposta.gara}</h4>
      {proposta.descrizione && <p className="card-desc">{proposta.descrizione}</p>}
      {proposta.luogo && <p className="card-meta">📍 {proposta.luogo}</p>}

      {!open ? (
        <button className="submit-btn" onClick={() => setOpen(true)}>
          Registra risultato
        </button>
      ) : (
        <form className="inline-complete-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <label className="field">
              <span>Data effettiva</span>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
            </label>
            <label className="field">
              <span>Chi ha vinto</span>
              <select value={vittoria} onChange={(e) => setVittoria(e.target.value)}>
                <option>Damiano</option>
                <option>Lorenzo</option>
                <option>Pareggio</option>
                <option>Annullata</option>
              </select>
            </label>
          </div>
          <button className="submit-btn" type="submit" disabled={saving}>
            {saving ? 'Salvataggio…' : 'Conferma risultato'}
          </button>
        </form>
      )}
    </div>
  )
}

function formatData(dataStr) {
  const d = new Date(dataStr)
  if (isNaN(d)) return dataStr
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
}
