# Moving House of Nucci to its own repository

**Decision (owner, 2026-09-21):** House of Nucci lives in a dedicated repository rather
than inside `Jobsy`. The existing commit history and documentation are preserved; nothing
is rewritten or discarded.

**Status: prepared, not executed.** Creating a repository needs a permission this
session's GitHub App installation does not have — `POST /user/repos` returns
`403 Resource not accessible by integration`. The move itself is one command once the
empty repository exists.

## What moves

The entire history. `Jobsy` was an empty repository — a one-line README — when this work
began, so every commit after the root is House of Nucci:

```
de8c704  Canonical domain houseofnucci.art, and positioning as a personal collection
bd6d34a  House of Nucci: architecture, design system and vertical-slice museum
76e61e0  Initial commit            ← Jobsy's original one-line README
```

No filtering, subtree split or history rewrite is needed. Keeping the root commit preserves
the true history of the work, which is what "do not rewrite" means here. (If you would
rather the first House of Nucci commit be the root, say so — but it discards a real commit,
so it is not the default.)

## Doing it

1. **Create the empty repository.** `Jobsy-ux/house-of-nucci`, **private**, with no README,
   no `.gitignore` and no licence — an initial commit on the remote would make the first
   push a merge. Private is the right default for a personal collection; making it public
   later is one click, and unpublishing is not.

2. **Push the history.** From a clone of this repository:

   ```bash
   git remote add house-of-nucci git@github.com:Jobsy-ux/house-of-nucci.git
   git push house-of-nucci claude/house-of-nucci-spec-8r4rps:main
   git push house-of-nucci claude/house-of-nucci-spec-8r4rps
   ```

   The first push makes the work the new repository's `main`; the second keeps the working
   branch so in-flight work continues under the same name.

3. **Check it landed.** `git log --oneline` on the new `main` should show all three commits,
   and `npm install && npm run check && npm run build` should pass from a fresh clone.

4. **Then, and only then, clean up `Jobsy`.** Delete the
   `claude/house-of-nucci-spec-8r4rps` branch there. Until step 3 is confirmed, that branch
   is the only pushed copy of the work, so nothing in `Jobsy` is deleted by this plan.

## If you would rather I did it

Two ways to unblock the automated path:

- Create the empty repository yourself (step 1), tell me, and I will do steps 2 and 3.
- Or grant the Claude GitHub App "administration: write" on the account, which is what
  repository creation requires. Reconnect at
  https://claude.ai/connect-github?org=95661078-32b8-4eec-ae25-a80f1de24344, or install the
  app against the new repository at
  https://github.com/apps/claude/installations/select_target.

## A portable copy

A `git bundle` of the complete history was produced alongside this document. It is a single
file containing every commit, and it clones like a remote:

```bash
git clone house-of-nucci-history.bundle house-of-nucci
```

It is a belt-and-braces copy for the move, not part of the repository — it is deliberately
not committed, since the repository already is the history.

## After the move

- `NEXT_PUBLIC_SITE_URL` and the canonical domain are unaffected: `houseofnucci.art` is
  configured in `src/lib/site.ts`, not in repository settings.
- `docs/DECISIONS.md` O-1 is resolved by this decision; the repository question it raised
  no longer needs an answer.
- Nothing in the build depends on the repository name. The npm package has been
  `house-of-nucci` since the first commit.
