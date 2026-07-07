/**
 * Verified ACCC enforcement citations backing the AU greenwashing pack.
 * Re-verified against accc.gov.au on 2026-07-07: each action confirmed live and
 * every date corrected to the media-release date (see CITATIONS.md). Clorox is a
 * final judgment ($8.25m, admitted); Edgewell, Australian Gas Networks and
 * Grill'd are ongoing proceedings — outcomes are worded as alleged, not as
 * established breaches.
 */
import type { EnforcementCitation } from "@claimkind/core";

export const CLOROX: EnforcementCitation = {
  regulator: "ACCC",
  action: "ACCC v Clorox Australia — GLAD 'to be GREEN' 50% Ocean Plastic bags",
  date: "2025-04-14",
  url: "https://www.accc.gov.au/media-release/clorox-ordered-to-pay-825m-in-penalties-for-misleading-ocean-plastic-claims-about-certain-glad-products",
  outcome:
    "Federal Court: $8.25m penalty for misleading '50% ocean plastic' recycled-content representations (plastic in fact collected inland).",
};

export const EDGEWELL: EnforcementCitation = {
  regulator: "ACCC",
  action: "ACCC v Edgewell — Banana Boat / Hawaiian Tropic 'reef friendly' sunscreens",
  date: "2025-07-01",
  url: "https://www.accc.gov.au/media-release/banana-boat-and-hawaiian-tropic-owner-in-court-over-alleged-greenwashing-claims-that-its-sunscreens-were-%E2%80%98reef-friendly%E2%80%99",
  outcome:
    "Federal Court proceedings: alleged 'reef friendly' claims with no reasonable/scientific basis (products contained other ingredients that may harm reefs).",
};

export const SWEEP: EnforcementCitation = {
  regulator: "ACCC",
  action: "ACCC greenwashing internet sweep",
  date: "2023-03-02",
  url: "https://www.accc.gov.au/media-release/accc-greenwashing-internet-sweep-unearths-widespread-concerning-claims",
  outcome:
    "57% of 247 businesses reviewed made concerning environmental claims; vague/unqualified terms and poor substantiation flagged, cosmetics among worst sectors.",
};

export const AGN: EnforcementCitation = {
  regulator: "ACCC",
  action: "ACCC v Australian Gas Networks — 'Love Gas' renewable-gas campaign",
  date: "2025-06-26",
  url: "https://www.accc.gov.au/media-release/australian-gas-networks-in-court-over-alleged-greenwashing-in-renewable-gas-campaign",
  outcome:
    "Federal Court proceedings: alleged future/aspirational renewable-gas representations made without reasonable grounds (ACL s4).",
};

export const GRILLD: EnforcementCitation = {
  regulator: "ACCC",
  action: "ACCC v Grill'd — 'Tree Day Tuesday' donation representations",
  date: "2026-06-16",
  url: "https://www.accc.gov.au/media-release/grilld-in-court-for-allegedly-misleading-customers-about-tree-day-tuesday-donations",
  outcome:
    "Federal Court proceedings: alleged misleading representations about an environmental benefit tied to purchases.",
};
