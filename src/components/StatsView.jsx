import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { computeTimeline, countByWinner } from '../utils/scoring.js'

export default function StatsView({ challenges }) {
  const timeline = computeTimeline(challenges)
  const damWins = countByWinner(challenges, 'Damiano')
  const lorWins = countByWinner(challenges, 'Lorenzo')
  const draws = challenges.filter((c) => c.vittoria === 'Pareggio').length
  const annullate = challenges.filter((c) => c.vittoria === 'Annullata').length

  const luoghiCounts = {}
  for (const c of challenges) {
    if (!c.luogo) continue
    luoghiCounts[c.luogo] = (luoghiCounts[c.luogo] || 0) + 1
  }
  const topLuoghi = Object.entries(luoghiCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <section className="stats">
      <div className="stat-cards">
        <StatCard label="Vittorie Damiano" value={damWins} color="var(--dam)" />
        <StatCard label="Vittorie Lorenzo" value={lorWins} color="var(--lor)" />
        <StatCard label="Pareggi" value={draws} color="var(--draw)" />
        <StatCard label="Annullate" value={annullate} color="var(--void)" />
      </div>

      <div className="chart-panel">
        <h3 className="panel-title">Andamento del punteggio nel tempo</h3>
        {timeline.length > 1 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={timeline} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232a38" />
              <XAxis
                dataKey="data"
                tick={{ fill: '#838ba0', fontSize: 11 }}
                tickFormatter={(v) => new Date(v).getFullYear()}
                minTickGap={30}
              />
              <YAxis tick={{ fill: '#838ba0', fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#151a24', border: '1px solid #232a38', borderRadius: 8 }}
                labelStyle={{ color: '#eef1f7' }}
                labelFormatter={(v) => new Date(v).toLocaleDateString('it-IT')}
              />
              <Line type="stepAfter" dataKey="Damiano" stroke="#3fa9f5" strokeWidth={2} dot={false} />
              <Line type="stepAfter" dataKey="Lorenzo" stroke="#ff7a45" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="empty-state">Servono almeno due sfide per tracciare l'andamento.</p>
        )}
      </div>

      <div className="chart-panel">
        <h3 className="panel-title">Arene più gettonate</h3>
        {topLuoghi.length > 0 ? (
          <ul className="luoghi-list">
            {topLuoghi.map(([luogo, count]) => (
              <li key={luogo} className="luoghi-row">
                <span className="luoghi-name">{luogo}</span>
                <span className="luoghi-bar-track">
                  <span
                    className="luoghi-bar-fill"
                    style={{ width: `${(count / topLuoghi[0][1]) * 100}%` }}
                  />
                </span>
                <span className="luoghi-count">{count}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">Nessun dato sulle arene ancora.</p>
        )}
      </div>
    </section>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card" style={{ borderColor: color }}>
      <span className="stat-card-value" style={{ color }}>
        {value}
      </span>
      <span className="stat-card-label">{label}</span>
    </div>
  )
}
