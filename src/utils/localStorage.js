const KEY = 'tc_capsules'

export function getCapsules() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function saveCapsule(capsule) {
  const capsules = getCapsules()
  capsules.push(capsule)
  localStorage.setItem(KEY, JSON.stringify(capsules))
}

export function getCapsuleById(id) {
  return getCapsules().find((c) => c.id === id) || null
}

export function updateCapsule(id, updates) {
  const capsules = getCapsules()
  const idx = capsules.findIndex((c) => c.id === id)
  if (idx !== -1) {
    capsules[idx] = { ...capsules[idx], ...updates }
    localStorage.setItem(KEY, JSON.stringify(capsules))
  }
}

export function getCapsulesByCreator(address) {
  return getCapsules().filter((c) => c.creatorAddress === address)
}