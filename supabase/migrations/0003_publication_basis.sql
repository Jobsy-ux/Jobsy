-- Why a work may be shown publicly at all.
--
-- `rights_record` already says what the House may do with the media. This says on what
-- basis anything is published in the first place — and it starts at nothing. Ownership of
-- a token is never one of these bases (§30, docs/rights.md).

create type publication_basis as enum (
  'not-established',      -- the default: no basis recorded, so nothing is assumed
  'explicit-permission',  -- the artist or rights holder said yes, and it is recorded
  'verified-license',     -- a licence permits it, and the licence is on file
  'owner-created'         -- the House made the asset itself
);

alter table rights_record
  add column publication_basis publication_basis not null default 'not-established',
  add column permission_granted_by text,
  add column permission_recorded_on date,
  add column permission_evidence text;

-- A licence that nobody can read is not a licence, and a permission nobody can trace to a
-- person and a date is not a permission.
alter table rights_record add constraint licence_is_readable
  check (publication_basis <> 'verified-license' or license_url is not null);

alter table rights_record add constraint permission_is_attributable
  check (
    publication_basis <> 'explicit-permission'
    or (permission_granted_by is not null and permission_recorded_on is not null)
  );

-- High-resolution re-hosting requires a basis. Holding the token is not one.
alter table rights_record add constraint high_res_needs_a_basis
  check (not high_res_rehosting_allowed or publication_basis <> 'not-established');

comment on column rights_record.publication_basis is
  'Why the House may show this work publicly. Never inferred from ownership; raised only by a human recording evidence.';
comment on column rights_record.permission_evidence is
  'Where the evidence lives: an email thread, a signed note, a licence page.';
