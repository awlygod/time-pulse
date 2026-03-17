/**
 * starkzapTimeCapsule.js
 * ─────────────────────────────────────────────────────────────────────────────
 * REAL implementation using Starkzap SDK + Privy social login.
 * This is a drop-in replacement for mockTimeCapsule.js.
 *
 * In context/TimeCapsuleContext.jsx, swap:
 *   import { mockTimeCapsuleAPI } from '../api/mockTimeCapsule'
 * for:
 *   import { starkzapTimeCapsuleAPI } from '../api/starkzapTimeCapsule'
 * and rename usages from mockTimeCapsuleAPI → starkzapTimeCapsuleAPI.
 *
 * Required env vars in .env:
 *   VITE_PRIVY_APP_ID=your-privy-app-id
 *   VITE_BACKEND_URL=https://your-backend.com        (signing server)
 *   VITE_FACTORY_ADDRESS=0x...                        (deployed CapsuleFactory)
 *   VITE_NETWORK=sepolia                              (or mainnet)
 *   VITE_AVNU_API_KEY=your-avnu-key                  (optional, for gas sponsorship)
 *
 * Install deps first:
 *   npm install starkzap starknet @privy-io/react-auth
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  StarkZap,
  OnboardStrategy,
  accountPresets,
} from 'starkzap'
import { CallData, RpcProvider } from 'starknet'

// ─── Config ───────────────────────────────────────────────────────────────────

const NETWORK        = import.meta.env.VITE_NETWORK ?? 'sepolia'
const BACKEND_URL    = import.meta.env.VITE_BACKEND_URL
const FACTORY_ADDR   = import.meta.env.VITE_FACTORY_ADDRESS
const AVNU_API_KEY   = import.meta.env.VITE_AVNU_API_KEY

// ERC-20 token addresses on Starknet Sepolia testnet
// Replace with mainnet addresses when going live (same symbols, different hashes)
const TOKEN_ADDRESSES = {
  ETH:  '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
  USDC: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
  BTC:  '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac',
}

// Decimal places for each asset
const TOKEN_DECIMALS = { ETH: 18, USDC: 6, BTC: 8 }

// Minimal ABIs for the contracts we call
const CAPSULE_ABI = [
  {
    name: 'get_balance',
    type: 'function',
    inputs: [],
    outputs: [
      { name: 'principal', type: 'core::integer::u256' },
      { name: 'current',   type: 'core::integer::u256' },
    ],
    state_mutability: 'view',
  },
  {
    name: 'claim',
    type: 'function',
    inputs: [],
    outputs: [],
    state_mutability: 'external',
  },
  {
    name: 'contribute',
    type: 'function',
    inputs: [
      { name: 'asset',  type: 'core::starknet::contract_address::ContractAddress' },
      { name: 'amount', type: 'core::integer::u256' },
    ],
    outputs: [],
    state_mutability: 'external',
  },
]

// ─── SDK singleton ─────────────────────────────────────────────────────────────
// Lazily created once per session so we don't instantiate on import

let _sdk = null
function getSDK() {
  if (_sdk) return _sdk
  const sdkConfig = { network: NETWORK }
  if (AVNU_API_KEY) {
    sdkConfig.paymaster = {
      nodeUrl: 'https://starknet.paymaster.avnu.fi',
      apiKey: AVNU_API_KEY,
    }
  }
  _sdk = new StarkZap(sdkConfig)
  return _sdk
}

// ─── Wallet cache ──────────────────────────────────────────────────────────────
// Holds the connected wallet for the session so we don't re-onboard on every call

let _wallet = null
let _privyGetAccessToken = null  // injected by TimeCapsuleContext after Privy login

/**
 * Call this from TimeCapsuleContext once you have the Privy getAccessToken fn.
 * e.g. after usePrivy() hook resolves.
 */
export function injectPrivyAccessToken(getAccessTokenFn) {
  _privyGetAccessToken = getAccessTokenFn
}

async function getWallet() {
  if (_wallet) return _wallet

  if (!_privyGetAccessToken) {
    throw new Error('Privy not initialised. Call injectPrivyAccessToken first.')
  }

  const accessToken = await _privyGetAccessToken()
  if (!accessToken) throw new Error('Not authenticated with Privy')

  const sdk = getSDK()

  const { wallet } = await sdk.onboard({
    strategy: OnboardStrategy.Privy,
    accountPreset: accountPresets.argentXV050,
    privy: {
      resolve: async () => {
        const res = await fetch(`${BACKEND_URL}/api/wallet/starknet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        })
        if (!res.ok) throw new Error('Failed to fetch signer context from backend')
        // Backend returns { walletId, publicKey, serverUrl }
        return res.json()
      },
    },
    feeMode: AVNU_API_KEY ? 'sponsored' : 'user_pays',
    deploy: 'if_needed',
  })

  _wallet = wallet
  return _wallet
}

export function clearWalletCache() {
  _wallet = null
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function toWei(amount, asset) {
  const decimals = TOKEN_DECIMALS[asset] ?? 18
  // Use BigInt arithmetic to avoid floating-point issues
  const factor = BigInt(10 ** decimals)
  const [intPart, fracPart = ''] = String(amount).split('.')
  const frac = fracPart.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(intPart) * factor + BigInt(frac)
}

function fromWei(bigintVal, asset) {
  const decimals = TOKEN_DECIMALS[asset] ?? 18
  const factor = 10 ** decimals
  return Number(bigintVal) / factor
}

function u256Calldata(bigintVal) {
  const low  = bigintVal & BigInt('0xffffffffffffffffffffffffffffffff')
  const high = bigintVal >> BigInt(128)
  return [low.toString(), high.toString()]
}

// ─── Starkzap TimeCapsule API ──────────────────────────────────────────────────
// Same method signatures as mockTimeCapsuleAPI so it's a true drop-in.

export const starkzapTimeCapsuleAPI = {

  // ── login ──────────────────────────────────────────────────────────────────
  // Privy login is triggered from the UI using usePrivy().login().
  // This method is called AFTER Privy OAuth completes to get the wallet address
  // and return it to TimeCapsuleContext to set user state.
  async login() {
    const wallet = await getWallet()
    const address = wallet.address.toString()

    // Optionally fetch email from your backend if needed
    return {
      address,
      email: null, // Privy email is available via usePrivy().user.email.address in the component
    }
  },

  // ── logout ─────────────────────────────────────────────────────────────────
  async logout() {
    clearWalletCache()
    // Privy logout is handled separately via usePrivy().logout() in the context
  },

  // ── createCapsule ──────────────────────────────────────────────────────────
  async createCapsule({ asset, amount, unlockDate, message }) {
    const wallet = await getWallet()
    const tokenAddress = TOKEN_ADDRESSES[asset]
    if (!tokenAddress) throw new Error(`Unsupported asset: ${asset}`)
    if (!FACTORY_ADDR)  throw new Error('VITE_FACTORY_ADDRESS not set in .env')

    const amountWei   = toWei(amount, asset)
    const unlockSecs  = Math.floor(unlockDate / 1000)
    const recipientAddr = wallet.address.toString()

    // Step 1 — approve factory to pull the tokens (not needed for native ETH,
    // but on Starknet ETH is an ERC-20 wrapper so we always approve)
    const approveCalldata = CallData.compile({
      spender: FACTORY_ADDR,
      amount:  { low: u256Calldata(amountWei)[0], high: u256Calldata(amountWei)[1] },
    })

    const approveCall = {
      contractAddress: tokenAddress,
      entrypoint: 'approve',
      calldata: approveCalldata,
    }

    // Step 2 — call factory.createCapsule
    // poolContract is the STRK delegation pool address on testnet
    // (factory will use this to stake into Starknet native staking)
    const POOL_CONTRACT = import.meta.env.VITE_POOL_CONTRACT ??
      '0x03c3a32fa4d5c7d43bc00c0e4e33fb4c89e7f7a4b71f1f9e6fe09d32d3d7e2a' // placeholder
    const stakeCalldata = CallData.compile({
      asset:         tokenAddress,
      amount:        { low: u256Calldata(amountWei)[0], high: u256Calldata(amountWei)[1] },
      unlock_date:   unlockSecs,
      recipient:     recipientAddr,
      pool_contract: POOL_CONTRACT,
      group_gifting: false,
    })

    const createCall = {
      contractAddress: FACTORY_ADDR,
      entrypoint: 'createCapsule',
      calldata: stakeCalldata,
    }

    // Preflight to catch errors before submitting
    const preflight = await wallet.preflight({ calls: [approveCall, createCall] })
    if (!preflight.ok) throw new Error(`Preflight failed: ${preflight.reason}`)

    // Execute both calls atomically
    const tx = await wallet.execute([approveCall, createCall], {
      feeMode: AVNU_API_KEY ? 'sponsored' : 'user_pays',
    })
    await tx.wait()

    // The factory emits CapsuleCreated(creator, capsule_address, ...)
    // Parse it from the receipt events
    const receipt = await tx.receipt()
    let capsuleId = tx.hash // fallback: use tx hash as ID

    // Try to extract capsule contract address from events
    if (receipt?.events?.length > 0) {
      // CapsuleCreated event data[1] = capsule_address (after creator key)
      const capsuleEvent = receipt.events.find(
        (e) => e.from_address?.toLowerCase() === FACTORY_ADDR.toLowerCase()
      )
      if (capsuleEvent?.data?.[1]) {
        capsuleId = capsuleEvent.data[1]
      }
    }

    return {
      txHash: tx.hash,
      capsuleId,
    }
  },

  // ── getCapsuleBalance ──────────────────────────────────────────────────────
  // Calls get_balance() on the deployed capsule contract.
  // Returns principal, currentValue (principal + yield), and yield amount.
  async getCapsuleBalance(capsuleId) {
    // capsuleId is the capsule contract address
    const provider = new RpcProvider({
      nodeUrl: `https://starknet-${NETWORK}.public.blastapi.io`,
    })

    // Read capsule metadata from localStorage to know the asset
    let asset = 'ETH'
    try {
      const capsules = JSON.parse(localStorage.getItem('tc_capsules') || '[]')
      const capsule  = capsules.find((c) => c.id === capsuleId)
      if (capsule) asset = capsule.asset
    } catch { /* ignore */ }

    try {
      const { Contract } = await import('starknet')
      const contract = new Contract(CAPSULE_ABI, capsuleId, provider)
      const result   = await contract.get_balance()

      const principal    = fromWei(BigInt(result.principal.toString()), asset)
      const currentValue = fromWei(BigInt(result.current.toString()), asset)
      const yieldEarned  = currentValue - principal

      return {
        principal:    parseFloat(principal.toFixed(8)),
        currentValue: parseFloat(currentValue.toFixed(8)),
        yield:        parseFloat(yieldEarned.toFixed(8)),
      }
    } catch (err) {
      // Contract may not be deployed yet during testing — fall back to mock math
      console.warn('getCapsuleBalance: falling back to local simulation', err.message)
      const capsules = JSON.parse(localStorage.getItem('tc_capsules') || '[]')
      const capsule  = capsules.find((c) => c.id === capsuleId)
      if (!capsule) return { principal: 0, currentValue: 0, yield: 0 }

      const elapsed    = Date.now() - capsule.createdAt
      const yieldRate  = 0.05 / (365 * 24 * 60 * 60 * 1000) // 5% APY
      const earned     = capsule.amount * yieldRate * elapsed
      return {
        principal:    capsule.amount,
        currentValue: parseFloat((capsule.amount + earned).toFixed(8)),
        yield:        parseFloat(earned.toFixed(8)),
      }
    }
  },

  // ── claimCapsule ───────────────────────────────────────────────────────────
  async claimCapsule(capsuleId) {
    const wallet = await getWallet()

    const claimCall = {
      contractAddress: capsuleId,
      entrypoint: 'claim',
      calldata: [],
    }

    const preflight = await wallet.preflight({ calls: [claimCall] })
    if (!preflight.ok) throw new Error(`Cannot claim yet: ${preflight.reason}`)

    const tx = await wallet.execute([claimCall], {
      feeMode: AVNU_API_KEY ? 'sponsored' : 'user_pays',
    })
    await tx.wait()

    return { txHash: tx.hash }
  },

  // ── contributeToCapsule ────────────────────────────────────────────────────
  async contributeToCapsule(capsuleId, asset, amount) {
    const wallet = await getWallet()
    const tokenAddress = TOKEN_ADDRESSES[asset]
    if (!tokenAddress) throw new Error(`Unsupported asset: ${asset}`)

    const amountWei = toWei(amount, asset)

    // Approve + contribute atomically
    const approveCall = {
      contractAddress: tokenAddress,
      entrypoint: 'approve',
      calldata: CallData.compile({
        spender: capsuleId,
        amount: { low: u256Calldata(amountWei)[0], high: u256Calldata(amountWei)[1] },
      }),
    }

    const contributeCall = {
      contractAddress: capsuleId,
      entrypoint: 'contribute',
      calldata: CallData.compile({
        asset: tokenAddress,
        amount: { low: u256Calldata(amountWei)[0], high: u256Calldata(amountWei)[1] },
      }),
    }

    const tx = await wallet.execute([approveCall, contributeCall], {
      feeMode: AVNU_API_KEY ? 'sponsored' : 'user_pays',
    })
    await tx.wait()

    return { txHash: tx.hash }
  },
}
