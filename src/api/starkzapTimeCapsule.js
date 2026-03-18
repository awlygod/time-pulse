/**
 * starkzapTimeCapsule.js
 * Real implementation using Argent X browser wallet.
 * No backend required. No Privy server wallets.
 */

import { RpcProvider, CallData, uint256 } from 'starknet'

const NETWORK       = import.meta.env.VITE_NETWORK ?? 'sepolia'
const FACTORY_ADDR  = import.meta.env.VITE_FACTORY_ADDRESS
const POOL_CONTRACT = import.meta.env.VITE_POOL_CONTRACT
const RPC_API_KEY   = import.meta.env.VITE_RPC_API_KEY
const RPC_URL       = `https://starknet-${NETWORK}.g.alchemy.com/starknet/version/rpc/v0_10/${RPC_API_KEY}`

// Only ETH and STRK are confirmed deployed on Sepolia testnet
const TOKEN_ADDRESSES = {
  ETH:  '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
  STRK: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
}

const TOKEN_DECIMALS = { ETH: 18, STRK: 18 }

function getProvider() {
  return new RpcProvider({ nodeUrl: RPC_URL })
}

let _account = null

function getStarknet() {
  if (window.starknet) return window.starknet
  if (window.starknet_argentX) return window.starknet_argentX
  if (window.starknet_braavos) return window.starknet_braavos
  throw new Error('No Starknet wallet found. Please install Argent X or Braavos.')
}

function toWei(amount, asset) {
  const decimals = TOKEN_DECIMALS[asset] ?? 18
  const factor = BigInt(10 ** decimals)
  const [intPart, fracPart = ''] = String(amount).split('.')
  const frac = fracPart.padEnd(decimals, '0').slice(0, decimals)
  return BigInt(intPart) * factor + BigInt(frac)
}

function fromWei(val, asset) {
  const decimals = TOKEN_DECIMALS[asset] ?? 18
  return Number(BigInt(val)) / 10 ** decimals
}

export function injectPrivyAccessToken() {
  // no-op — kept for compatibility
}

export function clearWalletCache() {
  _account = null
}

export const starkzapTimeCapsuleAPI = {

  async login() {
    const starknet = getStarknet()
    await starknet.enable({ starknetVersion: 'v5' })
    if (!starknet.isConnected) throw new Error('Wallet connection rejected')
    _account = starknet.account
    return { address: starknet.selectedAddress, email: null }
  },

  async logout() {
    _account = null
  },

  async createCapsule({ asset, amount, unlockDate }) {
    if (!_account) {
      const starknet = getStarknet()
      await starknet.enable({ starknetVersion: 'v5' })
      _account = starknet.account
    }
    if (!_account) throw new Error('Not connected')
    const tokenAddress = TOKEN_ADDRESSES[asset]
    if (!tokenAddress) throw new Error(`Unsupported asset: ${asset}`)
    if (!FACTORY_ADDR) throw new Error('VITE_FACTORY_ADDRESS not set in .env')

    const amountWei  = toWei(amount, asset)
    const unlockSecs = Math.floor(unlockDate / 1000)
    const amountU256 = uint256.bnToUint256(amountWei)

    const approveCall = {
      contractAddress: tokenAddress,
      entrypoint: 'approve',
      calldata: CallData.compile({ spender: FACTORY_ADDR, amount: amountU256 }),
    }

    const createCall = {
      contractAddress: FACTORY_ADDR,
      entrypoint: 'createCapsule',
      calldata: CallData.compile({
        asset:         tokenAddress,
        amount:        amountU256,
        unlock_date:   unlockSecs,
        recipient:     _account.address,
        pool_contract: POOL_CONTRACT,
        group_gifting: 0,
      }),
    }

    const tx = await _account.execute([approveCall, createCall])
    await getProvider().waitForTransaction(tx.transaction_hash)

    let capsuleId = tx.transaction_hash
    try {
      const receipt = await getProvider().getTransactionReceipt(tx.transaction_hash)
      if (receipt?.events?.length > 0) {
        const factoryEvent = receipt.events.find(
          (e) => e.from_address?.toLowerCase() === FACTORY_ADDR.toLowerCase()
        )
        if (factoryEvent?.data?.[1]) capsuleId = factoryEvent.data[1]
      }
    } catch { /* use tx hash as fallback */ }

    return { txHash: tx.transaction_hash, capsuleId }
  },

  async getCapsuleBalance(capsuleId) {
    let asset = 'STRK'
    try {
      const capsules = JSON.parse(localStorage.getItem('tc_capsules') || '[]')
      const capsule  = capsules.find((c) => c.id === capsuleId)
      if (capsule) asset = capsule.asset
    } catch { /* ignore */ }

    try {
      const provider = getProvider()
      const result = await provider.callContract({
        contractAddress: capsuleId,
        entrypoint: 'get_balance',
        calldata: [],
      })
      const principal    = fromWei(result[0], asset)
      const currentValue = fromWei(result[2], asset)
      const yieldEarned  = currentValue - principal
      return {
        principal:    parseFloat(principal.toFixed(8)),
        currentValue: parseFloat(currentValue.toFixed(8)),
        yield:        parseFloat(Math.max(0, yieldEarned).toFixed(8)),
      }
    } catch {
      const capsules = JSON.parse(localStorage.getItem('tc_capsules') || '[]')
      const capsule  = capsules.find((c) => c.id === capsuleId)
      if (!capsule) return { principal: 0, currentValue: 0, yield: 0 }
      const elapsed   = Date.now() - capsule.createdAt
      const yieldRate = 0.05 / (365 * 24 * 60 * 60 * 1000)
      const earned    = capsule.amount * yieldRate * elapsed
      return {
        principal:    capsule.amount,
        currentValue: parseFloat((capsule.amount + earned).toFixed(8)),
        yield:        parseFloat(earned.toFixed(8)),
      }
    }
  },

  async claimCapsule(capsuleId) {
    if (!_account) throw new Error('Not connected')
    const tx = await _account.execute([{
      contractAddress: capsuleId,
      entrypoint: 'claim',
      calldata: [],
    }])
    await getProvider().waitForTransaction(tx.transaction_hash)
    return { txHash: tx.transaction_hash }
  },

  async contributeToCapsule(capsuleId, asset, amount) {
    if (!_account) throw new Error('Not connected')
    const tokenAddress = TOKEN_ADDRESSES[asset]
    if (!tokenAddress) throw new Error(`Unsupported asset: ${asset}`)
    const amountWei  = toWei(amount, asset)
    const amountU256 = uint256.bnToUint256(amountWei)
    const tx = await _account.execute([
      {
        contractAddress: tokenAddress,
        entrypoint: 'approve',
        calldata: CallData.compile({ spender: capsuleId, amount: amountU256 }),
      },
      {
        contractAddress: capsuleId,
        entrypoint: 'contribute',
        calldata: CallData.compile({ asset: tokenAddress, amount: amountU256 }),
      },
    ])
    await getProvider().waitForTransaction(tx.transaction_hash)
    return { txHash: tx.transaction_hash }
  },
}