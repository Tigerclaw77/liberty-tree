# Liberty Tree Engagement Time Study

Date: 2026-07-07
Status: Public-source operational time study
Manufacturer selected: MG Chemicals
Engagement scope: PFAS evidence discovery for three public conformal coating products

## Purpose

This document measures a real public-source evidence discovery run as if Liberty Tree had been hired to evaluate a medium-complexity manufacturer scope.

This is not a methodology document, service framework, legal opinion, compliance conclusion, product certification, or client-ready packet. The purpose is to measure the work: what had to be done, how long it took, what blocked progress, and whether the economics look profitable today.

## Scope Selected

Manufacturer: MG Chemicals
Product family: conformal coatings
Products reviewed:

- 419D Acrylic Conformal Coating
- 4223F Premium Polyurethane Conformal Coating
- 422B Silicone Modified Conformal Coating

Why this was a medium-complexity public scenario:

- Public product pages exist for each product.
- Multiple public SDS variants exist by country, language, and product form.
- Product-specific PFAS declarations exist.
- Other compliance documents exist, including RoHS, SVHC/REACH, EU POP, Prop 65, and TSCA PBT documents.
- Compliance documents were exposed through product-page dropdown option values rather than ordinary visible PDF links.
- The product family includes different chemistries, so family-level assumptions would be risky.

Use limitation:

- Only publicly available information was used.
- No client documents, supplier correspondence, private portal records, BOMs, formulations, test reports, or customer requests were available.
- No expert reviewer was actually engaged. Expert minutes below are estimated for a client-ready delivery.

## Measurement Definitions

AI minutes:

- Rounded estimate of AI-assisted search, extraction, synthesis, and drafting time.
- Includes command-driven public page inspection and PDF extraction time.
- Machine PDF extraction was much faster than the rounded AI minutes, but the rounded value reflects operator-supervised AI work.

Human minutes:

- Estimated analyst/operator time spent deciding what to search, interpreting outputs, handling blockers, narrowing scope, and preparing the study.

Expert minutes:

- Estimated subject-matter expert review time required if this were converted into a client-ready PFAS Evidence Packet.
- Expert minutes were not actually consumed during this public-source run.

## Public Sources Reviewed

### Product Pages

| Product | Public Product Page |
|---|---|
| 419D | https://mgchemicals.com/products/conformal-coatings/acrylic-conformal-coatings/circuit-board-protective-coating/ |
| 4223F | https://mgchemicals.com/products/conformal-coatings/polyurethane-conformal-coatings/urethane-conformal-coating/ |
| 422B | https://mgchemicals.com/products/conformal-coatings/silicone-conformal-coatings/silicone-modified-conformal-coating/ |

### Public Documents Collected Or Inspected

| Document Class | Documents Reviewed | Count |
|---|---|---:|
| PFAS declarations | 419D, 4223F, 422B product-specific PFAS declarations | 3 |
| SDS | Canada/USA English SDS for 419D liquid, 4223F liquid, 422B liquid, 422B pen | 4 |
| TDS | 419D, 4223F, 422B technical data sheets | 3 |
| RoHS declarations | 419D, 4223F, 422B product-specific RoHS declarations | 3 |
| SVHC/REACH letters | 419x acrylic, 4223x urethane, 422B/422BP letters | 3 |
| General compliance declarations | EU POP and TSCA Section 6(h) PBT declarations | 2 |
| Product-family documents | Conformal coatings category sheet and application guide | 2 |
| Total | Public PDFs reviewed or extracted | 20 |

Observed extraction volume:

- PDFs reviewed or extracted: 20
- Total pages extracted: 101
- Approximate extracted text: 166,176 characters
- Observed PDF fetch/extract machine time after URLs were known: approximately 11 seconds across extraction runs

Important finding:

Once URLs were known, document extraction was nearly trivial. The real work was deciding where to look, finding hidden document URLs, controlling scope, and interpreting what the documents did or did not support.

## Task Log

| # | Task Performed | Objective | AI Minutes | Human Minutes | Expert Minutes | Blockers | Reusable Artifacts Produced |
|---:|---|---|---:|---:|---:|---|---|
| 1 | Repo and context check | Confirm work belongs in the Liberty Tree repository and identify existing validation context | 2 | 5 | 0 | None | Scope note for time study |
| 2 | Candidate scan | Identify a medium-complexity public manufacturer with SDS, TDS, and compliance documents | 5 | 12 | 0 | Initial candidate searches were noisy and did not immediately reveal a clean scenario | Candidate selection notes |
| 3 | Manufacturer selection | Choose MG Chemicals conformal coatings as the public-source engagement target | 2 | 10 | 0 | Needed enough complexity without creating an enterprise-scale scrape | Engagement scope |
| 4 | Category page review | Identify product family structure and candidate product pages | 3 | 12 | 0 | Category page was large and contained many links, scripts, and styling noise | Product candidate list |
| 5 | Product scope selection | Select 419D, 4223F, and 422B as the scoped product set | 2 | 10 | 5 | Products are related but chemically different; family assumptions would be risky | Three-product scope boundary |
| 6 | Basic product-page link extraction | Attempt to collect visible document links from product pages | 3 | 8 | 0 | Basic extraction returned truncated paths because document URLs contained spaces and were embedded in option values | Initial link map; blocker record |
| 7 | Hidden compliance selector inspection | Inspect product-page dropdown option values for compliance documents | 4 | 18 | 5 | PFAS and other compliance PDFs were not exposed as ordinary visible links | Hidden compliance URL list |
| 8 | SDS variant review | Identify relevant SDS options and limit scope to Canada/USA English liquid/pen records | 3 | 15 | 10 | Multiple countries, languages, and product forms were present | SDS scope filter |
| 9 | Public PDF extraction setup | Check local PDF extraction capability and available libraries | 2 | 5 | 0 | `pdftotext` was unavailable; Python PDF libraries were available | Extraction path decision |
| 10 | Main PDF fetch and extraction | Extract text and metadata cues from 20 public PDFs | 2 | 10 | 0 | Three RoHS PDFs triggered console encoding errors | Extracted document evidence table |
| 11 | UTF-8 extraction rerun | Recover failed RoHS extraction output | 1 | 5 | 0 | Console encoding failure caused by special characters | Encoding blocker record |
| 12 | Product-page metadata retry | Attempt to summarize product-page metadata and document option counts | 2 | 8 | 0 | Rerun timed out on dynamic product pages; stopped to avoid wasting time | Timeout blocker record |
| 13 | Evidence triage | Review extracted evidence for PFAS declarations, SDS/TDS support, related declarations, and product-scope issues | 15 | 30 | 30 | PFAS declarations existed, but evidence basis and customer fit still required judgment | Evidence triage notes |
| 14 | Missing-evidence review | Identify documents not available publicly | 8 | 20 | 30 | No customer request, BOM, supplier raw-material declarations, or PFAS test reports were available | Missing documentation list |
| 15 | Cost and margin calculation | Convert measured work into delivery economics | 6 | 12 | 0 | Needed to separate measured discovery from client-ready packet production | Cost model |
| 16 | Time-study drafting | Write this validation memo from measured work | 22 | 35 | 10 | Needed to avoid drifting into a new methodology or packet deliverable | Engagement time study |
| 17 | Final QA pass | Verify that the study records tasks, blockers, artifacts, and economics | 5 | 12 | 5 | Needed to distinguish actual expert use from estimated expert review | Final QA notes |

## Time Totals

### Measured Work Performed In This Run

| Category | Minutes | Hours |
|---|---:|---:|
| AI-assisted work | 87 | 1.45 |
| Human analyst/operator work | 227 | 3.78 |
| Expert review actually performed | 0 | 0.00 |
| Expert review estimated during task scoring | 95 | 1.58 |

Total active elapsed time observed, excluding the connection interruption: approximately 3.8 to 4.3 hours.

The human and AI minutes do not add directly to elapsed time because several commands ran while the analyst reviewed prior output. The human hours are the better measure of delivery burden.

Prompt-required measured totals:

- Total elapsed time: approximately 3.8 to 4.3 active hours, excluding the connection interruption.
- Total human hours: 3.78 measured analyst/operator hours.
- Total expert hours: 0.00 actual expert hours used; 1.58 estimated expert-review hours represented in the task log.

### Estimated Client-Ready Delivery Time Today

This run did not produce a client-ready PFAS Evidence Packet. To deliver this as a bounded public-source packet today, Liberty Tree would still need final packet assembly, source index cleanup, expert QA, limitation language, and client-facing delivery notes.

| Workstream | Estimated Hours |
|---|---:|
| Measured public evidence discovery and triage | 3.8 |
| Packet assembly from measured evidence | 3.0 |
| Source index and evidence matrix cleanup | 1.0 |
| Client-facing executive summary and gap summary | 1.0 |
| Final analyst QA | 0.7 |
| Expert review of PFAS declarations, SDS limits, and missing-evidence framing | 2.5 |
| Total analyst/founder hours | 9.5 |
| Total expert hours | 2.5 |

Prompt-required delivery estimate:

- Total human hours for client-ready delivery today: 9.5 analyst/founder hours.
- Total expert hours for client-ready delivery today: 2.5 expert-review hours.

## Evidence Found

High-value evidence found:

- Product-specific PFAS declarations for 419D, 4223F, and 422B.
- Canada/USA English SDS documents for selected product forms.
- TDS documents for selected products.
- Product-specific RoHS declarations for selected products.
- SVHC/REACH family letters that explicitly list scoped products or related product groups.
- General EU POP and TSCA Section 6(h) PBT declarations.
- Product-family technical documents for conformal coatings.

High-value evidence location issue:

- Product-specific PFAS declarations were present but exposed in product-page compliance dropdown `option` values.
- A simple visible-link pass would have been at risk of missing them or returning only truncated paths.

## Evidence Not Found Publicly

The following evidence was not found in the public-source run:

- Customer PFAS request, questionnaire, or required declaration form
- Product BOM or formulation
- Raw material supplier declarations behind MG's declarations
- PFAS analytical test reports
- Total fluorine, TOF, EOF, AOF, or targeted PFAS testing data
- Testing method, detection limits, lab accreditation, or chain-of-custody records
- Customer-specific certificate language
- Portal-only supplier files
- Change history tying declaration dates to formulation changes
- Confirmation that all regional SDS variants and product forms should be treated as equivalent

These are not failures by the manufacturer. They are normal public-source limits. For a real client, they would become missing-documentation items or follow-up requests.

## Blockers Observed

| Blocker | Impact | Time Effect |
|---|---|---:|
| Public search did not immediately identify a clean nontrivial scenario | Slowed candidate selection | 10-15 minutes |
| Product pages were large and noisy | Increased manual review burden | 10-15 minutes |
| Basic link extraction returned truncated compliance paths | Required targeted hidden-selector inspection | 10 minutes |
| Compliance documents were embedded in dropdown option values | Could have caused missed high-value PFAS declarations | 15-20 minutes |
| SDS options varied by country, language, and product form | Required scope narrowing | 15 minutes |
| PDF extraction hit Unicode console errors on RoHS declarations | Required UTF-8 rerun | 5 minutes |
| Product-page metadata retry timed out | Forced decision to stop chasing low-value metadata | 8-12 minutes |
| No customer request was available | Prevented customer-specific conclusion or readiness language | Material limitation |
| No BOM, supplier declarations, or test reports were public | Prevented strong evidence-chain conclusions | Material limitation |

## Reusable Artifacts Produced

This study produced reusable internal artifacts, but not separate files:

- Three-product public-source scope definition
- Public product source map
- Hidden compliance URL discovery record
- Public PDF document inventory
- SDS regional/form scope filter
- Extraction blocker log
- Missing-evidence list
- Cost model for a bounded public-source packet
- Margin table for $7.5k to $20k pricing

## Estimated Delivery Cost

Cost assumptions for today's Liberty Tree delivery:

| Cost Input | Assumption |
|---|---:|
| Analyst/founder loaded rate | $125/hour |
| Expert reviewer loaded rate | $300/hour |
| Analyst/founder delivery hours | 9.5 |
| Expert review hours | 2.5 |
| AI/tool/rework allowance | $100 |
| Contingency for source cleanup and delivery friction | 20% |

Base labor and tool cost:

- Analyst/founder: 9.5 hours x $125 = $1,187.50
- Expert reviewer: 2.5 hours x $300 = $750.00
- AI/tool/rework allowance: $100.00
- Subtotal: $2,037.50
- 20% contingency: $407.50

Estimated delivery cost: **$2,445.00**

## Gross Margin By Price

| Price | Estimated Delivery Cost | Gross Profit | Gross Margin |
|---:|---:|---:|---:|
| $7,500 | $2,445 | $5,055 | 67.4% |
| $10,000 | $2,445 | $7,555 | 75.6% |
| $15,000 | $2,445 | $12,555 | 83.7% |
| $20,000 | $2,445 | $17,555 | 87.8% |

## Could Liberty Tree Profitably Deliver This Engagement Today?

Yes, but only under a tight scope.

Liberty Tree could profitably deliver this engagement today if the offer were limited to:

- Three scoped products
- Public-source evidence plus client-provided request language
- No legal opinion
- No regulatory certification
- No supplier outreach beyond a defined request list
- No testing interpretation beyond identifying missing test evidence
- No product-family conclusion beyond the specific products and documents reviewed

At $7,500, this is profitable on paper but operationally fragile. One extra product family, one customer-specific form, or one unresolved expert question could reduce the margin quickly. At $10,000, the engagement becomes much healthier. At $15,000 and above, the economics are strong for this exact scope.

The biggest risk is not PDF extraction. It is missed evidence and scope creep. The most valuable documents were present, but their discovery depended on inspecting dropdown option values. A naive workflow could have produced a weaker packet and still spent nearly the same amount of time.

## What Would Make Profitability Better?

Since this scoped engagement appears profitable today, the "if not profitable" condition does not apply.

The single automation that would improve profitability the most is:

> A public-source document discovery mapper that takes a product-page URL and returns a normalized document map from visible links, dropdown option values, form values, embedded paths, sitemap entries, and predictable compliance-document patterns.

For this run, that automation would likely have saved 45 to 75 analyst minutes and reduced the risk of missing the PFAS declarations. It would have been more valuable than faster PDF summarization because the extraction step was already cheap once URLs were known.

## Bottom Line

This time study supports the Liberty Tree thesis, but with a warning.

A bounded PFAS Evidence Packet can be profitable today. The economics work because AI and extraction tools make document processing cheap. The weak point is evidence discovery quality. If Liberty Tree misses hidden high-value documents, it can produce an inferior deliverable while still consuming most of the labor.

The profitable version of Liberty Tree is not a prettier report writer. It is a disciplined evidence discovery operation that finds the documents others miss, controls scope tightly, and uses expert review only where judgment actually matters.
