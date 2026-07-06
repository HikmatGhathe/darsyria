# DarSyria — Syrian real-estate marketplace for the diaspora

DarSyria is a full-stack, trilingual real-estate marketplace that connects
real-estate companies in Syria with the Syrian diaspora in Europe. It is built
for a real launch: passwordless auth, listing verification, trust & safety
tooling, per-listing invoicing, an AI assistant, and EU (GDPR) compliance.

This repository is the **web frontend**. The backend API lives in a separate
repo: **[darsyria-api](https://github.com/USERNAME/darsyria-api)**.

> ⚠️ Personal/portfolio project. Screenshots and a live demo link go here.

---

## Highlights

- **Trilingual + RTL** — English, German, and Arabic throughout, with full
  right-to-left layout for Arabic (`next-intl`).
- **SEO-ready SSR** — server-rendered listing pages with per-page metadata,
  canonical/hreflang tags, Open Graph images, and a generated sitemap.
- **Property listings** — create/edit with image upload, structured
  governorate + an optional map pin (Leaflet + OpenStreetMap), and a browse
  experience with filters, sorting, pagination, favorites, and saved searches
  that send a combined daily email digest.
- **Trust & safety** — user reporting of listings/sellers, an admin moderation
  queue, and a two-track **verification** system: companies verify their
  business once; individuals prove ownership per listing (documents stored
  privately, viewed by admins via short-lived signed URLs). Distinct, honest
  "Verified company" vs "Ownership verified" badges.
- **Monetization** — per-listing **invoicing** with an admin "free mode" switch
  (launch free, start charging later without a redeploy), behind a
  payment-provider-agnostic seam ready for Visa/Mastercard via Stripe.
- **Messaging** — buyer ↔ seller conversations with mutual-consent contact
  reveal, so phone numbers stay private until both sides agree.
- **AI assistant** — a retrieval-augmented chatbot answering questions over a
  curated Syrian real-estate knowledge base (embeddings + pgvector).
- **EU compliance** — Impressum, privacy/terms/cookies pages, cookie consent,
  and GDPR self-service data export + account deletion.
- **Production-grade ops** — rate limiting, Sentry error monitoring, and a
  one-command Dockerized deploy with automatic HTTPS.

## Tech stack

**Frontend (this repo)**
- Next.js 16 (App Router, React Server Components) · React 19 · TypeScript
- `next-intl` (i18n + RTL) · Tailwind CSS · vanilla Leaflet + OpenStreetMap
- Sentry (browser + SSR error monitoring)

**Backend ([darsyria-api](https://github.com/USERNAME/darsyria-api))**
- Python · FastAPI · SQLAlchemy · Alembic
- PostgreSQL 16 + **pgvector** · Pydantic v2
- fastembed (embeddings/RAG) · slowapi (rate limiting)
- Cloudflare R2 (object storage) · Resend (transactional email)
- Docker Compose + Caddy (automatic HTTPS)

**Auth** — passwordless magic-link + Google OAuth, httpOnly cookies with
refresh-token rotation.

## Architecture

```
Browser ──HTTPS──> Caddy ──> Next.js (SSR + client islands)  ──REST──> FastAPI
                              │                                          │
                              └── server components fetch the API        ├── PostgreSQL + pgvector
                                                                         ├── Cloudflare R2 (images, private docs)
                                                                         └── Resend (email)
```

Listing pages render on the server for SEO and hydrate interactive "islands"
(maps, favorites, owner controls, messaging). The API is a stateless FastAPI
service; a single in-process scheduler sends the daily digest.

## Running locally

Prerequisites: Node 22+, and the backend API running (see
[darsyria-api](https://github.com/USERNAME/darsyria-api) — Docker Compose brings
up Postgres + API in one command).

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL etc.
npm run dev                  # http://localhost:3000
```

## Docs

- [docs/how-it-works.md](docs/how-it-works.md) — how the platform behaves across
  the buyer, seller, and admin roles, and where each capability lives in code.
