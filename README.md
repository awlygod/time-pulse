# timecapsule.fun

A time-locked crypto gifting app built on Starknet. Lock funds, add a personal message and photo — the gift earns yield until the unlock date.

Built for the [Starkzap Developer Challenge](https://github.com/keep-starknet-strange/starkzap).

---

## What it does

- **Lock** ETH, USDC, or BTC until a future date (birthday, anniversary, graduation)
- **Earn** yield automatically while locked via Starkzap SDK
- **Personalize** with a message, photo or video
- **Group gifting** — multiple contributors on one capsule
- **Claim** on the unlock date — recipient gets principal + yield

---

## Unique features

| Feature | What it does |
|---|---|
| * Wax Seal | Animated seal cracks open on unlock day |
| *  Message Reveal | Personal message typewriters in character by character on unlock |
| * Yield Milestones | Custom messages appear as yield hits 1%, 3%, 5% — gift feels alive |
| * Contributor Constellation | Group gifters rendered as an interactive star map |
| * Anticipation Counter | Recipients tap "I'm waiting" — sender sees the count build |

---

## Tech stack

- **React + Vite** — frontend
- **Starkzap SDK** — wallet auth, gasless txns, yield, BTC/STRK staking
- **Starknet** — settlement layer
- **TailwindCSS + daisyUI** — styling
- **day.js** — countdown timer

---

## Run locally

```bash
git clone https://github.com/your-username/timecapsule-fun
cd timecapsule-fun
npm install
npm run dev
```

---

## Starkzap integration

| SDK method | Used for |
|---|---|
| `login()` | Social login — email/Google, no wallet popup |
| `createCapsule()` | Lock funds + start yield accrual |
| `getCapsuleBalance()` | Live balance polling every 30s |
| `claimCapsule()` | Gasless claim on unlock date |
| `contributeToCapsule()` | Group gifting contributions |

---

## Project structure

```
src/
├── api/            # Starkzap SDK integration (mock → real)
├── context/        # Global auth + capsule state
├── pages/          # Home, Create, CapsuleView, Dashboard
├── components/
│   ├── capsule/    # CountdownTimer, BalanceCard, WaxSeal, YieldMilestones...
│   ├── create/     # MediaUpload, GroupGifting
│   └── ui/         # LoginModal, MessageReveal, Spinner
├── hooks/          # useCountdown
└── utils/          # localStorage helpers
```

---

## License

MIT
