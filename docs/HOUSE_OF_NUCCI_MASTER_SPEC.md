# HOUSE OF NUCCI — MASTER SPECIFICATION

> **Status:** Canonical. This document is the contract for the project.
> Supplied by the owner on 2026-09-21 as the master product / design / engineering brief.
> Stored verbatim in structure and substance so it survives across sessions and contributors.
>
> **Rule of precedence:** if any code, design, or later document conflicts with this
> specification, this specification wins. Amend this file deliberately — do not drift.

**HOUSE OF NUCCI** — The House of Nucci Collection is a private collection of
approximately 200 works of digital art. The job is to design and build a world-class
digital art institution around this collection.

This is **not** an NFT portfolio, an OpenSea wrapper, a crypto dashboard, a generic 3D
gallery, a metaverse game, a marketplace, or (currently) a platform for other collectors.

**HOUSE OF NUCCI IS THE OWNER'S PERSONAL DIGITAL ART COLLECTION.**

Everything publicly described as "In the House", "The Collection", "House of Nucci
Museum", or "House of Nucci Exhibition" must refer **only** to artworks actually
contained within the House of Nucci Collection unless explicitly identified otherwise.
The experience may link outward to artists' wider practices, other works, marketplaces,
interviews, exhibitions and resources, but those external works must never be presented
as though House of Nucci owns them. **This distinction is absolute.**

---

## AMENDMENTS

Recorded by the owner after the original brief. These take precedence over the sections
below wherever they differ.

### A-1 — Canonical domain (2026-09-21)

The production domain is **https://houseofnucci.art**. It is canonical for URL
configuration, SEO and OpenGraph metadata, the sitemap, robots, absolute entity URLs,
social sharing and deployment documentation. The public URL structure is `/`, `/museum`,
`/collection`, `/artwork/[slug]`, `/artist/[slug]`, `/series/[slug]`,
`/exhibition/[slug]`, `/pathway/[slug]`.

DNS, registrar and CDN records are **not** to be configured until the owner explicitly
asks. Development and staging continue on local and preview URLs.

### A-2 — Positioning and scale (2026-09-21)

The House of Nucci Collection is a **highly curated personal collection** of a little
under 200 works. It is not one of the world's largest digital art collections, not a whale
collection, not encyclopedic, and not defined by trophy-level monumental 1/1 acquisitions.
The House never exaggerates its scale, financial value, historical importance, rarity or
cultural authority.

Its strength is thoughtful personal curation, the collector's point of view, genuine
enthusiasm for the artists, the relationships between works, artist context, provenance,
discovery, storytelling, excellent digital presentation and an exceptional visitor
experience.

This amends the register of §04 and §11: where the original brief reaches for monumental
scale, the architecture is instead **sophisticated, memorable and appropriately intimate**
— meaningful rooms, strong sightlines and breathing room, sized for roughly 200 works
rather than enormous spaces that imply collection size or wealth. Monumental treatment, a
1/1 room or a rare-work designation are used only where the actual collection data
supports them.

Full detail, including the language the House does not use, is in `POSITIONING.md`, which
governs copy and architectural scale.

---

## 01 — THE NORTH STAR

The ultimate experience answers this question:

> "If an important private collection of digital art could build its own museum without
> the physical limitations of architecture, what would that museum become?"

House of Nucci should feel like: a private contemporary art institution · a world-class
digital museum · a sophisticated architectural experience · an editorial art publication
· an immersive digital environment · a collector's point of view · a gateway into
understanding digital art.

Desired visitor reaction, in order: "What the hell is this? This is incredible." → "Who
made this?" → "Why does this work matter?" → "What else should I see?" → potentially
"Where can I learn more or collect something from this artist?"

**Art first. Context second. Discovery third. Commerce last.**

## 02 — CORE PRODUCT PHILOSOPHY

Artists create the culture. Collectors preserve and curate it. Technology serves both.

The product is designed from the perspective of a serious collector and art lover, not
from the perspective of extracting transaction volume.

Never optimize the visual experience around: floor prices · token prices · ETH metrics ·
trading volume · wallet flexing · speculative language · artificial scarcity countdowns ·
token mechanics · financial gamification.

House of Nucci should make the ART feel more important after a visitor experiences it.

## 03 — PRIMARY CREATIVE REFERENCE

Study `https://underthegan.art/`. Do not clone it. Do not reproduce its code, design
assets, exact layouts, typography, or identity. Study *why* it works: art-forward
presentation · sophisticated dark palette · restrained interface · institutional tone ·
strong collection organization · artist context · individual work pages · archive
mentality · exhibitions · multiple ways of experiencing a collection · visual restraint ·
respect for digital art.

House of Nucci takes this philosophy further through immersive architecture and
intelligent discovery.

Other inspiration: leading contemporary museums · Gagosian · Pace · MoMA · Dia ·
Fondation Beyeler · brutalist architecture · modern private museums · luxury editorial
publishing. Do not imitate any of them literally. Build an original House of Nucci visual
language.

## 04 — BRAND

- Public institution: **HOUSE OF NUCCI**
- Formal collection name: **THE HOUSE OF NUCCI COLLECTION**
- Preferred presentation: **HOUSE OF NUCCI** / *The Collection*

Identity feels: sophisticated · disruptive · timeless · architectural · modern ·
intelligent · understated · culturally credible.

Avoid: cyberpunk clichés · NFT aesthetics · gratuitous gradients · glowing crypto buttons
· excessive neon · futuristic fonts for the sake of looking futuristic · Web3 jargon ·
finance-oriented visual language.

Typography is institutional/editorial: a display/editorial serif or highly refined
display face, plus a modern neutral sans for interface and metadata. Typography must
enhance the art rather than compete with it.

## 05 — COLOR + MATERIAL LANGUAGE

The artwork supplies the color. The museum and interface use: deep charcoal · near-black
· graphite · dark concrete · soft warm black · restrained warm stone · subtle metallic
materials · museum-white typography · warm off-white · quiet gray secondary text.

The environment must make bright digital artwork explode visually. Do not bathe artwork
in colored environmental lighting unless deliberately curated for a specific
installation. UI should visually disappear whenever possible.

## 06 — HOUSE OF NUCCI IS ONLY THE COLLECTION

The public House of Nucci museum contains only works from the owner's collection.

Artist pages may contain:
- **IN THE HOUSE** — artworks owned by House of Nucci
- **EXPLORE THE ARTIST** — external information
- **OTHER SERIES** — external contextual information
- **AVAILABLE WORKS** — external verified marketplaces or artist resources

These sections must be visually and semantically separated. Never imply ownership of
external works.

## 07 — FUTURE-READY BUT NOT FUTURE-BLOATED

Build the underlying data architecture generically enough that another product could
someday support multiple collectors. However: do **not** publicly position House of Nucci
as that platform, and do **not** build multi-tenancy in the V1 UI unless it costs almost
nothing structurally.

Internally use generic entities — Collection, Collector, Artwork, Artist, Series,
Exhibition, Room — rather than `house_of_nucci_artwork`. The first and only public
collection is The House of Nucci Collection.

## 08 — THE TWO PRIMARY EXPERIENCES

Every visitor chooses between **ENTER THE MUSEUM** and **EXPLORE THE COLLECTION**.
Neither is secondary. Journey A: immersive visitor. Journey B: fast art researcher /
collector. Do not force 3D on everyone.

## 09 — HOMEPAGE

Cinematic and institutional. Hierarchy:

```
HOUSE OF NUCCI
THE COLLECTION
Private digital art collection.
[ ENTER THE MUSEUM ]   [ EXPLORE THE COLLECTION ]
```

Potential secondary entry: `[ NEW TO DIGITAL ART? ]`.

Do not overload the homepage. No price feeds. No wallet connect. No giant social icons.
No NFT stats. No carousel of dozens of random thumbnails. Use atmospheric museum
architecture or a carefully selected collection work. Movement is calm and deliberate.
Never force a visitor to watch an intro animation.

## 10 — THE VIRTUAL MUSEUM

The signature experience is a navigable first-person digital museum.

Technology preference: Next.js · TypeScript · Three.js · React Three Fiber · Drei where
useful · GLTF/GLB architecture · WebGL · WebGPU only if mature and progressive
enhancement is appropriate. Use production-stable technologies. Do not use technology
simply because it is fashionable.

No visible avatar. No third-person character. The visitor IS the camera.

## 11 — MUSEUM ARCHITECTURE

Do not create a generic rectangular white room. Actually design the institution.

Architectural language: monumental scale · brutalism · dark concrete · refined limestone
· sculptural voids · dramatic ceiling volumes · polished floors · selective reflection ·
shadow · warm architectural lighting · black-box rooms · intimate chambers · long
sightlines · unexpected spatial transitions.

Possible spaces (conceptual only): THE ENTRY · THE GREAT ROOM · 1/1 GALLERY · GENERATIVE
WING · MOVING IMAGE / BLACK BOX · PIXEL ROOM · FEATURED ARTIST ROOM · THE VAULT ·
ROTATING EXHIBITION · RECENT ACQUISITIONS.

Do not finalize museum architecture until actual collection inventory is understood.
Architecture serves the collection.

## 12 — CURATION, NOT POPULATION

~200 artworks must not be scattered across walls algorithmically. A serious curatorial
layer is required. Group thoughtfully by artist · series · movement · visual dialogue ·
medium · chronology · cultural relationship · generative method · collection narrative ·
owner-defined exhibition.

Allow certain works an entire wall · monumental scale · intimate scale · dark gallery ·
screen presentation · projection · isolation. The visitor should feel that someone
deliberately chose every placement.

## 13 — MUSEUM NAVIGATION

Desktop: WASD · arrow keys · mouse-look · trackpad-friendly movement · optional
click/tap-to-move · gentle acceleration/deceleration. Do not require gaming familiarity.
Provide optional minimal controls guidance.

Mobile: do not reproduce desktop WASD. Design a true touch experience — swipe/drag camera
· tap destination hotspots · guided walking · tap floor to move · smooth gallery
transitions.

If free-roaming 3D performs poorly on low-powered devices, gracefully fall back to
**GUIDED MUSEUM MODE** rather than providing a terrible experience.

## 14 — ARTWORK INTEGRITY *(absolute)*

Do **NOT** alter artwork. Never crop · stretch · recolor · filter · AI modify · add
overlays · sharpen automatically · alter aspect ratio · distort intentionally · replace
with generated approximations.

Preserve original visual integrity. Pixel art: crisp nearest-neighbor rendering where
appropriate. Animation: preserve timing, looping and pacing. Video: preserve intended
frame rate where reasonable. Audio: preserve the original audio experience.

## 15 — SUPPORTED MEDIA

At launch, minimum: PNG · JPEG · WEBP · SVG · GIF · MP4 · WEBM. Original TIFF may be
archived and converted to high-quality web derivatives.

Architect future media renderers for: generative code · HTML artwork · WebGL art ·
shaders · interactive work · 3D artwork · audio · on-chain SVG · software-based work.
Create an extensible artwork renderer system. Do not assume every piece is an image URL.

## 16 — ANIMATED ART

Animated works must animate in the museum. Do not represent MP4/GIF works as static
pictures on museum walls. Use intelligent media management: only nearby/visible videos
play; pause distant, hidden, occluded and off-screen video. Use poster images · lazy
loading · optimized derivatives · proper resource disposal. Never load 200 videos at
museum entry.

## 17 — AUDIO ART

Do not autoplay audible audio on entry. Show an unobtrusive **ENABLE ARTWORK AUDIO**.
Audio attenuates naturally by proximity where appropriate. Museum ambience must
automatically yield to artwork audio.

## 18 — THE COLLECTION ARCHIVE

The non-3D archive must be excellent enough to stand alone. Initial view: GRID.
Potential alternates: SHOWCASE · ARTIST · SERIES · TIMELINE. Potential future: NETWORK.
Do not implement views that do not add genuine value. The grid should resemble a
museum/archive publication more than a marketplace. Artwork first, metadata secondary.

## 19 — COLLECTION FILTERING

Support filters including: Artist · Series · Year · 1/1 · Edition · Generative · Static ·
Animated · Video · Pixel · Software · Blockchain · Platform · Acquisition year ·
Exhibition · Medium · Tag. Potential market-related filter: Available externally. Do not
overexpose technical filters by default.

## 20 — SEARCH

Fast global search across artist · title · series · token number · description · tags ·
year. ~200 works should feel instantaneous.

## 21 — ARTWORK DETAIL EXPERIENCE

Clicking artwork in the museum should NOT immediately leave House of Nucci. Open a
beautiful artwork record. Artwork dominates the screen.

Information: Title · Artist · Year · Series · Edition · Medium · Media type ·
Dimensions/resolution · Blockchain · Contract · Token ID · Acquisition · Provenance ·
Historical context · Collector note · Artist description · Exhibition history · Related
House works.

Actions: VIEW FULLSCREEN · VIEW IN MUSEUM · ABOUT THE ARTIST · EXPLORE SERIES · SAVE TO
MY HOUSE · GO DEEPER · VIEW ON RASTER ↗ · VIEW ON OPENSEA ↗ · VIEW OFFICIAL ARTIST SITE ↗.
Only show actions that actually apply.

## 22 — "COLLECT" IS A HANDOFF, NOT A MARKETPLACE

House of Nucci does not initially execute transactions. It is the cultural/discovery
layer. A work may display PRIVATE COLLECTION · EXPLORE ARTIST · VIEW SERIES · AVAILABLE
EXTERNALLY. If appropriate, **COLLECT ↗** routes to the best verified external
destination (Raster, OpenSea, Verse, SuperRare, Foundation, artist website, other
legitimate marketplace). Do not recreate a marketplace.

## 23 — EXTERNAL LINK MODEL

Each artwork may carry: `primary_external_url` · `opensea_url` · `raster_url` ·
`verse_url` · `superrare_url` · `foundation_url` · `artist_url` · `collection_url` ·
`other_market_url`. Links are individually configurable. Opening external market links
preserves the House of Nucci session; use new tabs/windows where appropriate.

## 24 — LINK HEALTH ENGINE

Marketplace and artist URLs frequently break. Implement or architect automated link
verification. Periodically check marketplace link · artist site · media source ·
collection link · external resource. Admin displays: Healthy · Redirecting · Broken ·
Unknown. Never allow obviously dead links to silently remain forever.

## 25 — ARTIST PASSPORTS

Every artist represented in the collection gets a canonical House of Nucci Artist
Passport. Structure: ARTIST NAME · OVERVIEW · IN THE HOUSE · SERIES REPRESENTED ·
BIOGRAPHY · ARTIST STATEMENT · PROCESS / BEHIND THE SCENES · EXHIBITIONS / CV · PRESS ·
TALKS / INTERVIEWS · OFFICIAL WEBSITE · VERIFIED SOCIALS · OFFICIAL MARKETPLACE /
PLATFORM LINKS · EXPLORE THE ARTIST · AVAILABLE WORKS.

**Do not fabricate artist information.** Every meaningful factual statement must come
from artist-supplied information · official artist site · exhibition/gallery materials ·
trusted sources · owner-approved editorial content.

## 26 — ARTIST OWNERSHIP DISTINCTION

Artist pages must clearly distinguish IN THE HOUSE from EXPLORE MORE FROM THE ARTIST.
External artwork must never appear in a layout that implies House of Nucci owns it.

## 27 — ARTWORK PASSPORT

Each artwork has a durable canonical record independent of marketplaces: title · artist ·
series · year · medium · description · canonical media · original media · dimensions ·
duration · audio · chain · contract · token ID · token standard · mint platform · mint
date · edition · owner · acquisition source · acquisition date · provenance · exhibition
history · rights · official URLs · market URLs · archival status.

The ARTWORK is the canonical cultural entity. The token is one verification/ownership
layer. The marketplace is a distribution layer.

## 28 — PROVENANCE AS OBJECT BIOGRAPHY

Do not present provenance like an ugly blockchain explorer. Where reliable data exists,
visualize the history beautifully (created/minted → acquired by → entered House of
Nucci). Source details remain inspectable. **Never fabricate missing provenance.**

## 29 — TRUST LAYER

Infrastructure for statuses: Verified artist · Verified contract · Verified token ·
Verified marketplace URL · Media archived · Ownership verified. Do not clutter the
default UI with badges; expose under PROVENANCE + DETAILS. The goal is visitor
confidence.

## 30 — RIGHTS + DISPLAY PERMISSIONS

NFT ownership does not automatically equal copyright ownership. Maintain internal fields:
`display_rights_status` · `copyright_owner` · `high_res_rehosting_allowed` ·
`derivatives_allowed` · `commercial_use_allowed` · `license_url` · `rights_notes`. Do not
assume legal rights merely from token ownership.

## 31 — "START HERE" FOR NEW VISITORS

Optional onboarding: **NEW TO DIGITAL ART? START HERE**. This must NOT feel like CRYPTO
101 — teach through actual artwork. Pathways: WHAT IS DIGITAL ART? · WHY PROVENANCE
MATTERS · WHAT IS A 1/1? · WHAT IS AN EDITION? · WHAT IS GENERATIVE ART? · WHAT IS
ON-CHAIN ART? · WHY DO COLLECTORS CARE? · MEET FIVE ARTISTS IN THE HOUSE. The artwork
teaches the concepts.

## 32 — NUCCI PATHWAYS

A curatorial storytelling system. Examples: HOUSE OF NUCCI — ESSENTIAL 20 · ENTER THE
WORLD OF ACK · UNDERSTANDING GENERATIVE ART · THE 1/1 EXPERIENCE · CODE AS MEDIUM · THE
INTERNET AS CANVAS · MOVING IMAGE · RECENT ACQUISITIONS.

These are not financial baskets. They are intellectual/curatorial pathways consisting of
ordered artworks · introductory essay · short contextual stops · optional guided museum
route.

## 33 — GUIDED TOURS

Visitor selects TAKE THE TOUR; the museum smoothly guides them through selected artworks.
Each stop provides brief context · optional deeper reading · next work. The user can
leave guided mode at any moment.

## 34 — MY HOUSE

A tasteful bookmarking system: ♡ SAVE → MY HOUSE. Initially no account, no wallet; store
locally where possible. MY HOUSE helps visitors understand their taste, e.g. "YOUR HOUSE
— 12 works · 7 artists · 4 generative works · 3 moving-image works" and EXPLORE YOUR
TASTE. Sophisticated, not gamified.

## 35 — TASTE + DISCOVERY ENGINE

Initially a hybrid of human curation · artist relationships · series · medium · technique
· written description · historical relationships · visual characteristics · My House
saves. Avoid simplistic "people who bought this also bought…". Whenever possible explain
recommendations: RELATED BY CURATOR · RELATED BY ARTIST · RELATED BY MEDIUM · RELATED BY
HISTORY · RELATED BY SERIES · RELATED TO YOUR HOUSE. The visitor should understand *why*.

## 36 — HUMAN CURATION OUTRANKS ALGORITHM

Algorithms must not become the cultural authority. Do not automatically prioritize works
because of price · trading volume · follower count · market capitalization · social
engagement. Build infrastructure so human curatorial judgment can explicitly connect
works and artists.

## 37 — THE NUCCI GUIDE

Architect an AI docent. Do NOT make it a cheap floating "Chat with AI" bubble. The
intelligence appears contextually: GO DEEPER + · ABOUT THIS WORK · WHY IT MATTERS · ABOUT
THE ARTIST · SHOW ME SOMETHING RELATED · I'M NEW TO THIS · TAKE ME SOMEWHERE UNEXPECTED.
The AI functions as a museum docent, potentially guiding the visitor physically to
another work.

## 38 — AI GUIDE GROUNDING

The Nucci Guide must NOT answer art history from unconstrained model memory when factual
accuracy matters. Use retrieval from trusted House of Nucci sources: artist profiles ·
artist statements · official interviews · curatorial essays · verified artwork metadata ·
provenance · exhibition histories · official sites · approved source documents. Answers
are source-grounded, with SOURCES → where appropriate. Do not hallucinate biography,
provenance, dates, motivations or artistic meaning. Clearly distinguish documented fact
from House of Nucci curatorial interpretation.

## 39 — HIGH-TOUCH HUMAN ONBOARDING

Architect room for an optional future TALK WITH A COLLECTOR / REQUEST A GUIDED
INTRODUCTION. Early high-quality human onboarding generates valuable product insight. Do
not attempt to automate every human relationship with AI.

## 40 — DISCOVER / AVAILABLE WORKS

Potential future/controlled feature: DISCOVER — selected external works by artists
represented in House of Nucci. Editorial, not a giant marketplace feed: artist · work /
series · why it is interesting · verified external destination. Never imply House of
Nucci ownership. Do not prioritize based solely on commission or affiliate economics.

## 41 — COLLECTION INGESTION

~200 works must NOT be manually hard-coded. Build an ingestion architecture. Sources:
owner wallet addresses · OpenSea APIs · Raster APIs if available · token metadata · IPFS ·
Arweave · manual manifest · original media files. Do not rely exclusively on any one
provider.

## 42 — SOURCE OF TRUTH

House of Nucci's own database is the application source of truth. External APIs are
enrichment and verification sources. This protects against marketplace changes · URL
changes · API shutdowns · metadata changes · provider outages.

## 43 — DO NOT TREAT THE WALLET AS THE COLLECTION

Wallets contain spam · airdrops · utility tokens · hidden items · duplicates · unwanted
pieces · transferred works · test assets. Wallet discovery identifies *candidate* assets.
The House of Nucci manifest determines museum membership.

## 44 — MASTER ARTWORK MANIFEST

Import template fields: `internal_id` · `slug` · `title` · `display_title` · `artist_id` ·
`artist_name` · `series_id` · `series_name` · `year` · `edition_label` · `artwork_type` ·
`media_type` · `original_media_url` · `canonical_media_url` · `web_media_url` ·
`thumbnail_url` · `poster_url` · `width` · `height` · `duration` · `has_audio` · `chain` ·
`contract_address` · `token_id` · `token_standard` · `wallet_address` · `mint_platform` ·
`mint_date` · `opensea_url` · `raster_url` · `verse_url` · `primary_external_url` ·
`artist_url` · `series_url` · `description` · `historical_context` · `provenance` ·
`collector_note` · `acquisition_date` · `acquisition_source` · `tags` · `visibility` ·
`featured` · `display_priority` · `market_status` · `rights_status` · `room_id` ·
`wall_id` · `position` · `display_width` · `frame_style` · `lighting_profile` ·
`exhibition_ids` · `verification_status` · `last_verified`. Fields may evolve.

## 45 — RAW METADATA VS CURATED METADATA

Store EXTERNAL / SOURCE METADATA separately from HOUSE OF NUCCI CURATORIAL OVERRIDES.
Never allow an automated sync to erase curated edits.

## 46 — MEDIA SOURCE PRIORITY

1. owner-supplied original
2. artist-approved / original canonical media
3. on-chain / IPFS / Arweave canonical media
4. trusted platform media
5. marketplace thumbnail as fallback

Do not make OpenSea thumbnails the museum master assets.

## 47 — MEDIA PRESERVATION

House of Nucci is a collection, not merely a website. Maintain archival information:
original acquired? · original hash · original resolution · canonical token URI · IPFS CID
· Arweave ID · media mirrored? · playback verified? · audio preserved? · highest-quality
source? · last verification date. Do not silently modify originals.

## 48 — ADMIN / CURATOR CMS

The owner should eventually manage the collection without coding: ADD ARTWORK · IMPORT
TOKEN · EDIT ARTWORK · HIDE ARTWORK · ARCHIVE ARTWORK · FEATURE ARTWORK · ADD ARTIST ·
EDIT ARTIST · ASSIGN SERIES · ASSIGN ROOM · ASSIGN WALL · SET DISPLAY SCALE · SET FRAME ·
SET LIGHTING · ADD PROVENANCE · ADD COLLECTOR NOTE · ADD RIGHTS INFO · ADD TO EXHIBITION ·
ADD TO PATHWAY · SET EXTERNAL LINK · SET MARKET STATUS · PREVIEW · PUBLISH.

## 49 — FUTURE VISUAL CURATOR TOOL

The data architecture supports a future visual room editor (drag artwork onto wall ·
resize · reposition · change frame · change lighting · preview · publish). Do not delay
launch to build this unless implementation becomes unexpectedly simple.

## 50 — EXHIBITIONS

A first-class Exhibition entity: title · subtitle · curatorial statement · hero artwork ·
ordered works · room assignments · start date · end date · archived status · essay ·
related artist · cover image. An exhibition is NOT simply a filter.

## 51 — COLLECTION TIMELINE

Clearly differentiate ARTWORK CREATION DATE from HOUSE OF NUCCI ACQUISITION DATE. Never
mix them.

## 52 — RECENT ACQUISITIONS

Editorial module NEW TO THE HOUSE. Present like museum programming, not a shopping feed.

## 53 — SESSION PRESERVATION

If a visitor stands in Gallery 4, opens an artwork, visits the detail page and returns,
they return to Gallery 4. Preserve museum room · camera position · tour state · My House
· reasonable preference state. Do not send them back to the entrance.

## 54 — DEEP LINKS

Every important entity gets a permanent URL: `/collection` · `/artwork/argonaut-7008` ·
`/artist/alpha-centauri-kid` · `/series/argonauts` · `/exhibition/…` · `/pathway/…`. The
artwork page supports VIEW IN MUSEUM, which transports the visitor to the correct
room/work.

## 55 — WEB-FIRST PRINCIPLE

The 3D museum cannot replace the open web. Every artist and artwork page must be usable
without WebGL · wallet · account · special browser · app. Search engines must be able to
index meaningful content. The museum is an additional interface to the institution.

## 56 — SEO

Server-rendered/indexable pages · semantic HTML · canonical URLs · structured metadata ·
sitemap · robots configuration · meta descriptions · OpenGraph metadata · social preview
artwork · artist pages · artwork pages · exhibition pages.

## 57 — SOCIAL SHARING

Artwork social cards look exceptional: artwork · artist · title · HOUSE OF NUCCI. No
token price. No clutter.

## 58 — PERFORMANCE

Performance is a first-class design requirement: lazy loading · progressive asset loading
· route splitting · GLTF optimization · mesh compression · texture compression only when
visually safe · responsive images · LODs · frustum culling · occlusion considerations ·
distance-based video playback · room-based preloading · resource disposal · GPU-memory
awareness · CDN delivery · streaming video. Never load the entire collection into GPU
memory.

## 59 — PERFORMANCE TIERS

Device capability determines experience: FULL 3D · OPTIMIZED 3D · GUIDED 3D · 2D
COLLECTION. Never punish visitors with weak hardware.

## 60 — PERFORMANCE BUDGETS

Define actual budgets before production launch. Track initial JS · first render · Core
Web Vitals · 3D startup · time-to-museum · GPU memory · texture memory · video memory ·
FPS · mobile temperature · network transfer. Target smooth 60fps when feasible. Prefer
controlled degradation over frame-rate collapse.

## 61 — LOADING EXPERIENCE

No generic game-like loading screen if avoidable. Let visitors enter useful portions of
the House quickly; stream/preload secondary rooms afterward. Design the loading state as
part of House of Nucci identity.

## 62 — MOBILE

Mobile is a first-class platform. Test on real iPhones. Prioritize art visibility · easy
navigation · touch interactions · fast page transitions · battery usage · thermal
performance · video performance · readable metadata. The mobile collection archive must
be excellent even if 3D is simplified.

## 63 — ACCESSIBILITY

Provide a complete non-WebGL path. Support keyboard navigation · screen readers · alt
descriptions where appropriate · focus states · semantic HTML · contrast · reduced motion
· accessible controls. Never make important information hover-only.

## 64 — REDUCED MOTION

Respect `prefers-reduced-motion`. Disable/reduce forced camera animations · long
cinematic transitions · background motion. Retain a premium static experience.

## 65 — SOUND DESIGN

Optional only. Subtle museum room tone / architectural ambience. No soundtrack unless
specifically approved. Provide an obvious mute. Artwork audio always has priority.

## 66 — LIGHTING

Lighting supports artwork accuracy: wall wash · gallery spotlights · screen emission ·
architectural ambient light. Avoid tinting artwork with dramatic colored spotlights
unless deliberately curated.

## 67 — FRAME SYSTEM

Configurable presentation: FRAMELESS DIGITAL · THIN BLACK · ALUMINUM · FLOATING · MUSEUM
WHITE · DARK WOOD · LIGHT WOOD · SCREEN · PROJECTION · NO FRAME. Frame is metadata.

## 68 — ARTWORK SCALE

Works exist physically at different scales. Not every work is equivalent in size. Scale
is curatorial.

## 69 — ANALYTICS

Privacy-conscious analytics. Events: `homepage_view` · `enter_museum` · `open_collection`
· `room_entered` · `artwork_selected` · `artwork_detail_viewed` · `artist_viewed` ·
`pathway_started` · `pathway_completed` · `save_to_my_house` · `ai_guide_used` ·
`search_used` · `raster_outbound` · `opensea_outbound` · `artist_site_outbound` · `share`.
Do not publicly display popularity.

## 70 — ANALYTICS PURPOSE

Understand: which artwork holds attention · which artist sends users deeper · where
visitors leave · which tours work · what questions are asked repeatedly · what leads
someone to an external artist page · what leads to marketplace exploration · does Start
Here convert new visitors into explorers. Do not optimize for addictive engagement.

## 71 — PRIVACY

No wallet required to visit. No account required to browse. No email gate. No invasive
tracking. No fingerprinting. Wallet integration is not a V1 requirement.

## 72 — SECURITY

Treat all external metadata as untrusted. Sanitize HTML · URLs · metadata · artist
content · API data. Keep private API keys server-side. Secure admin. Implement
authentication best practices. Future transaction features require separate security
review.

## 73 — THIRD-PARTY FAILURES

House of Nucci must remain functional if OpenSea is down · Raster is down · an IPFS
gateway is unavailable · marketplace links fail. Cache enough canonical data for museum
operation. Third-party data degrades gracefully.

## 74 — DO NOT BUILD FINANCIAL INFRASTRUCTURE IN V1

Do NOT build: token · DAO · custody · lending · borrowing · fractional ownership · pooled
art investment · internal exchange · escrow · private-key custody · financial basket ·
on-site marketplace settlement. These are separate products with legal/security
complexity. We may link to established providers in the future.

## 75 — DO NOT BUILD EVERY EXTERNAL SERVICE

The coherent experience matters more than vertical integration. House of Nucci may
connect to Raster · OpenSea · Verse · SuperRare · White Walls · Gondi · Manifold ·
Transient Labs · other services. Do not duplicate mature services merely for
completeness.

## 76 — EXPERIENCE OVER INFRASTRUCTURE

The product makes fragmented infrastructure feel coherent. A visitor should not need to
understand which chain · which marketplace · which storage protocol · which token
standard before appreciating art. Technical information remains available for advanced
users.

## 77 — WEB3 LANGUAGE

Avoid unnecessary words — NFT · Web3 · tokenized · decentralized · crypto-native — when
normal art-world language communicates better. Use blockchain information where it
provides authenticity · provenance · ownership · history, not as the brand.

## 78 — TECHNICAL STACK

Frontend: Next.js · React · TypeScript. 3D: Three.js · React Three Fiber · Drei. Data:
PostgreSQL (Supabase acceptable initially). Auth: Supabase/Auth provider for admin.
Storage: Cloudflare R2 or comparable; IPFS/Arweave references preserved separately. CDN:
Cloudflare / Vercel. AI: retrieval-based architecture with provider abstraction.
Monitoring: Sentry or equivalent. Analytics: privacy-conscious product analytics.
Background jobs: queue/cron/server workers.

Alternatives may be recommended with a technically superior reason. Explain before
changing core architecture.

## 79 — DATABASE ENTITIES

At minimum: Collection · Collector · Artwork · Artist · Series · Exhibition · Pathway ·
Gallery · Room · Wall · Placement · MediaAsset · MarketplaceLink · Acquisition ·
ProvenanceEvent · Tag · RightsRecord · ExternalMetadataSource · CuratorialRelationship ·
CuratorialNote · VerificationRecord.

## 80 — DO NOT BUILD ONE GIANT JSON FILE

The collection is a durable cultural record. Use normalized structured data.
Configuration JSON may exist for room layout where appropriate, but canonical records
belong in the database.

## 81 — API ADAPTER LAYER

Create provider adapters (`providers/opensea/`, `providers/raster/`,
`providers/blockchain/`, `providers/ipfs/`, `providers/arweave/`). Normalize provider
information into internal models. Never spread provider-specific code across UI
components.

## 82 — AI PROVIDER ABSTRACTION

Do not hard-wire product logic to one AI vendor. Build a service boundary so
Claude/OpenAI/etc. can be swapped. AI functionality depends on curated data, not vendor
lock-in.

## 83 — CODE QUALITY

TypeScript strict mode · clean modular architecture · schema validation · linting ·
formatting · tests · component boundaries · service abstraction · environment
configuration · documentation. No enormous unmaintainable components. No hidden magic.

## 84 — TESTING

Unit · integration · browser/e2e · visual smoke · 3D functional tests where practical.
Test critical user flows.

## 85 — ERROR STATES

Design beautiful error behavior: missing media · API timeout · video playback failure ·
WebGL unavailable · broken marketplace link · unknown metadata · offline conditions. No
blank screens.

## 86 — CROSS-BROWSER QA

Chrome · Safari · Firefox · Edge · iOS Safari · Android Chrome. Real device testing is
required before production.

## 87 — ADMIN PUBLISHING WORKFLOW

States: DRAFT · REVIEW · PUBLISHED · ARCHIVED — for Artwork · Artist · Exhibition ·
Pathway · Editorial content.

## 88 — BACKUPS

Database backups required. Original collection media requires a redundant archival
strategy. Never rely exclusively on a marketplace, a wallet, or a single cloud provider
for preservation.

## 89 — DEVELOPMENT ENVIRONMENTS

Maintain LOCAL · STAGING · PRODUCTION. No significant changes tested first in production.

## 90 — DOCUMENTATION

Maintain: README · architecture.md · database-schema.md · media-pipeline.md ·
collection-import.md · 3d-museum.md · deployment.md · admin-guide.md · ai-guide.md ·
provider-integrations.md. Do not create a project only the original developer can
understand.

## 91 — FIRST VERTICAL SLICE

Do NOT immediately ingest all 200 artworks. First build an exceptional vertical slice
using ~12–20 representative works, including: static image · pixel art · GIF · video ·
1/1 · edition · multiple artists · multiple series · multiple aspect ratios · OpenSea
link · Raster link.

The House of Nucci Collection is known to contain pieces across artists/collections
including Alpha Centauri Kid / Argonauts and other digital work, **but do not fabricate
artwork records or metadata.** Use actual supplied assets/data. If unavailable, create
clearly marked placeholder/demo records that can be replaced cleanly. **Never pretend
placeholders are real collection works.**

## 92 — VERTICAL SLICE MUST PROVE

Homepage · Museum entrance · One fully designed museum wing · Desktop navigation · Mobile
interaction · Artwork presentation · Animated artwork · Artwork detail · Collection
archive · Artist Passport · Provenance view · External marketplace handoff · My House
save behavior · One Nucci Pathway · Basic admin/import · Performance architecture ·
Session preservation · Deep linking.

## 93 — ONLY AFTER VERTICAL SLICE APPROVAL

Then scale toward: full collection · additional galleries · artist records · exhibitions ·
pathways · AI Guide · advanced discovery. Do not populate 200 pieces into an experience
whose core UX has not been validated.

## 94 — PHASE 0: BEFORE YOU CODE

Inspect the repository first. If no project exists, create a technical/design plan
covering: product architecture · information architecture · page map · museum interaction
model · proposed technical stack · database schema · artwork ingestion plan · media
pipeline · 3D architecture strategy · performance strategy · mobile strategy · AI Guide
architecture · security considerations · rights-management approach · development
milestones. Then begin implementation.

Do not ask unnecessary questions when reasonable design decisions can be made. Flag only
decisions that materially require owner input.

## 95 — DESIGN BEFORE SCALE

Create an initial design system documenting color palette · type scale · spacing ·
navigation · museum labels · buttons · hover states · modals · artwork detail layout ·
mobile behavior · animation principles · transition principles. The visual system must
feel bespoke. Tailwind may be used technically; the product must not LOOK like Tailwind
UI.

## 96 — NO TEMPLATE FEEL

Avoid: card-dashboard aesthetic · rounded SaaS everything · gradient blobs · giant pill
buttons · generic startup hero · shadcn default appearance · template navbar · standard
NFT grid · crypto marketplace cards. The finished experience must look intentionally
art-directed.

## 97 — MOTION LANGUAGE

Motion feels like architecture: slow confidence · subtle easing · restrained parallax ·
camera transitions · museum-like reveal. Avoid bouncy animations · excessive spring
motion · confetti · gamification · gratuitous hover effects.

## 98 — CREATIVE SURPRISE

Use occasional impossible digital architecture — hidden gallery · monumental work · black
void · unexpected room transition · work that changes spatial perception. Keep it rare.
Sophistication comes from restraint.

## 99 — HUMAN ADVISORY PRINCIPLE

The eventual product should be reviewed by serious collectors · working digital artists ·
curators · art historians · people completely new to digital art. Do not optimize only
for crypto insiders or prominent collectors. Avoid bag bias.

## 100 — DEFINITION OF SUCCESS

A first-time visitor entering knowing nothing about digital art should, within minutes:
see something beautiful · understand who made it · learn why it may matter · discover
related work · understand that House of Nucci actually owns the work · understand how
provenance supports the work · discover more from the artist · and, if interested, know
where to legitimately explore collecting — without needing to understand wallets,
contracts, marketplaces, chains or token standards beforehand.

## 101 — DEFINITION OF DONE

Not done merely because a 3D room exists and images appear on walls. Done when: the
architecture feels designed · the artwork feels important · movement feels effortless ·
the archive feels editorial · artist records feel authoritative · provenance feels
understandable · mobile feels intentional · animation works correctly · performance is
excellent · external links are trustworthy · the collection is maintainable · the owner
can update it · the site is indexable · the museum remains usable without marketplace
APIs · the art remains visually faithful · the experience could not reasonably be
confused with a generic NFT gallery.

## 102 — FINAL CREATIVE DIRECTIVE

Do not ask "How do we put NFTs into a 3D gallery?" Ask "How would one of the world's most
thoughtful private digital-art collections build its own institution if architecture,
media and software could all become part of the curatorial experience?"

The museum is the emotional experience. The collection database is the cultural record.
The Artist Passports provide context. The Nucci Pathways provide education. My House
reveals taste. The Nucci Guide provides intelligent navigation. External platforms
provide transactions and specialized infrastructure. HOUSE OF NUCCI provides the
experience, context, curation and point of view.

## 103 — FIRST RESPONSE / FIRST ACTION

Inspect the repository → produce a concise implementation blueprint (stack · repository
structure · database architecture · page architecture · museum architecture approach ·
media ingestion approach · first vertical-slice scope · performance approach · key
technical risks · decisions made · decisions requiring owner input) → create a prioritized
build plan → begin Phase 1 implementation.

Default to action. Make reasonable decisions. Flag only decisions that could materially
alter House of Nucci's identity, artwork fidelity, ownership representation, legal rights,
or product architecture. Maintain a running implementation checklist in the repository so
progress survives across sessions.

## 104 — PERMANENT GUARDRAILS

- Never fabricate artwork metadata.
- Never fabricate artist biography.
- Never fabricate provenance.
- Never fabricate ownership.
- Never alter artwork.
- Never imply House of Nucci owns external work.
- Never add speculative investment claims.
- Never turn the site into an NFT trading dashboard.
- Never add a token.
- Never custody user assets.
- Never expose private API keys.
- Never introduce a major dependency without documenting why.
- Never sacrifice artwork fidelity for design effect.
- Never sacrifice performance for visual novelty.
- Never sacrifice cultural credibility for Web3 gimmicks.

**If uncertain: ART FIRST. TRUTH SECOND. EXPERIENCE THIRD. TECHNOLOGY SERVES ALL THREE.**

## PHASE PLAN (owner-defined)

| Phase | Scope |
|---|---|
| 0 | Architecture |
| 1 | Design system |
| 2 | Vertical-slice museum |
| 3 | Archive / artwork pages |
| 4 | Artist Passports |
| 5 | Collection ingestion / admin |
| 6 | My House / Pathways |
| 7 | Nucci Guide |
| 8 | Full collection ingestion |
| 9 | Optimization / QA / launch |
