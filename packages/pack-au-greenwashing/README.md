# @claimkind/pack-au-greenwashing

The **free** AU greenwashing rule pack (ACCC / AANA) for ClaimKind, MIT-licensed —
the trust layer. 15 rules (`AU-GW-001`…`AU-GW-015`) porting the ACCC/AANA
environmental-claims seed to the ClaimKind schema, each backed by a real ACCC
enforcement citation (Clorox/GLAD, Edgewell, the 2023 greenwashing internet
sweep, Australian Gas Networks, Grill'd).

## Draft status — read before relying on this

**Every rule ships `draft: true`.** They were authored from enforcement sources
by a non-human author and await a **human** citation/wording review (see
[`../../CITATIONS.md`](../../CITATIONS.md)). Because they are draft, production
`lint()` **skips them** — so `claimkind check --pack au-greenwashing` runs clean
until a human reviews each rule and removes `draft: true`. The invariant suite
still fully exercises every rule's examples (it tests a non-draft copy), so the
rules are verified well-formed today; they are simply not yet *active*.

To activate after review: remove `draft: true` from the reviewed rule in
`src/rules.ts`, tighten its citation `date`/`outcome` per `CITATIONS.md`, and
land it as a PR with the citation links.

## Structure

```
src/citations.ts   # 5 verified ACCC enforcement actions
src/rules.ts        # the 15 rules
src/index.ts        # manifest (calver 2026.1) + LoadedPack export
test/invariants.test.ts
```

Linting, not legal advice.
