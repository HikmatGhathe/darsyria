# How DarSyria works

A product-behaviour overview for contributors, written from the three perspectives that use the platform: the **buyer**, the **seller**, and the **admin**. It describes what is actually implemented today, then maps each capability to where it lives in the code (`darsyria` = Next.js frontend, `darsyria-api` = FastAPI backend).

DarSyria is a real-estate marketplace for the Syrian diaspora — a place to discover property in Syria, learn the legal/financial context, and reach sellers — built across two repos with a Postgres + pgvector database.

---

## Three design choices that shape everything

1. **One account; the role emerges from behaviour.** There is no "sign up as a buyer" vs "sign up as a seller." Everyone authenticates the same way and *becomes* a seller the first time they list a property.
2. **Publish first, moderate after.** Listings go live immediately; admins review and can take them down — rather than gate-keeping every post up front. This keeps the platform usable without a full-time review team.
3. **Trust, but verify — and say so.** The platform connects people and signals trust (verified badges, moderation) but explicitly does **not** verify property documents or handle money. Every listing carries that disclaimer.

---

## 1. The buyer ("user")

- **Arriving.** Most buyers land directly on a *listing* from a Google search or a link shared in a diaspora WhatsApp/Facebook group, where it renders as a rich preview card. Every listing, seller profile, and article is server-rendered for exactly this reason.
- **Browsing logged-out.** A buyer can do almost everything without an account: browse all active listings and filter by city, property type, price range, rooms, and **seller/company name** ("show me everything Emaar posted"); open any listing (photos, EUR price, document-status badge, "Verified" badge, and a **"Posted by …"** link to the seller's profile); ask the **AI assistant** (a chatbot grounded in the platform's own Knowledge Base, so answers are sourced); and read **Knowledge Base** articles.
- **Signing in — only to act.** Login is **passwordless**: a one-time magic link (valid 15 min, single use) or Google. A short-lived session cookie keeps them logged in, refreshed silently. The email itself is the identity proof.
- **Contacting a seller.** The core action. The buyer writes a message that opens an **in-platform conversation** — no need for the seller's phone or email to start. **Phone numbers are shared by mutual consent** inside the thread (an individual seller's number stays private until both agree; see the seller section for the public exceptions).
- **Staying in the loop.** A buyer can **follow** a seller and receive **one digest email per day** summarising new listings across everyone they follow — deliberately batched so a company posting many listings doesn't send many emails.
- **Their data.** The account page manages name, phone, language, and GDPR rights: **export** all data as JSON, or **delete** the account (which anonymises them while preserving conversations others had with them).

## 2. The seller

- **Becoming one.** No separate registration. The first time a logged-in user lists a property, they choose once: **Individual or Company** (changeable later in account settings).
- **The privacy model (the key asymmetry):**
  - **Individuals** are private by default — their phone is shared only through the mutual-consent reveal in a conversation. They can **opt in** (an account setting) to show their phone publicly on their seller profile.
  - **Companies** are businesses that want to be found, so they **must** provide a name, address, and phone, all shown **publicly** with no consent gate.
- **Verification.** When a company submits complete info, its status becomes **pending**; an admin reviews and marks it **verified**, lighting up a "Verified seller" badge. Verification is a **trust badge, never a gate** — unverified sellers can still list and operate fully (consistent with publish-first; Syria has no central licensing authority to check against).
- **Listing lifecycle.** A new listing starts as a **draft** (private). The owner adds details and up to 10 photos (first = cover) and **publishes** → it becomes **active**, is stamped with `published_at`, and appears in browse, search, the seller's profile, and the sitemap. They can later **unpublish**, **edit**, or **delete**. Owners see management controls on the listing page; everyone else sees the clean public view.
- **Being found.** Three discovery paths: organic search (listings are individually indexable), buyers searching the seller's name, and the **public seller profile** (`/sellers/{id}`) — identity, verified badge, stats, public contact block, and a grid of active listings, with `RealEstateAgent` structured data.
- **Why an account matters.** All inquiries land in the seller's **inbox** as conversations. A seller who doesn't sign in for weeks still has their messages, listings, and followers waiting; email notifications nudge them back.

## 3. The admin

- **Who they are.** Users with an `is_admin` flag. Admin status is checked fresh against the database on every request (not trusted from a stale token), so granting/revoking takes effect immediately.
- **The job is curation, not gate-keeping.** Because listings publish instantly, the admin role is *reactive moderation*.
- **Listings moderation:** approve / **reject** (requires a written reason that's **emailed** to the owner) / **flag**–unflag, with a dashboard to filter and search.
- **User & seller management:** **verify / unverify** sellers (with a "pending verification" filter and search that matches company names); **ban / unban** (ban requires a reason); **promote / demote** other admins.
- **What admins deliberately don't do:** verify property documents, escrow or handle payments, or mediate transactions. The legal disclaimers make this explicit — buyers and their lawyers verify claims independently.

---

## Cross-cutting

- **Languages:** English / German / Arabic, including right-to-left layout for Arabic; emails go out in each user's chosen language.
- **Money:** prices are entered in USD/EUR/SYP but **displayed in EUR** for the diaspora audience.
- **Security & privacy:** passwordless auth, httpOnly cookies (no tokens in JS), rate-limited login, GDPR export/anonymise.
- **Email (via Resend):** magic links, message notifications (debounced), listing-rejection notices, and the daily follow digest.
- **Discoverability:** server-side rendering, per-page metadata, Open Graph share cards, JSON-LD structured data, `sitemap.xml`, and `robots.txt`.

---

## Where it lives in the code

| Capability | Backend (`darsyria-api/`) | Frontend (`darsyria/`) |
|---|---|---|
| **Auth** (magic link, Google, cookies, refresh, GDPR export/delete) | `app/routers/auth.py`, `app/dependencies.py` (`get_current_user` / `get_optional_user` / `get_current_admin`) | `components/AuthProvider.tsx`, `lib/auth.ts`, `app/[locale]/login`, `app/[locale]/auth/verify` |
| **Listings** (CRUD, draft→publish, images) | `app/routers/properties.py`, `app/models/property.py`, `app/services/r2_storage.py` | `app/[locale]/properties/**`, `components/PropertyDetailView.tsx`, `components/OwnerPropertyControls.tsx`, `components/PropertyImageGallery.tsx` |
| **Messaging + consent phone reveal** | `app/routers/conversations.py`, `app/models/conversation.py` | `components/ContactSellerButton.tsx`, `app/[locale]/inbox/**` |
| **Seller identity, profile, follow** | `app/routers/sellers.py`, `app/models/follow.py`, `app/services/seller_helpers.py`, `app/models/user.py` (`account_type`, `company_*`, `phone_public`, `verification_status`) | `app/[locale]/sellers/[id]/page.tsx`, `components/FollowButton.tsx`, `app/[locale]/account/page.tsx` |
| **Verification + moderation** | `app/routers/admin_users.py`, `app/routers/admin_properties.py` | `app/[locale]/admin/**`, `lib/admin.ts` |
| **Follow digest + email** | `app/services/digest_service.py`, `app/services/email_service.py`, scheduler in `app/main.py` (lifespan) | — |
| **AI assistant / RAG** | `app/routers/chat.py`, `app/services/retrieval.py`, `app/models/article.py` (`Article`, `ArticleChunk` w/ pgvector) | `app/[locale]/assistant`, `app/[locale]/knowledge/**` |
| **SEO / discoverability** | `app/routers/sitemap.py` | `app/sitemap.ts`, `app/robots.ts`, `lib/server-api.ts`, `generateMetadata` in `app/[locale]/layout.tsx` and the page files |
