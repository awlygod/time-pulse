import { createContext, useContext, useState, useEffect } from 'react'
import {
  starkzapTimeCapsuleAPI,
  clearWalletCache,
} from '../api/starkzapTimeCapsule'

const TimeCapsuleContext = createContext(null)

export function TimeCapsuleProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [isLoading, setLoading] = useState(false)
  const [error, setError]       = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('tc_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { /* ignore */ }
    }
  }, [])

  const login = async () => {
    setLoading(true)
    setError(null)
    try {
      const walletData = await starkzapTimeCapsuleAPI.login()
      const fullUser = { address: walletData.address, email: walletData.email ?? null }
      setUser(fullUser)
      localStorage.setItem('tc_user', JSON.stringify(fullUser))
      return fullUser
    } catch (err) {
      setError(err.message ?? 'Login failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await starkzapTimeCapsuleAPI.logout()
      setUser(null)
      localStorage.removeItem('tc_user')
      clearWalletCache()
    } finally {
      setLoading(false)
    }
  }

  const createCapsule = async (params) => {
    setLoading(true)
    setError(null)
    try {
      return await starkzapTimeCapsuleAPI.createCapsule(params)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getCapsuleBalance = async (capsuleId) => {
    try {
      return await starkzapTimeCapsuleAPI.getCapsuleBalance(capsuleId)
    } catch (err) {
      console.error('getCapsuleBalance error:', err)
      throw err
    }
  }

  const claimCapsule = async (capsuleId) => {
    setLoading(true)
    setError(null)
    try {
      return await starkzapTimeCapsuleAPI.claimCapsule(capsuleId)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const contributeToCapsule = async (capsuleId, asset, amount) => {
    setLoading(true)
    setError(null)
    try {
      return await starkzapTimeCapsuleAPI.contributeToCapsule(capsuleId, asset, amount)
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return (
    <TimeCapsuleContext.Provider
      value={{
        user,
        isLoading,
        error,
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