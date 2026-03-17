/**
 * main.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * App entry point. Adds PrivyProvider outside TimeCapsuleProvider.
 * Everything else (App, styles) stays the same as your original.
 *
 * Required env var:
 *   VITE_PRIVY_APP_ID=your-privy-app-id
 *   (get it from https://dashboard.privy.io → your app → App ID)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { PrivyProvider } from '@privy-io/react-auth'
import App from './App'
import './styles/index.css'

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID

if (!PRIVY_APP_ID) {
  console.error(
    '[TimeCapsule] VITE_PRIVY_APP_ID is not set.\n' +
    'Create a .env file in your project root with:\n' +
    '  VITE_PRIVY_APP_ID=your-privy-app-id\n' +
    'Get your App ID from https://dashboard.privy.io'
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PrivyProvider
      appId={PRIVY_APP_ID ?? 'placeholder'}
      config={{
        // Social login methods — Google + email work with free Privy plan
        loginMethods: ['email', 'google'],

        appearance: {
          theme: 'dark',
          accentColor: '#4ade80',   // matches your green accent
          logo: undefined,          // add your logo URL here if desired
          showWalletLoginFirst: false,
        },

        // We manage wallets server-side via the backend,
        // so embedded wallets are off
        embeddedWallets: {
          createOnLogin: 'off',
        },
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
)
