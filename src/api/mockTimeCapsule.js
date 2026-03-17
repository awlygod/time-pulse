// Mock implementation of TimeCapsuleAPI
// Replace this file with real SDK calls when backend is ready

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

export const mockTimeCapsuleAPI = {
  async login() {
    await delay(1200)
    return {
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      email: 'user@example.com',
    }
  },

  async logout() {
    await delay(400)
  },

  async createCapsule({ asset, amount, unlockDate, message }) {
    await delay(1800)
    const capsuleId = Date.now().toString()
    return {
      txHash: '0x' + Math.random().toString(16).slice(2, 66),
      capsuleId,
    }
  },

  async getCapsuleBalance(capsuleId) {
    await delay(600)
    // Simulate small yield based on current time vs creation (stored in localStorage)
    const capsules = JSON.parse(localStorage.getItem('tc_capsules') || '[]')
    const capsule = capsules.find((c) => c.id === capsuleId)
    if (!capsule) return { principal: 0, currentValue: 0, yield: 0 }

    const elapsed = Date.now() - capsule.createdAt
    const yieldRate = 0.05 / (365 * 24 * 60 * 60 * 1000) // 5% APY in ms
    const earnedYield = capsule.amount * yieldRate * elapsed

    return {
      principal: capsule.amount,
      currentValue: parseFloat((capsule.amount + earnedYield).toFixed(6)),
      yield: parseFloat(earnedYield.toFixed(6)),
    }
  },

  async claimCapsule(capsuleId) {
    await delay(2000)
    return {
      txHash: '0x' + Math.random().toString(16).slice(2, 66),
    }
  },

  async contributeToCapsule(capsuleId, asset, amount) {
    await delay(1500)
    return {
      txHash: '0x' + Math.random().toString(16).slice(2, 66),
    }
  },
}