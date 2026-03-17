# timecapsule.fun

A yield-locking primitive for emotionally significant moments- built on Starknet via the Starkzap SDK.

Two use cases, one app: gift someone crypto that grows until their special day, or lock 10% of a luxury purchase and claim it back with yield a year later.

Built for the [Starkzap Developer Challenge](https://github.com/keep-starknet-strange/starkzap).

## Use cases

**Gift capsules** — lock ETH, USDC, or BTC until a future date (birthday, anniversary, graduation, or any special day). Add a personal message and photo. The recipient claims principal plus accrued yield on the day.

**Purchase bonus** — at checkout for a luxury item, lock 10% of the price into a yield pool. After a set period (6 months, 1 year, 2 years), claim back the original amount plus earnings. A $50,000 watch means $5,000 locked, $5,250+ returned.

## Unique features

**Wax Seal** — animated seal cracks open on unlock day

**Message Reveal** — personal message typewriters in on unlock, blurred until then

**Yield Milestones** — custom messages appear as yield crosses 1%, 3%, 5% . The gift feels alive while it grows

**Contributor Constellation** — group gifters rendered as an interactive star map

**Anticipation Counter** — recipients tap to signal they are waiting, sender sees the count

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

`claimCapsule()` — gasless claim triggered on unlock date

`contributeToCapsule()` — group gifting contributions from multiple senders

## Project structure

```
src/
├── api/            Starkzap SDK integration (mock, swap for real)
├── context/        Global auth and capsule state
├── pages/          Home, Create, Lock, CapsuleView, Dashboard
├── components/
│   ├── capsule/    CountdownTimer, BalanceCard, WaxSeal, YieldMilestones
│   ├── create/     MediaUpload, GroupGifting
│   └── ui/         LoginModal, MessageReveal, Spinner
├── hooks/          useCountdown
└── utils/          localStorage helpers
```

## License

MIT
