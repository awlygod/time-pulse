import { createContext, useContext, useState } from 'react'
import { mockTimeCapsuleAPI } from '../api/mockTimeCapsule'

const TimeCapsuleContext = createContext(null)

export function TimeCapsuleProvider({ children }) {
  const [user, setUser] = useState(null) // { address, email }

  const login = async () => {
    const userData = await mockTimeCapsuleAPI.login()
    setUser(userData)
    return userData
  }

  const logout = async () => {
    await mockTimeCapsuleAPI.logout()
    setUser(null)
  }

  const createCapsule = async (params) => {
    return await mockTimeCapsuleAPI.createCapsule(params)
  }

  const getCapsuleBalance = async (capsuleId) => {
    return await mockTimeCapsuleAPI.getCapsuleBalance(capsuleId)
  }

  const claimCapsule = async (capsuleId) => {
    return await mockTimeCapsuleAPI.claimCapsule(capsuleId)
  }

  const contributeToCapsule = async (capsuleId, asset, amount) => {
    return await mockTimeCapsuleAPI.contributeToCapsule(capsuleId, asset, amount)
  }

  return (
    <TimeCapsuleContext.Provider
      value={{
        user,
        login,
        logout,
        createCapsule,
        getCapsuleBalance,
        claimCapsule,
        contributeToCapsule,
      }}
    >
      {children}
    </TimeCapsuleContext.Provider>
  )
}

export function useTimeCapsule() {
  const ctx = useContext(TimeCapsuleContext)
  if (!ctx) throw new Error('useTimeCapsule must be used within TimeCapsuleProvider')
  return ctx
}