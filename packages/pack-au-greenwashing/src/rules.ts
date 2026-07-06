/**
 * au-greenwashing — 15 rules porting the ACCC/AANA environmental-claims seed to
 * the ClaimKind rule schema. Grounded in the ACCC's "Environmental and
 * sustainability claims" guidance (eight principles), the Australian Consumer
 * Law (ss 18, 29, 33, and the s4 future-representations rule), and the
 * enforcement actions in ./citations.
 *
 * Every rule is `draft: true` — authored from enforcement sources by a
 * non-human author, pending human review per CLAUDE.md §5. NOT legal advice.
 */
import type { ClaimRule } from "@claimkind/core";
import { AGN, CLOROX, EDGEWELL, GRILLD, SWEEP } from "./citations.js";

const PACK = "au-greenwashing";

export const rules: ClaimRule[] = [
  {
    id: "AU-GW-001",
    pack: PACK,
    jurisdiction: "AU",
    category: "environmental",
    severity: "medium",
    title: "Vague, unqualified environmental umbrella claim",
    rationale:
      "Broad terms like 'eco-friendly' or 'kind to the planet' imply a whole-of-product environmental benefit the brand usually can't fully back. The ACCC treats unqualified umbrella claims as high risk because the overall impression overstates the actual benefit.",
    triggers: [
      { kind: "regex", value: "\\b(eco[- ]?friendly|environmentally friendly|planet[- ]?friendly|kind to the (planet|earth)|good for the planet)\\b" },
      { kind: "semantic", value: "An unqualified overall environmental benefit is implied without a specific, evidenced basis." },
    ],
    enforcement: [SWEEP],
    remediation:
      "Name the specific, verifiable benefit instead of a vague label (e.g. 'carton made from FSC-certified paperboard'). Qualify exactly what is and isn't covered.",
    examples: {
      violating: ["Our eco-friendly formula is kind to the planet."],
      compliant: ["This carton is FSC-certified paperboard."],
    },
    draft: true,
  },
  {
    id: "AU-GW-002",
    pack: PACK,
    jurisdiction: "AU",
    category: "environmental",
    severity: "high",
    title: "Carbon-neutral / net-zero claim without disclosed basis",
    rationale:
      "Carbon-neutral / net-zero claims require credible, current substantiation and usually rely on offsets and/or certification. Stating the outcome without disclosing the basis risks a misleading impression of operational emissions reduction.",
    triggers: [
      { kind: "regex", value: "\\b(carbon neutral|net[- ]?zero|climate positive|climate neutral|zero carbon|carbon negative)\\b" },
    ],
    exceptions: [
      { kind: "literal", value: "carbon neutral certified by climate active" },
      { kind: "literal", value: "net-zero certified under" },
    ],
    enforcement: [AGN, SWEEP],
    remediation:
      "Only claim if you hold current certification or robust evidence; state the scheme/standard and scope, and disclose any reliance on offsets rather than reductions.",
    examples: {
      violating: ["This product is 100% carbon neutral."],
      compliant: ["This product is carbon neutral certified by Climate Active; offsets and scope are disclosed."],
    },
    draft: true,
  },
  {
    id: "AU-GW-003",
    pack: PACK,
    jurisdiction: "AU",
    category: "environmental",
    severity: "high",
    title: "Future / aspirational claim without reasonable grounds",
    rationale:
      "Forward-looking sustainability targets are deemed misleading under ACL s4 unless the maker had reasonable grounds — a concrete, resourced plan — at the time of the claim. The ACCC's 'Love Gas' action targeted exactly this overreach.",
    triggers: [
      { kind: "regex", value: "\\b(by 20\\d{2}|on a journey to|working towards|committed to becoming|aiming to be|will be (carbon neutral|sustainable|plastic[- ]?free|net[- ]?zero))\\b" },
    ],
    enforcement: [AGN],
    remediation:
      "Tie any future claim to a documented plan with measurable milestones, or state current progress factually instead ('since 2022 we have cut X by Y%').",
    examples: {
      violating: ["We are on a journey to net-zero and will be carbon neutral by 2030."],
      compliant: ["Since 2022 we have cut manufacturing emissions by 30%, independently verified."],
    },
    draft: true,
  },
  {
    id: "AU-GW-004",
    pack: PACK,
    jurisdiction: "AU",
    category: "environmental",
    severity: "critical",
    title: "Recycled-content overstatement ('ocean plastic')",
    rationale:
      "Recycled-content claims must be accurate and not inflated by wording or imagery. In the GLAD case, '50% ocean plastic' implied plastic recovered from the sea when it was collected inland — the overall impression was found misleading.",
    triggers: [
      { kind: "regex", value: "\\b(ocean plastic|made from the ocean|100% recycled|fully recycled|made (entirely )?from recycled)\\b" },
    ],
    enforcement: [CLOROX],
    remediation:
      "State the precise, substantiated percentage and the true source of the material ('contains 50% recycled content sourced from kerbside collection').",
    examples: {
      violating: ["Made from 100% recycled ocean plastic."],
      compliant: ["Contains 50% recycled content sourced from kerbside collection."],
    },
    draft: true,
  },
  {
    id: "AU-GW-005",
    pack: PACK,
    jurisdiction: "AU",
    category: "environmental",
    severity: "critical",
    title: "Absolute environmental-safety claim ('reef safe')",
    rationale:
      "An absolute safety claim based on the absence of one or two ingredients can mislead if other ingredients may still cause harm. The Edgewell action challenged 'reef friendly' sunscreen claims on exactly this basis.",
    triggers: [
      { kind: "regex", value: "\\b(reef[- ]?(safe|friendly)|ocean[- ]?safe|marine[- ]?safe|safe for (the )?(reef|ocean|marine|waterways)|won'?t harm (the )?(reef|ocean|environment))\\b" },
    ],
    enforcement: [EDGEWELL],
    remediation:
      "Avoid blanket 'reef/ocean safe' claims. State the specific accurate fact instead ('formulated without oxybenzone and octinoxate') without implying total environmental safety.",
    examples: {
      violating: ["Our sunscreen is reef safe and won't harm the ocean."],
      compliant: ["Formulated without oxybenzone and octinoxate."],
    },
    draft: true,
  },
  {
    id: "AU-GW-006",
    pack: PACK,
    jurisdiction: "AU",
    category: "environmental",
    severity: "medium",
    title: "'Recyclable' where not practically recyclable in Australia",
    rationale:
      "'Recyclable' can mislead if the material isn't accepted in common kerbside collection (e.g. soft plastics, laminates) or requires a scheme most consumers can't access. Theoretical recyclability isn't practical recyclability.",
    triggers: [
      { kind: "regex", value: "\\b((fully |100% )?recyclable|widely recycled|please recycle|recycle me)\\b" },
    ],
    enforcement: [SWEEP],
    remediation:
      "Qualify how and where it can actually be recycled ('kerbside recyclable in most council areas' or 'return via [scheme]'). Don't claim recyclable for soft plastics without a real, accessible pathway.",
    examples: {
      violating: ["This soft plastic wrapper is 100% recyclable."],
      compliant: ["Return this soft-plastic wrapper at a participating supermarket drop-off point."],
    },
    draft: true,
  },
  {
    id: "AU-GW-007",
    pack: PACK,
    jurisdiction: "AU",
    category: "environmental",
    severity: "medium",
    title: "Unqualified 'biodegradable' / 'compostable' claim",
    rationale:
      "Unqualified 'biodegradable'/'compostable' implies the item breaks down readily in ordinary conditions. Many only degrade in industrial composting, not home compost or landfill, so the bare claim overstates the real-world outcome.",
    triggers: [
      { kind: "regex", value: "\\b(biodegradable|compostable|breaks down naturally|degrades naturally|returns to (the )?earth)\\b" },
    ],
    enforcement: [SWEEP],
    remediation:
      "Specify the standard and conditions ('certified home compostable to AS 5810' or 'industrially compostable only') and the realistic timeframe and where it applies.",
    examples: {
      violating: ["Our packaging is fully biodegradable and compostable."],
      compliant: ["Dispose of via your council green-waste bin where accepted."],
    },
    draft: true,
  },
  {
    id: "AU-GW-008",
    pack: PACK,
    jurisdiction: "AU",
    category: "environmental",
    severity: "high",
    title: "'Plastic-free' where plastic components remain",
    rationale:
      "'Plastic-free' is falsified by any plastic component — liners, laminates, seals, labels, pump mechanisms. A single plastic part in otherwise paper/glass packaging makes the absolute claim misleading.",
    triggers: [
      { kind: "regex", value: "\\b(plastic[- ]?free|no plastic|zero plastic|free from plastic)\\b" },
    ],
    enforcement: [CLOROX],
    remediation:
      "Only use if genuinely no plastic is present. Otherwise describe components specifically ('paperboard carton; pump is recyclable polypropylene').",
    examples: {
      violating: ["Our packaging is completely plastic-free."],
      compliant: ["The outer carton is paperboard; the pump is recyclable polypropylene."],
    },
    draft: true,
  },
  {
    id: "AU-GW-009",
    pack: PACK,
    jurisdiction: "AU",
    category: "environmental",
    severity: "medium",
    title: "'Chemical-free' / 'non-toxic' / 'all-natural' as eco positioning",
    rationale:
      "'Chemical-free' is scientifically impossible, and 'non-toxic'/'free from nasties' imply a safety/environmental benefit by contrast with competitors that isn't substantiated. The ACCC sweep flagged cosmetics among the worst sectors for this.",
    triggers: [
      { kind: "regex", value: "\\b(chemical[- ]?free|toxin[- ]?free|non[- ]?toxic|free from (nasties|chemicals|toxins)|100% natural|all[- ]?natural)\\b" },
    ],
    enforcement: [SWEEP],
    remediation:
      "Drop 'chemical-free'. State the specific verifiable fact ('formulated without added sulfates or parabens') without implying competitors are unsafe.",
    examples: {
      violating: ["A chemical-free, all-natural, non-toxic formula."],
      compliant: ["Formulated without added sulfates or parabens."],
    },
    draft: true,
  },
  {
    id: "AU-GW-010",
    pack: PACK,
    jurisdiction: "AU",
    category: "environmental",
    severity: "medium",
    title: "Unqualified 'sustainably / ethically sourced' claim",
    rationale:
      "'Sustainably/ethically sourced' was specifically called out by the ACCC as high risk when used without traceability evidence. It implies a verified supply-chain standard the brand often can't demonstrate.",
    triggers: [
      { kind: "regex", value: "\\b(sustainably sourced|responsibly sourced|ethically sourced|ethically made|sustainable (sourcing|materials|packaging|ingredients))\\b" },
    ],
    enforcement: [SWEEP],
    remediation:
      "Back it with a recognised certification or describe the actual practice and its scope ('cocoa Rainforest Alliance certified'). Avoid the bare label if you can't evidence the chain.",
    examples: {
      violating: ["All ingredients are ethically sourced and sustainably sourced."],
      compliant: ["Our cocoa is Rainforest Alliance certified; certificate available on request."],
    },
    draft: true,
  },
  {
    id: "AU-GW-011",
    pack: PACK,
    jurisdiction: "AU",
    category: "environmental",
    severity: "medium",
    title: "Unsubstantiated comparative environmental claim",
    rationale:
      "Comparative green claims need a transparent, like-for-like, evidenced basis. Vague comparisons against unnamed competitors or different product types create a misleading impression of relative benefit.",
    triggers: [
      { kind: "regex", value: "\\b(greener than|more sustainable than|lower carbon than|better for the (planet|environment) than|eco[- ]?friendlier|less (plastic|waste) than (other|leading|competing))\\b" },
    ],
    enforcement: [SWEEP],
    remediation:
      "Make the comparison specific and substantiated ('uses 30% less packaging by weight than our previous design'). Identify what's compared and the evidence.",
    examples: {
      violating: ["Greener than other leading brands and better for the planet than the rest."],
      compliant: ["Uses 30% less packaging by weight than our previous design."],
    },
    draft: true,
  },
  {
    id: "AU-GW-012",
    pack: PACK,
    jurisdiction: "AU",
    category: "environmental",
    severity: "high",
    title: "Self-made or unaccredited certification / eco-badge",
    rationale:
      "Self-developed 'certifications', seals or badges imply independent verification that doesn't exist. The ACCC specifically flagged businesses creating their own certification schemes as a greenwashing pattern.",
    triggers: [
      { kind: "regex", value: "\\b(certified (green|eco|sustainable)|eco[- ]?certified|our (green|eco) (seal|standard|certification|badge))\\b" },
    ],
    enforcement: [SWEEP],
    remediation:
      "Only display marks from genuine, current third-party schemes, used per their rules. Don't invent badges or imply endorsement you don't hold.",
    examples: {
      violating: ["Look for our eco seal — certified green by our own standard."],
      compliant: ["Certified by the Vegan Society (registration on request)."],
    },
    draft: true,
  },
  {
    id: "AU-GW-013",
    pack: PACK,
    jurisdiction: "AU",
    category: "environmental",
    severity: "medium",
    title: "Offset-reliant neutrality presented as reduction",
    rationale:
      "Presenting offset purchases as if they were operational emissions reductions can mislead. Consumers may infer the brand cut its own footprint when it paid for offsets of varying integrity.",
    triggers: [
      { kind: "regex", value: "\\b(carbon offsets?|we offset our|offset(ting)? (our|all|its) (carbon|emissions|footprint))\\b" },
    ],
    enforcement: [AGN],
    remediation:
      "Be explicit that the claim relies on offsets, name the scheme/standard, and separate offsetting from any actual reductions you've made.",
    examples: {
      violating: ["We offset our emissions, so every order is guilt-free."],
      compliant: ["We fund verified reforestation via Gold Standard, separately from our own emissions reductions."],
    },
    draft: true,
  },
  {
    id: "AU-GW-014",
    pack: PACK,
    jurisdiction: "AU",
    category: "environmental",
    severity: "medium",
    title: "Vague virtue messaging tied to a purchase",
    rationale:
      "Emotive 'better planet' messaging tied to a purchase implies a tangible environmental benefit from buying. Without a specific, evidenced action behind it the impression overstates the product's impact — the concern in the Grill'd 'Tree Day' action.",
    triggers: [
      { kind: "regex", value: "\\b(for a better (planet|future|tomorrow)|for future generations|do your bit for the planet|every purchase helps the (planet|environment)|save the planet)\\b" },
    ],
    enforcement: [GRILLD],
    remediation:
      "Replace the sentiment with the concrete action and its scale ('we fund the recovery of 1kg of plastic per order, verified by [partner]'), or remove it.",
    examples: {
      violating: ["Every purchase helps the planet — shop for a better tomorrow."],
      compliant: ["We donate 1% of revenue to reforestation, verified in our annual report."],
    },
    draft: true,
  },
  {
    id: "AU-GW-015",
    pack: PACK,
    jurisdiction: "AU",
    category: "environmental",
    severity: "high",
    title: "Absolute / superlative environmental claim",
    rationale:
      "Absolutes like 'zero waste', '100% sustainable' or 'no environmental impact' are almost never substantiable across a real product lifecycle, so the overall impression overstates the benefit.",
    triggers: [
      { kind: "regex", value: "\\b(zero waste|waste[- ]?free|100% sustainable|fully sustainable|completely (green|eco|sustainable)|no environmental impact|leaves no footprint)\\b" },
    ],
    enforcement: [SWEEP, CLOROX],
    remediation:
      "Avoid absolutes. Quantify the specific, evidenced improvement instead ('diverts 90% of manufacturing waste from landfill').",
    examples: {
      violating: ["A zero waste, 100% sustainable product with no environmental impact."],
      compliant: ["Our process diverts 90% of manufacturing waste from landfill."],
    },
    draft: true,
  },
];
