# Changelog — au-greenwashing

Calver, append-only. Rule IDs are immutable and never reused.

## 2026.1 — initial pack

Ported the ACCC/AANA environmental-claims seed (15 rules, `AU-GW-001`…`AU-GW-015`)
to the ClaimKind rule schema. Grounded in the ACCC "Environmental and
sustainability claims" guidance and the Australian Consumer Law (ss 18, 29, 33,
s4). Enforcement citations: Clorox/GLAD, Edgewell, the ACCC greenwashing
internet sweep, Australian Gas Networks, and Grill'd.

**Activated 2026-07-07** after a citation-verification pass against accc.gov.au:
all 5 ACCC actions confirmed live and every `date` corrected to its media-release
date (two carried the wrong year — Clorox `2024-04-18`→`2025-04-14`, Grill'd
`2024`→`2026-06-16`; three year-only dates tightened). Clorox is a final judgment
($8.25m, admitted); Edgewell, Australian Gas Networks and Grill'd are cited as
ongoing proceedings (alleged conduct). All 15 rules are now active. Legal review
of rule wording remains advisable. Not legal advice — see `../../CITATIONS.md`.
