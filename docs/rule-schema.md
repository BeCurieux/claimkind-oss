# Rule schema

The public contract. Additive changes only. See `@claimkind/core` types for the
authoritative definitions.

A **rule** (`ClaimRule`) carries a stable immutable `id`, `jurisdiction`,
`category`, `severity`, `triggers`, optional `exceptions`, **≥1 enforcement
citation**, `remediation`, and `examples` (≥1 violating, ≥1 compliant).

### Triggers

| kind | `value` meaning |
|---|---|
| `literal` | exact phrase, case-insensitive, word-boundary matched |
| `regex` | JS RegExp source, compiled with flags `gi` |
| `proximity` | `"<termA> ~<N> <termB>"` — termA within N words of termB |
| `semantic` | natural-language description; only evaluated with an LLM adapter; capped at `advisory` unless corroborated |

### Invariants (enforced by tests)

- every rule has ≥1 enforcement citation;
- every rule has ≥1 violating and ≥1 compliant example, and each is exercised by
  the suite (violating MUST trigger, compliant MUST NOT);
- rule IDs are immutable and unique;
- pack versions are calver (`YYYY.N`) and append-only.

Linting, not legal advice.
