// Ordina le sfide per data crescente (poi per "n" storico come spareggio)
export function sortByDate(challenges) {
  return [...challenges].sort((a, b) => {
    const d = new Date(a.data) - new Date(b.data)
    if (d !== 0) return d
    return (a.n || 0) - (b.n || 0)
  })
}

// Calcola il punteggio finale: +1 al vincitore, invariato per Pareggio/Annullata
export function computeScore(challenges) {
  let dam = 0
  let lor = 0
  for (const c of challenges) {
    if (c.vittoria === 'Damiano') dam += 1
    else if (c.vittoria === 'Lorenzo') lor += 1
  }
  return { dam, lor }
}

// Serie temporale del punteggio cumulativo, per il grafico
export function computeTimeline(challenges) {
  const sorted = sortByDate(challenges)
  let dam = 0
  let lor = 0
  return sorted.map((c) => {
    if (c.vittoria === 'Damiano') dam += 1
    else if (c.vittoria === 'Lorenzo') lor += 1
    return { data: c.data, gara: c.gara, Damiano: dam, Lorenzo: lor }
  })
}

// Streak attuale (chi ha vinto le ultime sfide consecutive, escludendo pareggi/annullate)
export function computeStreak(challenges) {
  const sorted = sortByDate(challenges).filter(
    (c) => c.vittoria === 'Damiano' || c.vittoria === 'Lorenzo'
  )
  if (sorted.length === 0) return { chi: null, count: 0 }
  const last = sorted[sorted.length - 1].vittoria
  let count = 0
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].vittoria === last) count++
    else break
  }
  return { chi: last, count }
}

export function countByWinner(challenges, name) {
  return challenges.filter((c) => c.vittoria === name).length
}

// Luogo più ricorrente
export function topLuogo(challenges) {
  const counts = {}
  for (const c of challenges) {
    if (!c.luogo) continue
    counts[c.luogo] = (counts[c.luogo] || 0) + 1
  }
  let best = null
  let bestCount = 0
  for (const [luogo, count] of Object.entries(counts)) {
    if (count > bestCount) {
      best = luogo
      bestCount = count
    }
  }
  return best ? { luogo: best, count: bestCount } : null
}
