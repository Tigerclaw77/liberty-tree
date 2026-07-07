# PFAS Production Simulation: MG Chemicals Conductive Paint

Date: 2026-07-07
Simulation status: Public-source dry run
Selected company: MG Chemicals
Selected product scope: 842WBU Super Shield Silver Water Based Conductive Paint, with related conductive paint documents reviewed for scope-risk comparison.

This is not client work, a legal opinion, a regulatory conclusion, product certification, or a claim that the product is compliant with any law. The purpose was to simulate Liberty Tree production friction using public documents and identify why a fixed-price PFAS evidence engagement might fail.

## Scenario Chosen

MG Chemicals was selected because it has multiple publicly available SDS documents, product technical documents, compliance declarations, and public compliance pages. The selected product family was useful because it looked simple at first and then became operationally messy:

- The 842WBU product page was public and described a water-based silver conductive paint.
- Multiple SDS and TDS documents were available for related conductive paints.
- The product page exposed SDS and TDS documents visibly.
- Product-specific compliance declarations existed, including a PFAS declaration, but the URLs were hidden inside dropdown `option` values rather than normal links.
- The available evidence supported a useful packet, but did not support broad product-family conclusions without more collection and expert QA.

## Timing Caveat

Command-level timings below are measured from the dry run. Manual browsing, interpretation, and review times are observed estimates from the actual session. The most important timing result is not that PDF extraction was fast. It was. The important result is that source discovery and scope interpretation consumed most of the effort.

## 1. Timeline

| Step | Observed Time | What Happened | Output | Operational Finding |
|---|---:|---|---|---|
| Repo/context check | 4-5 min | Confirmed clean repo and reviewed existing production workflow assumptions. | Existing benchmark: standard after-AI workflow assumes 29-66 human hours for normal packet scope. | This dry run was much smaller than a normal packet and still created judgment issues. |
| Candidate search | 20-25 min | Tested several candidate directions before settling on MG Chemicals. Some likely candidates had poor discoverability or dynamic document systems. | MG Chemicals selected. | Finding a "simple" public manufacturer was not instant. A paid job should not be quoted before a document preflight. |
| Initial product lookup | 6-8 min | A guessed MG product URL returned a page-not-found. Site search and product navigation were needed. | 842WBU product page located. | Product URLs and titles are not stable enough to rely on naive search. |
| Product page review | 6 min | Product page showed product description, sizes, SDS options, TDS link, category documents, and "Available Compliance Documents." | Product page established scope and document categories. | The page looked easy until compliance document URLs had to be extracted. |
| SDS/TDS corpus discovery | 10-12 min | MG's SDS/TDS page was downloaded and searched for 842-related document links. | 842WBU, 842WB, 842AR, and 842ER SDS/TDS links identified. | The SDS/TDS page was large and multilingual; filtering the correct jurisdiction/product variant required manual judgment. |
| Initial PDF download | 3.9 sec machine time; 4-5 min operator time | Downloaded 10 SDS/TDS/product PDFs. | 10 PDFs, 3.2 MB total. | Once URLs were known, acquisition was fast. URL discovery was the bottleneck. |
| First PDF extraction | 3.6 sec before failure | Text extraction started but console output failed on a Unicode character. | Partial extraction. | Extraction pipelines need Unicode-safe output by default. |
| Corrected PDF extraction | 2.8 sec machine time | Reran extraction with UTF-8 output. | Extracted text from 10 PDFs. | Machine extraction was trivial; interpretation was not. |
| Compliance page review | 8-10 min | Reviewed MG compliance pages for REACH, RoHS, Proposition 65, ISO, and document request signals. | General compliance context and direct compliance PDF URLs. | General compliance pages are useful but not enough for product-specific PFAS evidence. |
| Hidden compliance URL recovery | 7-9 min | Inspected product HTML around "Available Compliance Documents." | Found product-specific PFAS, Prop 65, RoHS, EU POP, SVHC, and TSCA PBT PDFs. | A naive link crawler would have missed the most valuable evidence. |
| Compliance PDF download | 2.9 sec machine time; 3-4 min operator time | Downloaded six product/compliance declarations. | 6 additional compliance PDFs, 2.8 MB total. | Hidden dropdown parsing materially changed the evidence confidence. |
| Compliance extraction | 0.7 sec machine time | Extracted evidence from PFAS, RoHS, REACH/SVHC, POP, TSCA PBT, and Prop 65 declarations. | Key declaration language and caveats captured. | Compliance declarations introduced evidence-basis questions, not just answers. |
| Evidence synthesis | 25-35 min | Compared product page, SDS, TDS, category sheet, and declarations. | Evidence, gaps, uncertainty, and SME triggers. | Human judgment dominated the dry run. |
| Internal QA pass | 15-20 min | Checked for overclaiming, product-family leakage, missing documents, and source-index gaps. | Final operational conclusions. | Fixed-price risk depends on scope boundaries more than extraction time. |

Estimated elapsed dry-run time before writing this memo: 95-125 minutes.

Estimated elapsed time to turn this into a client-ready mini evidence packet for 842WBU only: 1.0-2.0 business days with expert review.

## Documents Collected

| Document | Type | Product Scope | Source | Download Time | Pages | Extracted Text | Key Evidence |
|---|---|---|---|---:|---:|---:|---|
| 842WBU product page | Product page | 842WBU | [MG product page](https://mgchemicals.com/products/conductive-paint/conductive-water-based-paints/emf-blocking-paint/) | 296 ms page fetch | n/a | n/a | Identified product as water-based silver conductive paint, listed sizes, SDS options, TDS, and compliance document categories. |
| sds-842wbu-l.pdf | SDS | 842WBU | [SDS](https://mgchemicals.com/downloads/msds/01%20English%20Can-USA%20SDS/sds-842wbu-l.pdf) | 376 ms | 11 | 19,423 chars | SDS includes a PFAS line stating no ingredients are listed; hazardous component includes silver powder. |
| sds-842wb-l.pdf | SDS | 842WB | [SDS](https://mgchemicals.com/downloads/msds/01%20English%20Can-USA%20SDS/sds-842wb-l.pdf) | 420 ms | 16 | 22,791 chars | Older SDS did not yield a PFAS-specific section in extraction; cannot infer PFAS position from 842WBU. |
| sds-842ar-l.pdf | SDS | 842AR | [SDS](https://mgchemicals.com/downloads/msds/01%20English%20Can-USA%20SDS/sds-842ar-l.pdf) | 307 ms | 14 | 24,252 chars | SDS includes PFAS line stating no ingredients are listed; solvent-based product differs materially from 842WBU. |
| sds-842er-part-a.pdf | SDS | 842ER Part A | [SDS](https://mgchemicals.com/downloads/msds/01%20English%20Can-USA%20SDS/sds-842er-part-a.pdf) | 319 ms | 14 | 24,339 chars | SDS includes PFAS line stating no ingredients are listed; epoxy part A has different chemistry. |
| sds-842er-part-b.pdf | SDS | 842ER Part B | [SDS](https://mgchemicals.com/downloads/msds/01%20English%20Can-USA%20SDS/sds-842er-part-b.pdf) | 298 ms | 14 | 22,986 chars | SDS includes PFAS line stating no ingredients are listed; hardener part is separate evidence object. |
| tds-842wbu-l.pdf | TDS | 842WBU | [TDS](https://mgchemicals.com/downloads/tds/tds-842wbu-l.pdf) | 353 ms | 4 | 5,410 chars | Low VOC, non-flammable, silver conductive paint properties; no PFAS evidence. |
| tds-842wb-l.pdf | TDS | 842WB | [TDS](https://mgchemicals.com/downloads/tds/tds-842wb-l.pdf) | 360 ms | 2 | 4,518 chars | Water-based conductive paint technical data; no PFAS evidence. |
| tds-842ar-l.pdf | TDS | 842AR | [TDS](https://mgchemicals.com/downloads/tds/tds-842ar-l.pdf) | 345 ms | 4 | 5,586 chars | Solvent-based silver conductive paint technical data; no PFAS evidence. |
| Water Based Conductive Paint catalogue | Product technical sheet | WBU series | [Category data sheet](https://mgchemicals.com/downloads/category-data-sheets/CDS-Water%20Based%20Conductive%20Paint.pdf) | 495 ms | 2 | 2,374 chars | WBU series includes nickel and silver conductive paints; low VOC/environmental marketing language; no PFAS evidence. |
| Application Guide - WB Conductive Paints | Application guide | WBU series | [Application guide](https://mgchemicals.com/downloads/application-guides/Application%20Guide-WB%20Conductive%20Paints.pdf) | 314 ms | 3 | 8,359 chars | Application process and use limitations; no PFAS evidence. |
| MG 842WBU PFAS Declaration | Product compliance declaration | 842WBU sizes | [PFAS declaration](https://mgchemicals.com/downloads/compliance/pfas/MG%20842WBU%20PFAS%20Declaration.pdf) | 593 ms | 3 | 3,845 chars | Certifies listed 842WBU products do not contain PFAS under multiple definitions; table lists PFAS reporting requirements as none. |
| MG 842WBU CalProp Free Declaration | Product compliance declaration | 842WBU sizes | [Prop 65 declaration](https://mgchemicals.com/downloads/compliance/prop65/MG%20842WBU%20CalProp%20Free%20Declaration.pdf) | 422 ms | 1 | 1,578 chars | States no warning required due to absence or exclusions; not PFAS-specific. |
| MG 842WBU RoHS Declaration | Product compliance declaration | 842WBU sizes | [RoHS declaration](https://mgchemicals.com/downloads/compliance/rohs/MG%20842WBU%20RoHS%20Declaration.pdf) | 494 ms | 2 | 3,784 chars | States RoHS status and says absence was proven internally by supplier ingredient documentation review; generally no trace testing. |
| MG EU POPs Declaration | General compliance declaration | All MG products | [EU POP declaration](https://mgchemicals.com/downloads/compliance/EU_POP/MG%20EU%20POPs%20Declaration.pdf) | 337 ms | 1 | 1,580 chars | States products do not contain POPs above thresholds; BOM and supplier declarations reviewed; no trace testing. |
| MG 84xWBU REACH Letter | Family compliance declaration | 841WBU/842WBU/843WBU | [REACH/SVHC letter](https://mgchemicals.com/downloads/compliance/SVHC/MG%2084xWBU%20reach-letter.pdf) | 319 ms | 2 | 4,354 chars | States listed WBU products have no SVHC content at reportable thresholds as of February 4, 2026 list update. |
| TSCA Section 6(h) Declaration Letter | General compliance declaration | MG products | [TSCA PBT declaration](https://mgchemicals.com/downloads/compliance/TSCA_PBT/TSCA%20Section%206(h)%20Declaration%20Ltr.pdf) | 306 ms | 1 | 1,787 chars | States five TSCA Section 6(h) PBT chemicals are not present; review based on supplier SDS and raw material/intermediate declarations. |
| MG RoHS3 letter | General compliance declaration | MG products except listed products | [General RoHS letter](https://mgchemicals.com/downloads/compliance/MG-RoHS3-letter.pdf) | 322 ms | 2 | 2,612 chars | General RoHS statement; useful for supplier documentation caveat, not PFAS. |
| MG REACH letter | General compliance declaration | MG products with listed exceptions | [General REACH letter](https://mgchemicals.com/downloads/compliance/MG-REACH-letter.pdf) | 284 ms | 5 | 12,263 chars | General REACH/SVHC product list; useful context but product-specific letter is better for 842WBU. |

PDF extraction total: 18 PDFs, 109 pages, 196,231 extracted characters, 2.353 seconds machine extraction time after UTF-8 correction.

## Documents Missing

| Missing Document | Why It Matters | Impact |
|---|---|---|
| Customer PFAS request or questionnaire | The packet cannot know which definition, threshold, jurisdiction, or representation the buyer needs answered. | High. Without this, Liberty Tree can organize evidence but cannot tailor the response. |
| Product BOM or formulation | SDS discloses hazardous/reportable ingredients, not full composition. | High. Public documents cannot independently confirm absence of undisclosed PFAS. |
| Raw material supplier declarations behind MG's declarations | Several declarations rely on supplier ingredient documentation or raw material declarations. | High. Evidence chain stops at MG's statement. |
| PFAS analytical test report | No targeted PFAS, total fluorine, TOF, EOF, AOF, or other lab report was collected. | High if buyer requires analytical proof. |
| Testing method, detection limits, and lab accreditation | Needed to evaluate any future test result. | High for expert QA. |
| Product-specific PFAS declarations for 842WB, 842AR, and 842ER | Related SDSs were collected, but the dry run did not recover equivalent product-specific PFAS declarations for each related product. | Medium-high. Prevents family-level conclusions. |
| Manufacturing site and supplier list | Needed for supplier inventory and follow-up. | Medium-high. Public documents do not show supply chain. |
| Lot/batch traceability | Needed if customer request concerns specific shipments or current inventory. | Medium. |
| Change history for PFAS declarations | Needed to know whether declarations changed after formula updates or regulatory list changes. | Medium. |
| Contractual language from customer/OEM | Needed to avoid answering the wrong question or over-certifying. | High. |

## Evidence Extracted

| Evidence | Source | Confidence | What It Supports | What It Does Not Support |
|---|---|---|---|---|
| 842WBU is a one-part, water-based silver conductive paint available in 55 mL, 850 mL, and 3.78 L sizes. | Product page and TDS | High | Product inventory and SKU mapping. | Any PFAS conclusion. |
| MG has a product-specific PFAS declaration for 842WBU dated May 1, 2026. | PFAS declaration | High that document exists; medium for compliance reliance | Product-specific evidence that MG states listed 842WBU SKUs do not contain PFAS and have no PFAS reporting requirements. | Independent verification, testing, or legal conclusion. |
| The PFAS declaration references OECD, TSCA Section 8(a)(7), and several state-style definitions. | PFAS declaration | Medium-high | Shows the supplier attempted to cover more than one PFAS definition. | Whether the definitions were applied correctly to every legal/customer context. |
| The 842WBU SDS includes a PFAS line stating no ingredients are listed. | 842WBU SDS | Medium | Secondary support that no PFAS ingredients are identified in the SDS regulatory listing section. | Full formulation absence or analytical non-detect. |
| 842AR and 842ER SDS files also include PFAS lines stating no ingredients are listed. | Related SDSs | Medium | Useful indicator for related products. | Product-specific declarations for those products. |
| 842WB SDS extraction did not find PFAS terms. | 842WB SDS | Low-medium | Shows an evidence gap or older SDS format. | Any PFAS position. |
| 842WBU RoHS declaration states absence was proven internally by supplier ingredient documentation review. | 842WBU RoHS declaration | High for RoHS evidence basis | Demonstrates evidence-basis language: supplier documents, not testing. | PFAS absence, except as a useful analogy for documentation reliance. |
| EU POP and TSCA PBT declarations rely on BOM/raw material declarations or supplier SDS/declarations and include trace-testing caveats. | EU POP and TSCA PBT declarations | Medium-high | Shows supplier evidence chain and caveat pattern. | PFAS-specific proof unless tied to PFAS-relevant POP substances by an expert. |
| Product technical sheets show low VOC and non-flammable marketing/technical properties. | TDS and category data sheet | High | Product profile and environmental/technical context. | PFAS status. |

## Evidence That Could Not Be Extracted

- Full formulation or exact non-hazardous ingredient composition.
- Raw material supplier declarations referenced by MG.
- Any PFAS test report, total fluorine result, analytical method, lab accreditation, detection limits, or chain of custody.
- A customer-ready answer for a specific jurisdiction or OEM questionnaire.
- Whether "PFAS reporting requirements: None" would satisfy a specific buyer, retailer, state, or TSCA request.
- Whether 842WB, 842AR, and 842ER have product-specific PFAS declarations equivalent to 842WBU.
- Whether a broad "conductive paint family" conclusion would be valid.
- Whether formulation changes occurred after the current declaration dates.

## AI Processing Time

| Task | Machine/AI Time | Human Time | Result |
|---|---:|---:|---|
| HTML fetch and link extraction | Seconds per page; under 5 seconds total command time for key fetches | 20-30 min to decide where to look | Found public pages and hidden dropdown URLs. |
| Initial PDF text extraction | 3.6 sec before console encoding failure | 5 min to notice and rerun | Partial failure due Unicode output. |
| Corrected PDF extraction | 2.353 sec for all 18 PDFs | 5-10 min to inspect outputs | Text extraction successful. |
| Keyword search for PFAS and compliance terms | Under 2 sec | 15-20 min to interpret | Found PFAS declaration and caveats. |
| Evidence synthesis | Not meaningfully separable from AI-assisted reasoning | 25-35 min | Produced evidence/gap findings. |

Brutal conclusion: AI made extraction cheap. It did not make source judgment cheap. The dry run did not fail because PDFs were hard to parse. It almost failed because the most important documents were hidden in a non-obvious HTML structure and because the scope could easily slide from one SKU to a family claim.

## Human Review Time Estimated

| Review Layer | Estimated Time | Why Needed |
|---|---:|---|
| Analyst QA for 842WBU only | 1.5-2.5 hours | Verify document dates, product/SKU mapping, extraction accuracy, and source citations. |
| Senior evidence reviewer | 1.0-2.0 hours | Confirm that claims are bounded and missing evidence is framed correctly. |
| PFAS/regulatory SME | 1.5-3.0 hours | Review PFAS declaration definitions, TSCA/state-definition language, and whether "reporting requirements none" is sufficient for likely customer asks. |
| Legal review, if buyer wants external representation language | 1.0-2.0 hours minimum | Required if the output approaches legal interpretation, certification, or contractual customer language. |
| Expanded family review across 842WB/842AR/842ER | Additional 4-8 hours | Related products are chemically different and do not share identical public evidence. |

## Human Intervention Log

| Intervention | Why It Was Needed | Risk If Missed |
|---|---|---|
| Switched from guessed product URL to site/product search | Initial product URL failed. | False assumption that the source was unavailable. |
| Used `curl.exe` when `Invoke-WebRequest` had connection problems | PowerShell web requests were less reliable against the site. | Lost time or incomplete collection. |
| Parsed SDS/TDS page manually for product-specific PDF paths | Global SDS/TDS page contained many languages and variants. | Wrong jurisdiction/language SDS could enter the packet. |
| Inspected product HTML around "Available Compliance Documents" | Compliance URLs were in dropdown `option` values, not standard links. | PFAS declaration would have been missed. |
| Reran PDF extraction with UTF-8 output | Console encoding failed on special characters. | Extraction pipeline could stop mid-run. |
| Separated 842WBU from related products | Related products had different chemistry and different document completeness. | Overbroad family-level PFAS conclusion. |
| Distinguished declaration evidence from test evidence | Public documents include declarations, not analytical test reports. | Buyer might mistake evidence organization for proof. |
| Flagged supplier-document reliance | Several declarations rely on supplier ingredient/raw material documentation. | Evidence chain would appear stronger than it is. |

## Bottlenecks

1. Source discovery, not document processing.
2. Hidden compliance documents in dropdown values.
3. Product-family boundary control.
4. Interpreting declaration basis and caveats.
5. Deciding whether SDS "none listed" language is meaningful for the buyer's PFAS question.
6. Missing raw supplier declarations and test reports.
7. Date/version alignment across documents.
8. Preventing product-specific evidence from being reused across related but chemically different SKUs.

## Failure Points

| Failure Point | Severity | What Could Go Wrong |
|---|---|---|
| Missing hidden PFAS declaration | Critical | Packet would report a major gap that is actually publicly documented. |
| Overstating the PFAS declaration | Critical | Packet could imply certification or legal compliance rather than supplier-provided evidence. |
| Treating 842WBU evidence as family evidence | High | Related products may not have equivalent declarations or may differ chemically. |
| Treating SDS as full composition | High | SDS only discloses required/hazardous information; absence from SDS is not absence from formulation. |
| Ignoring evidence basis | High | Declarations based on supplier review are weaker than test reports but stronger than no evidence. |
| Quoting general RoHS/REACH statements as PFAS evidence | Medium-high | Irrelevant evidence could inflate confidence. |
| Missing document dates | Medium | Old SDS and newer declarations may not align after formulation changes. |
| Encoding/extraction failure | Medium | Pipeline could silently skip documents if not monitored. |
| No customer request | High | The packet might answer a generic PFAS question while the buyer needs a specific state/OEM form. |

## Estimated Client-Facing Hours

For a narrow 842WBU-only engagement, assuming the client provides the actual customer request:

- Intake and scope confirmation: 0.75-1.25 hours.
- Document request/status communication: 0.5-1.0 hour.
- Findings review call: 1.0 hour.
- Final delivery questions: 0.5-1.0 hour.

Estimated client-facing total: 2.75-4.25 hours.

If the client wants the broader conductive paint family or a customer-ready declaration response, client-facing time likely rises to 5-8 hours because scope and wording will need more negotiation.

## Estimated Internal Hours

| Scope | Internal Production | Expert/SME QA | Total Internal Hours | Notes |
|---|---:|---:|---:|---|
| 842WBU only, public docs plus client request | 5-7 hours | 2-4 hours | 7-11 hours | Feasible as a small fixed-fee diagnostic or mini packet. |
| 842WBU plus supplier follow-up for underlying raw material declarations | 8-12 hours | 3-5 hours | 11-17 hours | Stronger evidence but dependent on supplier response. |
| Conductive paint family including 842WB, 842AR, 842ER | 12-20 hours | 5-8 hours | 17-28 hours | Fixed price risky without preflight; products are not interchangeable. |
| Customer-ready legal/regulatory response | 10-18 hours Liberty Tree plus counsel | 2-6 hours counsel/SME | 12-24+ hours | Should be separately scoped. |

## Confidence In Fixed-Price Delivery

| Engagement Shape | Confidence | Score |
|---|---|---:|
| 842WBU evidence organization only, no legal conclusion, no testing, customer request provided | Moderate-high | 7/10 |
| 842WBU PFAS readiness packet with expert review and missing-document register | Moderate | 6.5/10 |
| Conductive paint family packet across related products | Low-moderate | 4.5/10 |
| Any representation that the product is legally compliant across PFAS laws | Very low and out of scope | 2/10 |

Fixed-price delivery is realistic only after a paid or internal preflight confirms:

- Exact product/SKU scope.
- Customer request language.
- Product-specific declarations are available.
- Whether test reports are required.
- Whether Liberty Tree is organizing evidence or drafting a response for signature.

## Decisions Requiring Subject-Matter Expertise

- Whether the MG PFAS declaration language covers the buyer's applicable PFAS definition.
- Whether "PFAS reporting requirements: None" is sufficient for the requested customer/regulatory use.
- Whether SDS "none of the ingredients is listed" has value for the specific PFAS framework.
- Whether supplier declarations are sufficient without analytical testing.
- Whether total fluorine or targeted PFAS testing should be recommended.
- Whether related products can be grouped or must be handled separately.
- Whether the declaration date and SDS revision dates are current enough for the use case.
- Whether any EU POP, REACH/SVHC, TSCA PBT, or Prop 65 statement is relevant to the PFAS request rather than distracting context.

## Recommended Workflow Changes

These are operational changes, not new frameworks.

1. Add a mandatory 30-60 minute document preflight before quoting any fixed-price packet.
2. Require exact customer request language before drafting findings.
3. Make crawlers parse `select option value` URLs, not just `a href` links.
4. Track evidence by SKU and product form; do not allow family-level conclusions without product-specific evidence.
5. Add an evidence-basis field for every declaration: supplier review, BOM review, SDS review, testing, unknown.
6. Treat declaration, SDS, and test report as different evidence classes with different confidence.
7. Add an automatic date/version alignment check across SDS, TDS, and declarations.
8. Add extraction failover for Unicode and multilingual PDFs.
9. Add a "no customer request provided" warning to every simulation or packet.
10. Add SME triggers for PFAS definitions, test necessity, and any customer-ready representation.

## What Would Have Surprised Us Most?

The biggest surprise was that the most valuable PFAS evidence existed, but was easy to miss.

The 842WBU PFAS declaration was not exposed as an ordinary visible PDF link in the same way as the TDS links. It was buried inside a compliance dropdown as an `option value`. A naive automation pass would likely have concluded that the product had SDS/TDS support but no product-specific PFAS declaration. That would have turned a relatively strong evidence item into a false gap.

The second surprise was more uncomfortable: once the PFAS declaration was found, the work did not become simple. It became a QA problem. Liberty Tree would still need to decide whether the declaration applies only to 842WBU, whether related products need separate declarations, whether the customer's PFAS definition matches the declaration, whether testing is required, and whether supplier-document reliance is acceptable.

If Liberty Tree received this engagement tomorrow, the risk would not be document extraction. The risk would be overconfidence after extraction.
