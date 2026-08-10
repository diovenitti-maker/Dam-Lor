import { useState } from 'react'

const EMPTY = {
  gara: '',
  proposta: 'Entrambi',
  descrizione: '',
  data: new Date().toISOString().slice(0, 10),
  luogo: '',
  vittoria: 'Damiano',
}

export default function AddChallengeForm({ onSubmit, saving }) {
  const [form, setForm] = useState(EMPTY)
  const [justSaved, setJustSaved] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.gara.trim()) return
    await onSubmit(form)
    setForm(EMPTY)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2500)
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Nuova sfida</h2>

      <label className="field">
        <span>Nome della gara</span>
        <input
          type="text"
          value={form.gara}
          onChange={(e) => update('gara', e.target.value)}
          placeholder="Es. Braccio di ferro"
          required
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span>Data</span>
          <input type="date" value={form.data} onChange={(e) => update('data', e.target.value)} required />
        </label>
        <label className="field">
          <span>Luogo</span>
          <input
            type="text"
            value={form.luogo}
            onChange={(e) => update('luogo', e.target.value)}
            placeholder="Es. Campo 8 Settembre, Frascati"
          />
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
        <textarea
          value={form.descrizione}
          onChange={(e) => update('descrizione', e.target.value)}
          placeholder="Regole, punteggi, dettagli della sfida…"
          rows={4}
        />
      </label>

      <button className="submit-btn" type="submit" disabled={saving}>
        {saving ? 'Salvataggio…' : justSaved ? '✓ Sfida aggiunta!' : 'Aggiungi al tabellone'}
      </button>
    </form>
  )
}
