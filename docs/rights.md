# Rights

**Canonical. Confirmed by the owner (O-4), 2026-09-21.** The conservative posture below is
deliberate and is not to be relaxed without the owner saying so explicitly.

## The rule everything follows

**Ownership of a token is not ownership of copyright.** Holding a work — in a wallet, with
a verified contract, with a marketplace listing that names the House — grants no right to
display it, re-host it, make derivatives of it, or use it commercially. Those rights come
from a person, in writing, or from a licence. Nowhere in this codebase is a right inferred
from possession.

## Two separate questions

The record keeps them apart, because they have different answers and different evidence.

| Question | Field | Default |
|---|---|---|
| What may the House *do* with the media? | `rights.displayRightsStatus` + the three allow flags | `not-established`, everything false |
| Why may the House *publish this at all*? | `rights.publicationBasis` | `not-established` |

`publicationBasis` is one of:

| Basis | What it means | Evidence required |
|---|---|---|
| `not-established` | Nobody has established anything. The default. | — |
| `explicit-permission` | The artist or rights holder said yes. | Who granted it, and the date it was recorded. Enforced. |
| `verified-license` | A licence permits it. | The licence URL. Enforced. |
| `owner-created` | The House made the asset itself. | Applies to the generated placeholder media, and to nothing else. |

Both the schema and the database enforce this: a licence basis without a licence URL, or a
permission basis without an attributable grantor and date, is a validation error and a SQL
check violation. A licence nobody can read is not a licence.

## High-resolution originals are not public assets

`PUBLIC_DISPLAY_MAX_EDGE` is **2048px on the longest edge**. Any file the site serves from
the public directory must be at or under it, unless high-resolution re-hosting has been
explicitly permitted *and* a publication basis exists.

- A file above the cap with no permission is a **validation error**, not a warning.
- An asset with unknown dimensions is treated as unknown risk, not as permission.
- The `archivalOriginal` role must never be served from the public directory. Originals
  are preservation; delivery is a separate, smaller file.
- There is no download control, no "get the full file" action, and no link to an original
  anywhere in the interface.

The one exception is the generated placeholder media, which the House actually created and
therefore actually owns. That exception is recorded in the data (`owner-created`), not
buried in a comment, and it disappears with the placeholders.

## What publishing a work requires

A work reaches the public because someone established that it may be:

1. Record the basis, with evidence — who, when, where the evidence lives.
2. Record what that basis permits: display only, display and re-host, or more.
3. Only then set the work's state to `published`.

The validator warns on a published work with no basis in development, and **fails the
build** in production mode. This is intentional friction: it makes "we own it" an
insufficient answer at exactly the moment someone is tempted to use it.

## Where this lives in the code

| Guarantee | Enforced in |
|---|---|
| Rights default to nothing | `RightsRecordSchema` defaults; `rights_record` column defaults |
| No right is inferred from ownership | There is no code path from `token` to `rights` — verified by test |
| High-resolution needs explicit permission | `mayPublishHighResolution`, `mayServePublicly` |
| Originals stay out of public delivery | `isPubliclyServed` + `original-public` / `public-original` validation |
| Evidence is required, not optional | `licence-missing`, `permission-unattributed` validation; SQL check constraints |
| Publishing needs a basis | `no-publication-basis` — a warning in development, an error in production |

`tests/rights.test.ts` covers all of it, including the case that matters most: a work with
a verified contract, a verified token, a wallet address and a marketplace link still grants
the House nothing.

## When the real collection arrives

Every real record starts at `not-established`. Raising it is a deliberate act per work,
with evidence attached. Expect most works to sit at display-only for a long time, and that
is the correct resting state — it costs a little image quality and protects both the House
and the artists.

Artist permission is worth asking for on its own terms (O-4 in `DECISIONS.md`): a
conversation about showing someone's work properly is usually also the conversation that
produces a statement, process material and verified links for their passport.
