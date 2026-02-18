# Splyt ⚡

> **Split bills with friends using crypto. Zero fees. Zero friction.**

Venmo meets Web3. Pay your share crypto — instantly, fairly, and completely free.

[![Explore Live](https://img.shields.io/badge/live-splyt.online-blue)](https://splyt.online)
[![Smart Contracts](https://img.shields.io/badge/contracts-github-black)](https://github.com/splytOnline/smart-contracts)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---
## 🎯 What is Splyt?

**The Problem:** Splitting bills sucks. Venmo charges fees. International transfers are expensive. Everyone needs different apps. Someone always "forgets" to pay back.

**The Solution:** Splyt lets groups split any expense using crypto. Create a split, share a link via WhatsApp, everyone pays their share. When everyone's paid, funds release automatically. No fees. No friction. No awkward reminders.

**The Magic:** Building on L2, so transactions cost pennies. We sponsor all gas fees, so users pay **absolutely nothing**. Ever.

---

## ✨ Features

### **For Users**
- 💸 **Zero Fees** — We cover all gas costs. You pay exactly what you owe, nothing more.
- ⚡ **Instant Splits** — Create and share in seconds. No accounts, no KYC, just your wallet.
- 🌍 **Works Globally** — USDC is USDC everywhere. No currency conversion, no borders.
- 📱 **Mobile-First** — Designed for phones. Works in any browser, no app download needed.
- 🔔 **Smart Notifications** — WhatsApp reminders when someone pays (or hasn't paid yet).
- 🛡️ **Trustless Settlement** — Smart contracts hold funds. Released only when everyone pays. No middleman.

### **For Developers**
- 🏗️ **Open Source** — Every line of code is public. Fork it, improve it, build on it.
- 🔐 **Non-Custodial** — Backend never touches user funds. All settlements on-chain.
- 🧩 **Composable** — Use our contracts in your own apps. MIT licensed.
- 📊 **Transparent** — Every transaction verifiable on Arbiscan.

---



## 🏗️ Architecture
```
┌─────────────┐
│   Browser   │  ← Users interact here
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│  Next.js    │   │             │
│  Frontend   │   │   Smart     │
│             │   │  Contracts  │
│  (UI/UX)    │   │  (Money)    │
└──────┬──────┘   └─────────────┘
       │
       ▼
┌─────────────┐
│  API Routes │  ← Metadata, notifications
│  (Backend)  │     (NO fund custody)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│             │  ← Off-chain data
│  (Database) │     (descriptions, etc.)
└─────────────┘
```

**Key Principle:** Smart contracts control all money. Backend only handles UX optimization.

Backend gets hacked? → Your funds are safe.  
Backend goes offline? → You can still interact with contracts directly.


---

## 🔐 Security

### **How We Keep Funds Safe**

1. **Non-Custodial** — Backend never holds private keys or funds
2. **Audited Contracts** — Smart contracts reviewed by [Auditor Name] (report coming Q2 2025)
3. **Immutable Logic** — Contracts are non-upgradeable. What you see is what you get.
4. **Emergency Pause** — Creator can cancel splits and refund participants if needed
5. **Open Source** — Community can review every line of code

### **What We DO Control**
- Metadata (descriptions, usernames)
- UX optimizations (gas sponsorship)

### **What We DON'T Control**
- Your funds (only smart contracts can move money)
- Your private keys (they never leave your wallet)
- Settlement logic (hardcoded in immutable contracts)

**Bug Bounty:** Found a vulnerability? Email security@splyt.online — Up to $10,000 reward for critical bugs.

---

## 🤝 Contributing

We're open source and contributor-friendly!

**Good First Issues:** [Check here](https://github.com/splytOnline/splyt-frontend/labels/good%20first%20issue)

**How to Contribute:**
1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-thing`)
3. Commit changes (`git commit -m 'Add amazing thing'`)
4. Push to branch (`git push origin feature/amazing-thing`)
5. Open a Pull Request

**Contribution Ideas:**
- 🎨 UI/UX improvements
- 🌍 Internationalization (translate to your language)
- 🐛 Bug fixes
- 📱 Mobile optimizations
- 🧪 Test coverage

---

## 📄 License

MIT © Splyt

**What this means:** You can fork this, modify it, use it commercially, do whatever you want. Just don't sue us if something breaks. See [LICENSE](./LICENSE) for details.

---


<div align="center">

**Made with ❤️ for the Web3 ecosystem**

[⭐ Star this repo](https://github.com/splytOnline/splyt-frontend) • [🐛 Report bug](https://github.com/splytOnline/splyt-frontend/issues) • [💡 Request feature](https://github.com/splytOnline/splyt-frontend/issues)

</div>