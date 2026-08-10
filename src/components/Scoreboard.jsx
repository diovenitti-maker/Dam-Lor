import { computeStreak, topLuogo } from '../utils/scoring.js'

export default function Scoreboard({ challenges, dam, lor }) {
  const total = dam + lor
  const damPct = total === 0 ? 50 : (dam / total) * 100
  const streak = computeStreak(challenges)
  const luogo = topLuogo(challenges)
  const giocate = challenges.length
  const anni = anniDiSfida(challenges)

  return (
    <section className="scoreboard">
      <div className="scoreboard-eyebrow">DAL 2011 · {anni} ANNI DI RIVALITÀ</div>

      <div className="scoreboard-names">
        <span className="name name-dam">DAMIANO</span>
        <span className="vs">VS</span>
        <span className="name name-lor">LORENZO</span>
      </div>

      <div className="scoreboard-numbers">
        <span className="num num-dam">{dam}</span>
        <span className="num-sep">–</span>
        <span className="num num-lor">{lor}</span>
      </div>

      <div className="tug-bar" role="img" aria-label={`Punteggio: Damiano ${dam}, Lorenzo ${lor}`}>
        <div className="tug-fill-dam" style={{ width: `${damPct}%` }} />
        <div className="tug-flag" style={{ left: `${damPct}%` }} />
      </div>

      <div className="scoreboard-chips">
        <div className="chip">
          <span className="chip-label">Sfide giocate</span>
          <span className="chip-value">{giocate}</span>
        </div>
        <div className="chip">
          <span className="chip-label">Striscia in corso</span>
          <span className={`chip-value ${streak.chi === 'Damiano' ? 'text-dam' : streak.chi === 'Lorenzo' ? 'text-lor' : ''}`}>
            {streak.count > 0 ? `${streak.count}× ${streak.chi}` : '—'}
          </span>
        </div>
        <div className="chip">
          <span className="chip-label">Arena preferita</span>
          <span className="chip-value chip-value-small">{luogo ? luogo.luogo : '—'}</span>
        </div>
      </div>
    </section>
  )
}

function anniDiSfida(challenges) {
  if (challenges.length === 0) return 0
  const years = challenges.map((c) => new Date(c.data).getFullYear()).filter((y) => !isNaN(y))
  if (years.length === 0) return 0
  return Math.max(...years) - Math.min(...years)
}
