# timecapsule.fun

A time-locked crypto gifting app built on Starknet. Lock funds, add a personal message and photo - the gift earns yield until the unlock date.

Built for the [Starkzap Developer Challenge](https://github.com/keep-starknet-strange/starkzap).

## What it does

Lock ETH, USDC, or BTC until a future date (birthday, anniversary, graduation). The gift earns yield automatically while locked via the Starkzap SDK. On the unlock date, the recipient claims the original amount plus all accrued yield.

## Unique features

**Wax Seal** — animated seal cracks open on unlock day

**Message Reveal** — personal message typewriters in character by character on unlock

**Yield Milestones** — custom messages appear as yield hits 1%, 3%, 5% thresholds, making the gift feel alive while it grows

**Contributor Constellation** — group gifters rendered as an interactive star map

**Anticipation Counter** — recipients tap "I'm waiting" and the sender sees the count build

## Tech stack

React, Vite, Starkzap SDK, Starknet, TailwindCSS, daisyUI, day.js

## Run locally

```bash
git clone https://github.com/your-username/timecapsule-fun
cd timecapsule-fun
npm install
npm run dev
```

## Starkzap integration

`login()` — social login via email or Google, no wallet popup required

`createCapsule()` — locks funds and starts yield accrual on Starknet

`getCapsuleBalance()` — live balance polled every 30 seconds

`claimCapsule()` — gasless claim triggered on the unlock date

`contributeToCapsule()` — group gifting contributions from multiple senders

## Project structure

```
src/
├── api/            Starkzap SDK integration (mock, swap for real)
├── context/        Global auth and capsule state
├── pages/          Home, Create, CapsuleView, Dashboard
├── components/
│   ├── capsule/    CountdownTimer, BalanceCard, WaxSeal, YieldMilestones
│   ├── create/     MediaUpload, GroupGifting
│   └── ui/         LoginModal, MessageReveal, Spinner
├── hooks/          useCountdown
└── utils/          localStorage helpers
```

## License

MIT
