/**
 * context/TimeCapsuleContext.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Upgraded from mock to real Starkzap + Privy.
 *
 * Changes from original:
 *  1. Imports usePrivy from @privy-io/react-auth to get access token + user email.
 *  2. Injects the Privy getAccessToken fn into the Starkzap API so it can
 *     authenticate backend calls without requiring a full SDK re-init.
 *  3. Exposes `isLoading` and `error` state used by Header and pages.
 *  4. login() now triggers Privy OAuth *then* fetches the Starknet wallet.
 *  5. logout() clears Privy session + wallet cache.
 *
 * IMPORTANT: This file must be a child of <PrivyProvider> in main.jsx.
 * See main.jsx for the full provider setup.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import {
  starkzapTimeCapsuleAPI,
  injectPrivyAccessToken,
  clearWalletCache,
} from '../api/starkzapTimeCapsule'

const TimeCapsuleContext = createContext(null)

export function TimeCapsuleProvider({ children }) {
  const {
    ready,          // true once Privy has initialised
    authenticated,  // true if user has logged in
    user: privyUser,
    login: privyLogin,
    logout: privyLogout,
    getAccessToken,
  } = usePrivy()

  const [user, setUser]         = useState(null)   // { address, email }
  const [isLoading, setLoading] = useState(false)
  const [error, setError]       = useState(null)

  // As soon as Privy is ready, inject getAccessToken so the API module can use it
  useEffect(() => {
    if (ready) {
      injectPrivyAccessToken(getAccessToken)
    }
  }, [ready, getAccessToken])

  // If the user is already authenticated (e.g. page refresh with live session),
  // re-hydrate the user state from Privy + localStorage so they don't have to
  // click "Connect" again.
  useEffect(() => {
    if (ready && authenticated && privyUser && !user) {
      // Restore address from localStorage if we already fetched it
      const stored = localStorage.getItem('tc_user')
      if (stored) {
        try { setUser(JSON.parse(stored)); return } catch { /* ignore */ }
      }
      // Otherwise silently fetch the wallet address
      starkzapTimeCapsuleAPI.login()
        .then((userData) => {
          const fullUser = {
            address: userData.address,
            email: privyUser?.email?.address ?? null,
          }
          setUser(fullUser)
          localStorage.setItem('tc_user', JSON.stringify(fullUser))
        })
        .catch(console.error)
    }
    if (ready && !authenticated) {
      setUser(null)
      localStorage.removeItem('tc_user')
    }
  }, [ready, authenticated])

  // ── login ──────────────────────────────────────────────────────────────────
  // 1. Opens Privy modal (Google / email OAuth)
  // 2. After Privy sets authenticated=true, we fetch the Starknet wallet
  const login = async () => {
    setLoading(true)
    setError(null)
    try {
      // Open Privy login modal — resolves when user completes OAuth
      await privyLogin()

      // getAccessToken is now available; fetch the Starknet wallet address
      const walletData = await starkzapTimeCapsuleAPI.login()
      const fullUser = {
        address: walletData.address,
        email: privyUser?.email?.address ?? null,
      }
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

  // ── logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    setLoading(true)
    try {
      await starkzapTimeCapsuleAPI.logout()
      await privyLogout()
      setUser(null)
      localStorage.removeItem('tc_user')
      clearWalletCache()
    } finally {
      setLoading(false)
    }
  }

  // ── createCapsule ──────────────────────────────────────────────────────────
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

  // ── getCapsuleBalance ──────────────────────────────────────────────────────
  const getCapsuleBalance = async (capsuleId) => {
    // No global loading spinner for balance polls (would be distracting on 30s interval)
    try {
      return await starkzapTimeCapsuleAPI.getCapsuleBalance(capsuleId)
    } catch (err) {
      console.error('getCapsuleBalance error:', err)
      throw err
    }
  }

  // ── claimCapsule ───────────────────────────────────────────────────────────
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

  // ── contributeToCapsule ────────────────────────────────────────────────────
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
        // Expose Privy readiness so Header can disable Connect while Privy loads
        privyReady: ready,
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
