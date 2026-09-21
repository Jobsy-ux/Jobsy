# The Nucci Guide

Architecture for the AI docent (§37–38). **Not built yet** — Phase 7, after the vertical
slice is approved. This is the shape it must have, written now so nothing built earlier
makes it harder.

## What it is

A docent that appears where a visitor already is: GO DEEPER on an artwork, ABOUT THE
ARTIST, SHOW ME SOMETHING RELATED, I'M NEW TO THIS, TAKE ME SOMEWHERE UNEXPECTED. Not a
floating chat bubble, and never the front door.

## Grounding

The Guide answers from House sources or it does not answer:

- artwork records, provenance and exhibition history
- artist passports and the sources cited on them
- curatorial notes and pathway essays
- owner-approved documents and verified external material

Unconstrained model memory is not a source. Where a question cannot be answered from the
record, the honest answer is that the House does not know — not a plausible sentence.
Every factual reply can show SOURCES →, and the interface distinguishes **documented
fact** from **House of Nucci interpretation**, which is exactly the distinction the
`curatorial_note` table and `provenance_event.certainty` already encode (§38).

## Shape

```
src/guide/
  retrieval/        index built from the record; chunk = one entity, with its citations
  prompt/           system prompts and the refusal-to-guess policy
  providers/        an interface, with adapters per vendor
  actions/          what the Guide may do: point at a work, open a record, walk the visitor
```

No product logic depends on a vendor (§82). The provider interface takes messages and
returns text plus citations; swapping Claude for another model is one adapter.

## Boundaries

- It may not invent biography, provenance, dates, motivation or meaning.
- It may not present an external work as part of the collection.
- It may not value a work, forecast a price, or advise on collecting as investment.
- It may guide a visitor physically to another work, because that is a museum act.
- Its use is logged as an event count only — no transcripts tied to a person (§69, §71).

## Before it ships

The retrieval index is only as good as the record. It waits on real artist passports and
sourced material (`DECISIONS.md`, O-2 and O-4): a docent grounded in placeholder records
would have nothing true to say.
