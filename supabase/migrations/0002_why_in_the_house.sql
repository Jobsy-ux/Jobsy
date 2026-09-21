-- The collector's own account of why a work — or an artist — is in the House.
--
-- First-class rather than another curatorial note, because it is the House's actual
-- strength: a personal collection's value is its point of view, and this is the only
-- field that carries it (docs/POSITIONING.md).
--
-- Distinct from `curatorial_note`: a note is context or history, written in the
-- institution's voice. This is the collector speaking, and the interface attributes it to
-- them. Optional and selective — most works will have none, and an empty field is never
-- filled in on the collector's behalf (§104).

alter table artwork add column why_in_the_house text;
alter table artist  add column why_in_the_house text;

comment on column artwork.why_in_the_house is
  'The collector''s own account of why this work entered the collection. Attributed to the collector in the interface; never generated or inferred.';
comment on column artist.why_in_the_house is
  'The collector''s own account of why this artist''s work is in the House.';
