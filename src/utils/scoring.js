// Converte una data (stringa ISO "YYYY-MM-DD", "DD/MM/YYYY", o altro formato) in un timestamp comparabile
function parseDateSafe(str) {
  if (!str) return 0
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(str)
  if (iso) {
    const [, y, m, d] = iso
    return Date.UTC(Number(y), Number(m) - 1, Number(d))
  }
  const dmy = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(str)
  if (dmy) {
    const [, d, m, y] = dmy
    return Date.UTC(Number(y), Number(m) - 1, Number(d))
  }
  const t = new Date(str).getTime()
  return isNaN(t) ? 0 : t
}

// Ordina le sfide per data crescente. A parità di data usa "n" (ordine storico dell'Excel)
// quando presente, altrimenti l'orario di inserimento (createdAt) come spareggio stabile.
export function sortByDate(challenges) {
  return [...challenges].sort((a, b) => {
    const da = parseDateSafe(a.data)
    const db = parseDateSafe(b.data)
    if (da !== db) return da - db

    if (a.n != null && b.n != null) return a.n - b.n

    const ca = a.createdAt?.seconds ?? 0
    const cb = b.createdAt?.seconds ?? 0
    return ca - cb
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

// Il filotto più lungo di sempre (record), tra tutte le sfide vinte da un giocatore di fila
export function computeLongestStreak(challenges) {
  const sorted = sortByDate(challenges).filter(
    (c) => c.vittoria === 'Damiano' || c.vittoria === 'Lorenzo'
  )
  if (sorted.length === 0) return { chi: null, count: 0 }

  let bestChi = sorted[0].vittoria
  let bestCount = 1
  let curChi = sorted[0].vittoria
  let curCount = 1

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].vittoria === curChi) {
      curCount++
    } else {
      curChi = sorted[i].vittoria
      curCount = 1
    }
    if (curCount > bestCount) {
      bestCount = curCount
      bestChi = curChi
    }
  }

  return { chi: bestChi, count: bestCount }
}

// Il record di filotto per ciascun giocatore separatamente
export function computeLongestStreakByPlayer(challenges) {
  const sorted = sortByDate(challenges).filter(
    (c) => c.vittoria === 'Damiano' || c.vittoria === 'Lorenzo'
  )
  const best = { Damiano: 0, Lorenzo: 0 }
  if (sorted.length === 0) return best

  let curChi = sorted[0].vittoria
  let curCount = 1
  best[curChi] = 1

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].vittoria === curChi) {
      curCount++
    } else {
      curChi = sorted[i].vittoria
      curCount = 1
    }
    if (curCount > best[curChi]) best[curChi] = curCount
  }

  return best
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
