# Liberty Tree Internal Evidence Discovery Playbook

Date: 2026-07-07  
Status: Internal operational manual  
Audience: Liberty Tree analysts, reviewers, and approved expert reviewers  
Use: Before any PFAS Evidence Packet is assembled

## Internal Use Standard

This playbook defines how Liberty Tree conducts evidence discovery for PFAS Evidence Packets. It is an internal operating manual, not a client-facing deliverable, legal opinion, regulatory certification, or software specification.

The analyst's job is not to write the packet first. The analyst's job is to investigate the evidence environment until Liberty Tree can say, with documented limits, that discovery is substantially complete for the agreed scope.

No packet should be assembled until the analyst has produced:

- Discovery log
- Source map
- Document inventory
- Evidence inventory
- Missing evidence register
- Conflict and revision notes
- Escalation list
- Packet readiness checklist

## Operating Rule

Evidence discovery is an investigation. Treat every product page, SDS library, dropdown, archive, distributor copy, portal export, and document filename as a possible clue. The packet is only the report of the investigation.

## 1. Discovery Objectives

### 1.1 What Evidence Are We Trying To Prove Exists?

For every scoped product, SKU, product family, component, material, or supplier relationship, the analyst is trying to locate and verify whether the following evidence exists:

| Evidence Type | Why It Matters | Preferred Source |
|---|---|---|
| Product-specific PFAS declaration | Direct manufacturer or supplier representation for the scoped product | Manufacturer website, supplier portal, client-provided supplier file |
| PFAS test report | Analytical support, if the customer request requires testing or if declarations are insufficient | Accredited lab report provided by client, supplier, manufacturer, or customer |
| Current SDS | Product identity, hazards, manufacturer contact, regulatory listing language, and revision date | Manufacturer SDS library or product page |
| Technical data sheet | Product identity, material type, use case, product family, and product attributes | Manufacturer product page or TDS library |
| Product page | Confirms current product name, SKU, packaging sizes, related documents, and document categories | Manufacturer website |
| Environmental or regulatory declarations | May reveal product-specific compliance documents and supplier evidence-basis language | Manufacturer compliance library, product page, portal |
| Supplier declaration | Evidence chain behind manufacturer or client position | Supplier correspondence, portal, client file |
| Customer request | Defines the question being answered and prevents generic PFAS analysis | Client-provided request, portal screenshot, customer questionnaire |
| Product inventory | Defines what is in scope and prevents product-family leakage | Client list, manufacturer page, SKU catalog |
| Component or material list | Needed when the product is a kit, assembly, textile stack, coating system, or multi-part formulation | Client file, BOM, supplier documents |
| Revision history | Identifies stale or superseded documents | Current and archived documents, metadata, version notes |
| Evidence basis | Explains whether a claim is based on formulation review, supplier declarations, SDS review, testing, or unknown basis | Declaration text, supplier letter, test report, client file |
| Government or regulatory source | Defines official terms, deadlines, lists, and context; does not prove product status | EPA, state agency, FDA, eCFR, official state law pages |

The analyst should treat product-specific PFAS declarations, test reports, and customer requests as high-value evidence. These are the evidence types most likely to change the packet's confidence and commercial usefulness.

### 1.2 What Evidence Are We Trying To Prove Does Not Exist?

Liberty Tree cannot prove absolute nonexistence across the internet, private portals, or supplier systems. The internal standard is narrower:

> The analyst must document that a specific evidence type was not found after completing the required discovery sequence for the agreed scope.

The analyst is trying to establish defensible negative discovery for:

- No public manufacturer PFAS declaration located for the exact product or SKU
- No PFAS analytical test report located in provided or public materials
- No current manufacturer SDS located
- No current manufacturer TDS located
- No product-specific evidence located, only product-family evidence
- No evidence basis stated for a declaration
- No revision date or issue date found
- No customer request provided
- No supplier declaration provided
- No component-level evidence provided for kits or assemblies
- No underlying raw material declarations provided
- No evidence that related SKUs are covered by the same declaration
- No authoritative regulatory source located for a cited requirement
- No current version found to replace an archived or distributor-hosted copy

Negative discovery must be written as a discovery finding, not as a regulatory conclusion.

Correct internal wording:

> No product-specific PFAS declaration was located during manufacturer-site, product-page, document-library, archive, and distributor discovery.

Incorrect internal wording:

> No PFAS declaration exists.

### 1.3 What Evidence Commonly Appears Under Unexpected Names?

PFAS-relevant evidence often does not say "PFAS" in the file title. Search for these alternate names and categories:

| Unexpected Name | Why It May Matter |
|---|---|
| Certificate of Compliance or Certificate of Conformance | May contain product-specific restricted substance language |
| Declaration of Conformity | Often used for regulatory or customer-facing declarations |
| Product compliance declaration | May bundle PFAS with RoHS, REACH, POPs, Prop 65, or TSCA statements |
| Environmental compliance statement | May include material restrictions or supplier evidence basis |
| Material declaration | May identify ingredients, substances, or restricted substance status |
| Chemical substance declaration | May include PFAS, SVHC, RoHS, TSCA, or customer restricted substances |
| Restricted substance declaration | May contain brand or OEM requirements |
| RSL or MRSL documentation | Common in apparel, footwear, textiles, coatings, and chemical management |
| No intentionally added PFAS statement | Often more precise than "PFAS-free" |
| PFAS-free statement | Useful only if scope, definition, and basis are clear |
| TSCA reporting statement | May relate to PFAS reporting or other TSCA chemical restrictions |
| Prop 65 declaration | Not PFAS-specific by default, but may expose compliance document paths |
| REACH/SVHC letter | Not PFAS-specific by default, but often shares declaration structure and evidence basis |
| RoHS declaration | Not PFAS-specific by default, but often reveals product-specific compliance files |
| POPs declaration | May overlap with some fluorinated substances, but requires expert review |
| Product stewardship letter | May contain supplier or regulatory evidence summaries |
| Sustainability disclosure | May lead to phaseout statements or material claims |
| Customer quality document | May include declarations not exposed publicly |
| Vendor compliance form | May contain customer-specific evidence requirements |

Search non-PFAS compliance categories because they often reveal the manufacturer's document architecture. A RoHS declaration path can expose the naming pattern for a hidden PFAS declaration.

### 1.4 Evidence Classes

Every artifact must be classified before packet drafting:

| Class | Definition | Packet Use |
|---|---|---|
| Direct PFAS evidence | Product-specific PFAS declaration, PFAS test report, supplier PFAS statement, or customer PFAS request | Core evidence |
| Supporting product identity | Product page, SDS, TDS, catalog, SKU table, component list | Scope control |
| Related regulatory evidence | REACH, RoHS, POPs, Prop 65, TSCA PBT, RSL, or other declarations | Context or source-path clue unless directly PFAS-relevant |
| Evidence-basis clue | Statement describing supplier declarations, BOM review, SDS review, or testing basis | Confidence and gap assessment |
| Lead-only artifact | Search snippet, forum post, distributor title, broken link, archived index | Discovery lead only |
| Negative discovery artifact | Logged search showing expected evidence not found | Missing documentation register |

## 2. Discovery Sequence

The sequence below is mandatory unless the engagement scope expressly excludes a step. If a step is skipped, the reason must be recorded in the discovery log.

### 2.1 Standardized Search Order

| Step | Source Category | Purpose | Expected Artifacts | Common Mistakes | Escalation Trigger |
|---:|---|---|---|---|---|
| 1 | Client scope and customer request | Define the exact question before searching | Customer email, questionnaire, portal screenshot, product/SKU list, deadline | Starting with generic PFAS research; missing customer definition or required format | Customer request absent, ambiguous, or asks Liberty Tree to certify/sign |
| 2 | Product identity normalization | Build search terms and prevent SKU drift | Product names, SKUs, aliases, kit components, legacy names, region variants | Treating family names as exact product scope; ignoring packaging sizes or part numbers | Product identity cannot be tied to a specific item |
| 3 | Manufacturer website home and search | Establish authoritative source domain and document architecture | Manufacturer domain, search results, document centers, compliance pages | Using search engines before understanding manufacturer site structure | Manufacturer site unavailable, redirects to regional domains, or blocks access |
| 4 | Product pages | Locate current product context and visible document links | Product page URL, SDS/TDS links, downloads, compliance selectors, related products | Stopping after visible links; ignoring hidden dropdowns or tabs | Product page has compliance/document widgets or dynamic selectors |
| 5 | Technical documentation | Collect product identity and technical scope | TDS, catalog sheet, application guide, product brochure, spec sheet | Treating TDS as compliance evidence; using related-product documents without scope check | TDS conflicts with product page or covers multiple products |
| 6 | SDS discovery | Collect current manufacturer SDS for exact region and product | SDS PDFs, revision dates, product identifiers, manufacturer contacts | Using wrong jurisdiction/language; treating SDS absence as formulation absence | SDS is missing, obsolete, multilingual, unreadable, or mismatched to SKU |
| 7 | Environmental declarations | Search broad environmental/compliance categories | Environmental statements, product stewardship letters, sustainability disclosures | Assuming broad company statement applies to the product | Statement is broad but no product-specific inclusion is clear |
| 8 | Regulatory declarations | Locate product-specific restricted substance documents | PFAS, RoHS, REACH/SVHC, POPs, Prop 65, TSCA, RSL declarations | Treating non-PFAS declarations as PFAS evidence; missing shared filename patterns | PFAS document absent but related declarations exist |
| 9 | Hidden page evidence | Inspect non-obvious document paths | Dropdown option URLs, embedded document values, scripts, data attributes, form targets | Crawling only `a href` links; missing document selectors | Any compliance documents are visible in UI but not in normal links |
| 10 | Manufacturer document libraries | Search global SDS/TDS/compliance libraries | Library search results, PDF lists, multilingual variants, old/current versions | Downloading every similar file without SKU filtering | Library returns multiple conflicting documents |
| 11 | Site-restricted web search | Find unlinked or poorly indexed manufacturer documents | Search results limited to manufacturer domain, PDF URLs, cached titles | Relying on snippets; ignoring date and source path | Search reveals documents not reachable from product page |
| 12 | Sitemap and public index review | Find robots-visible or sitemap-listed PDFs | Sitemap entries, document directories, public PDF indexes | Assuming absence from navigation means absence from site | Sitemap shows document paths not found by product navigation |
| 13 | Archived documents | Identify stale versions, old paths, or discontinued product evidence | Archived pages, old PDFs, revision history, discontinued product pages | Using archive as current evidence; ignoring supersession | Archived document conflicts with current source or fills a key gap |
| 14 | Distributor mirrors | Locate copies that reveal missing manufacturer files | Distributor SDS/TDS/declarations, manufacturer filenames, revision dates | Treating distributor copy as primary without limitation | Distributor copy is newer, more specific, or only available source |
| 15 | Customer portals | Review authorized customer or vendor systems | Portal exports, questionnaire fields, requested declarations, required definitions | Accessing without authorization; copying portal language without source context | Portal request defines a certification, legal attestation, or test requirement |
| 16 | Government databases and official sources | Define regulatory terms and official context | EPA/state/FDA/eCFR pages, official lists, guidance, statutory references | Using government source as product evidence; citing outdated unofficial summaries | Interpretation affects packet language or customer response |
| 17 | Supplier correspondence | Capture private evidence chain | Supplier declarations, emails, raw material statements, test reports, refusal/nonresponse | Treating informal email as equivalent to formal declaration | Supplier statement is ambiguous, unsigned, conflicts, or includes legal terms |
| 18 | Conflict and gap review | Decide whether discovery is ready for packet assembly | Conflict log, missing evidence register, confidence scores, escalation list | Resolving conflicts silently; hiding missing evidence | Any material evidence item is Low/Unknown or conflicts with another source |

### 2.2 Required Discovery Log Fields

For every search step, the analyst must record:

- Date and time searched
- Analyst initials
- Source category
- Source URL, portal location, or file path
- Search terms used
- Product identifiers used
- Documents found
- Documents expected but not found
- Hidden evidence checked
- Relevant excerpts or page notes
- Confidence impact
- Follow-up action

If the reviewer cannot reproduce the discovery path, the discovery log is incomplete.

### 2.3 Stop Conditions

The analyst may stop discovery and move to packet assembly only when:

- Product scope is stable
- Customer request or scope limitation is documented
- Manufacturer source discovery is complete
- Hidden evidence techniques have been applied where relevant
- Distributor and archive checks have been used when direct evidence is incomplete
- Missing evidence has been logged
- Conflicts have been escalated or explicitly bounded
- Confidence scores have been assigned
- The packet readiness checklist passes

## 3. Hidden Evidence Techniques

Hidden evidence techniques are manual investigation methods. They do not authorize bypassing access controls, scraping private systems without permission, or ignoring website terms. Use only public sources, client-provided materials, or authorized portal access.

### 3.1 Dropdown Option URLs

Purpose: Find documents exposed in page selectors but not normal links.

Method:

- Open product pages with document or compliance dropdowns.
- Inspect the visible option names and available document categories.
- Review the page source or browser inspector for option values, form values, or embedded document paths.
- Record the exact path where each value was found.
- Confirm the file opens and matches the product scope.

Common finds:

- PFAS declarations
- Prop 65 letters
- RoHS declarations
- REACH/SVHC letters
- TSCA PBT statements
- POPs declarations

Red flags:

- Dropdown document title is product-specific but file path is general.
- File opens but covers a family or company-wide scope.
- UI lists a document category but the path is blank or broken.

### 3.2 Robots-Visible PDFs

Purpose: Find public PDFs that are discoverable to search engines but not linked from product pages.

Method:

- Use manufacturer-domain searches for product ID plus document terms.
- Search for product ID plus PDF-oriented terms such as SDS, TDS, PFAS, declaration, compliance, REACH, RoHS, Prop 65, TSCA, or certificate.
- Compare search results against manufacturer navigation.
- Treat snippets as leads only.
- Open and verify every document before recording it as evidence.

Red flags:

- PDF indexed by search engine but not present in current manufacturer navigation.
- Search result date or title conflicts with PDF issue date.
- Search engine cache shows an old file that the manufacturer replaced.

### 3.3 Sitemap Discovery

Purpose: Find document paths exposed in public sitemaps or site indexes.

Method:

- Check public sitemap locations and document-index pages where available.
- Look for file paths containing compliance, downloads, SDS, MSDS, TDS, declaration, regulatory, or product IDs.
- Compare sitemap entries against product-page links.
- Record whether the sitemap found any documents not visible through normal navigation.

Red flags:

- Sitemap lists multiple language or regional variants.
- Sitemap includes old files not linked from current product pages.
- Sitemap exposes document categories that imply missing product-specific files.

### 3.4 Predictable Filename Patterns

Purpose: Use known document naming conventions to find sibling documents.

Method:

- Identify filename patterns from known documents.
- Compare paths across document categories.
- Look for product code reuse in PFAS, RoHS, REACH, Prop 65, SDS, and TDS folders.
- Search likely filenames through public search or manufacturer site search.
- Verify files directly before treating them as evidence.

Example pattern logic:

- If `ProductCode RoHS Declaration.pdf` exists, search for `ProductCode PFAS Declaration.pdf`.
- If `/downloads/compliance/rohs/` exists, check whether compliance documents also use PFAS, SVHC, POP, Prop65, or TSCA folders.

Do not invent files. A predictable filename is a lead until a real source opens and is verified.

### 3.5 Alternate Product Codes

Purpose: Prevent missed evidence caused by product naming variation.

Method:

- Search product code with and without spaces, hyphens, suffixes, package sizes, and region prefixes.
- Search old and new product names.
- Search component names for kits or multi-part products.
- Search parent-family names only as a lead.
- Build a product identity table before collecting evidence.

Red flags:

- Product family code returns documents for chemically different products.
- Packaging-size code is mistaken for formulation code.
- A regional suffix changes the SDS or declaration.

### 3.6 Document Directories

Purpose: Identify document libraries that are not obvious from product pages.

Method:

- From known files, infer the public document category path.
- Review manufacturer pages that list SDS, MSDS, TDS, compliance, regulatory, or downloads libraries.
- Search within those libraries using exact product identifiers.
- Record category paths even when no product-specific document is found.

Red flags:

- A document directory includes multiple jurisdictions.
- A global library includes obsolete and current documents together.
- A document category exists for related products but not the scoped product.

### 3.7 Archived Revisions

Purpose: Identify whether documents changed, disappeared, or were superseded.

Method:

- Use archives only after current-source discovery.
- Check archived product pages for old document links, old product names, discontinued variants, and revision dates.
- Compare archived files to current manufacturer files.
- Record archive findings as historical unless the manufacturer confirms current status.

Red flags:

- Archived declaration is stronger or weaker than current declaration.
- Product was reformulated, renamed, discontinued, or moved to a new domain.
- Current page omits a document that older page exposed.

### 3.8 Language-Specific Versions

Purpose: Avoid using the wrong regional document and catch documents available only in another language.

Method:

- Identify the target jurisdiction or customer region.
- Compare document language, region, and regulatory references.
- If only non-English evidence is found, record language and extraction limitations.
- Request translation or expert review before relying on critical language.

Red flags:

- English SDS is old but non-English SDS is current, or vice versa.
- Regional compliance declaration covers a different legal framework.
- Translation uncertainty affects a material statement.

### 3.9 Distributor Mirrors

Purpose: Use distributor copies as leads to recover manufacturer-controlled evidence.

Method:

- Search distributor pages for exact SKU and document type.
- Record distributor file title, date, manufacturer name, and filename.
- Use the filename to search manufacturer sources.
- Compare distributor revision dates against manufacturer documents.
- Classify distributor copies as lower confidence unless no better source exists.

Red flags:

- Distributor copy is the only source for a high-value declaration.
- Distributor file is older than manufacturer SDS or product page.
- Distributor title claims product-specific scope but PDF text is generic.

### 3.10 Evidence-Basis Mining

Purpose: Understand how a declaration was supported.

Method:

- Search declarations for basis phrases such as supplier declarations, BOM review, formulation review, SDS review, raw material declarations, no trace testing, analytical testing, internal review, or best knowledge.
- Record the basis exactly in the evidence inventory.
- Separate declaration confidence from testing confidence.

Red flags:

- Declaration says "compliant" but does not state basis.
- Declaration relies on supplier information that is not provided.
- Test report exists but analyte list or detection limits do not match the customer request.

## 4. Evidence Confidence Rubric

Confidence scoring is objective evidence scoring. It is not a compliance conclusion.

Each material evidence item receives a 100-point score and a confidence level. Apply hard caps after scoring.

### 4.1 Scoring Dimensions

| Dimension | Points | Scoring Rule |
|---|---:|---|
| Source authority | 20 | 20 direct manufacturer/supplier/authorized portal; 15 customer-provided source file; 10 distributor copy; 5 third-party database; 0 snippet or unsupported AI output |
| Product specificity | 20 | 20 exact SKU/product; 15 exact product family with scoped product listed; 10 broad family without exact SKU; 5 company-wide; 0 unrelated or unclear |
| Currency | 15 | 15 current issue/revision date and no supersession; 10 dated but age acceptable; 5 old or uncertain; 0 obsolete or superseded |
| Evidence basis | 15 | 15 test report or clearly stated formulation/BOM/supplier evidence basis; 10 declaration with partial basis; 5 assertion with no basis; 0 basis contradicted or unknown for material claim |
| Traceability | 10 | 10 stable URL/access path and retrieval date; 7 client-provided file with origin noted; 4 indirect path; 0 no reproducible source |
| Relevance to control question | 10 | 10 directly answers request; 7 materially supports request; 4 contextual only; 0 irrelevant |
| Conflict status | 5 | 5 no conflicts; 3 minor unresolved ambiguity; 0 material conflict |
| Extraction and review quality | 5 | 5 complete readable extraction and human review; 3 partial extraction; 0 unreadable or unreviewed |

### 4.2 Confidence Bands

| Score | Level | Meaning |
|---:|---|---|
| 85-100 | High | Strong source, current, product-specific, traceable, and not materially conflicted |
| 65-84 | Medium | Useful evidence with a clear limitation in scope, basis, date, or completeness |
| 35-64 | Low | Weak, indirect, stale, broad, or materially incomplete evidence |
| 0-34 | Unknown | Evidence cannot be verified, tied to scope, or used without major caveats |

### 4.3 Hard Caps

Apply these caps after the numeric score:

| Condition | Maximum Confidence |
|---|---|
| Search snippet only | Unknown |
| AI-generated statement without opened source | Unknown |
| No product scope stated | Low |
| Product family evidence without exact scoped product listed | Medium |
| Distributor copy with no manufacturer confirmation | Medium |
| Archived document with no current confirmation | Low |
| SDS alone used to support PFAS absence | Medium |
| Declaration without stated evidence basis | Medium |
| Material conflict between current documents | Low until resolved |
| No retrieval path or source origin | Low |
| Customer request absent | Evidence item may score normally, but packet readiness is Conditional at best |
| Legal, certification, or testing conclusion required | Escalation required before client-facing use |

### 4.4 Negative Discovery Confidence

Negative discovery also receives a confidence level:

| Level | Standard |
|---|---|
| High negative discovery | Required search sequence completed, source categories logged, hidden evidence checks applied, and no expected document located |
| Medium negative discovery | Major source categories searched, but at least one relevant path was unavailable, ambiguous, or out of scope |
| Low negative discovery | Limited search only, source structure unclear, or key sources inaccessible |
| Unknown negative discovery | No meaningful search completed, or analyst cannot reproduce what was searched |

Use negative discovery to support missing-document registers, not compliance conclusions.

## 5. Packet Readiness Checklist

Liberty Tree can internally say "evidence discovery is substantially complete" only when every gate below is either passed or explicitly marked as a limitation approved by a senior reviewer.

### 5.1 Readiness Gates

| Gate | Pass Standard |
|---|---|
| Scope gate | Exact product, SKU, component, supplier, jurisdiction, and customer request are documented or limitation is approved |
| Source map gate | Manufacturer, product, SDS/TDS, compliance, distributor, archive, portal, and government source categories are mapped |
| Manufacturer gate | Product page, document libraries, compliance pages, and site-restricted searches are complete |
| Hidden evidence gate | Dropdowns, document widgets, embedded paths, sitemaps, filename patterns, and alternate product codes were checked where applicable |
| Evidence inventory gate | Every collected artifact has source, retrieval date, document type, product scope, issue/revision date, and confidence score |
| Missing evidence gate | Expected but unfound documents are listed with search paths attempted |
| Conflict gate | Revision conflicts, product-scope conflicts, and evidence-basis conflicts are logged and escalated |
| Basis gate | Declarations identify basis when available; unknown basis is recorded as a gap |
| Product-family gate | No product-family evidence is applied to a specific SKU unless explicit inclusion is documented |
| Customer-question gate | Evidence is mapped to the actual customer request; if no request exists, packet language is limited |
| SME gate | PFAS definitions, test requirements, legal/certification wording, and material conflicts have been escalated |
| Traceability gate | Reviewer can reproduce how each high-value document was found |
| Overclaiming gate | No internal notes or draft packet language convert evidence into certification or legal conclusion |

### 5.2 Readiness Status

| Status | Meaning | Allowed Next Step |
|---|---|---|
| Ready | All gates pass and no unresolved material escalation remains | Assemble packet |
| Conditional | Discovery is strong, but one or more limitations must be disclosed | Assemble packet with limitation language approved by reviewer |
| Not Ready | Material evidence path, conflict, or scope question remains unresolved | Continue discovery or escalate |

### 5.3 Required Internal Statement

Before packet assembly, the analyst must write a short readiness statement:

> Discovery status: [Ready/Conditional/Not Ready]. Evidence discovery is substantially complete for [product/SKU/scope] based on completed searches of [source categories]. Remaining limitations are [limitations]. Material escalations are [resolved/unresolved].

If the statement cannot be written clearly, discovery is not ready.

## 6. Competitive Analysis

This section identifies what parts of the playbook can differentiate Liberty Tree operationally. It is not marketing copy.

### 6.1 Differentiation Against Environmental Consultants

Environmental consultants often have strong technical and regulatory expertise, but many are built for broader EHS programs, site work, audits, remediation, product stewardship, or regulatory interpretation. Liberty Tree can differentiate in the narrow evidence-discovery layer.

Potentially differentiating playbook elements:

- Mandatory hidden evidence search before packet assembly
- Negative discovery logging instead of casual "not found" statements
- SKU-level source mapping
- Evidence-basis classification
- Revision and conflict preservation
- Fast preflight before fixed-price scope
- Productized source index and missing-document register
- Reproducible discovery path for expert QA

Where consultants may still be stronger:

- Legal/regulatory interpretation through established teams
- Toxicology, fate and transport, remediation, and testing strategy
- Enterprise trust and procurement acceptance
- Multi-jurisdiction advisory work

Internal conclusion: Liberty Tree should not try to out-consult large firms. It should outperform them on focused evidence recall, source traceability, and speed for document-heavy product questions.

### 6.2 Differentiation Against Testing Labs

Testing labs produce analytical data. They do not usually reconstruct the full evidence environment around the product, customer request, supplier declarations, SDSs, TDSs, old revisions, and hidden public declarations.

Potentially differentiating playbook elements:

- Pre-test evidence discovery to determine whether testing is needed
- Test report indexing against products, SKUs, materials, and customer requests
- Distinction between declaration evidence and analytical evidence
- Missing evidence identification before lab spend
- Supplier declaration and SDS comparison
- Evidence-basis review for claims based on supplier documents rather than testing

Where labs may still be stronger:

- Analytical method selection
- Sample handling, chain of custody, and lab QA
- Detection limits, analyte lists, and accredited testing interpretation
- Client trust where test results are the decisive evidence

Internal conclusion: Liberty Tree should complement labs by organizing the evidence environment before and after testing. It should not imply that documentation discovery replaces analytical testing when testing is required.

### 6.3 Differentiation Against Generic AI Summarization

Generic AI summarization can read documents quickly once documents are provided. It is weaker when the problem is finding the right documents, identifying hidden paths, preserving source authority, and knowing when a document does not answer the question.

Potentially differentiating playbook elements:

- Investigation before summarization
- Source hierarchy and hard confidence caps
- Hidden dropdown, sitemap, archive, distributor, and filename-pattern checks
- Negative discovery confidence levels
- Expert escalation triggers
- Product-family leakage controls
- Human-verifiable source path for every high-value item
- Continuous improvement from every missed-evidence incident

Where generic AI may still be strong:

- First-pass extraction
- Summarization of provided documents
- Drafting tables and source indexes
- Search term expansion

Internal conclusion: Liberty Tree should use AI as an investigative accelerator, but its advantage must come from disciplined source discovery, not polished summaries.

## 7. Continuous Improvement

Every engagement must improve the next investigation. Evidence discovery becomes durable only if Liberty Tree captures patterns, errors, and source-path knowledge.

### 7.1 Engagement Closeout Review

Within five business days after delivery or internal simulation completion, the analyst and reviewer should complete a closeout review covering:

- What high-value evidence was found
- What high-value evidence was nearly missed
- Which source paths worked
- Which source paths failed
- Which unexpected filenames or document categories appeared
- Which search terms produced useful results
- Which documents conflicted
- Which evidence-basis patterns appeared
- Which missing documents mattered commercially
- Which escalation triggers were correct
- Which escalation triggers were missing

### 7.2 Missed Evidence Incident Log

Any evidence found after packet assembly, reviewer QA, or client delivery must be logged as a missed evidence incident.

Record:

- Product and supplier
- Evidence type
- Where it was ultimately found
- Why it was missed
- Which playbook step should have found it
- Confidence impact
- Client impact, if any
- Corrective action
- Whether checklist, search terms, or training should change

Missed evidence is not treated as blame. It is treated as the main source of process improvement.

### 7.3 Pattern Library

Maintain an internal pattern library with:

- Manufacturer document path patterns
- Common PFAS declaration filenames
- Compliance folder names
- Product-code formatting variants
- Dropdown and document-widget patterns
- Distributor sources that mirror manufacturer documents
- Archive patterns for superseded documents
- Common evidence-basis phrases
- Product categories with high product-family leakage risk
- Customer request formats and required evidence types

The pattern library is internal IP. It should be updated after each engagement.

### 7.4 Query Bank

Maintain reusable search query patterns by evidence class:

- Product-specific PFAS declaration searches
- SDS/TDS searches
- Compliance document searches
- Site-restricted manufacturer searches
- Distributor mirror searches
- Archive searches
- Customer/OEM request searches
- Government-source searches

Each query pattern should include:

- When to use it
- Example terms
- Evidence class targeted
- Failure signals
- Source confidence implications

### 7.5 Reviewer Calibration

At least monthly during active delivery, Liberty Tree should review completed packets and compare:

- Analyst confidence scores
- Reviewer-adjusted confidence scores
- Escalations raised
- Escalations missed
- Claims downgraded
- Documents excluded
- Missing evidence items that later became available

Calibration prevents confidence inflation and keeps the playbook consistent across analysts.

### 7.6 Metrics To Track

Track these operational metrics:

- Time to first high-value evidence item
- Number of source categories searched
- Number of hidden evidence items found
- Number of documents found outside visible product links
- Number of distributor-only evidence items
- Number of archived or superseded documents found
- Number of material conflicts identified
- Number of missing evidence items
- Expert review time
- Reviewer confidence downgrades
- Missed evidence incidents
- Packet readiness status at first reviewer handoff

The most important metric is not total documents collected. The most important metric is material evidence found that a naive workflow would likely miss.

### 7.7 Playbook Update Rule

The playbook should be updated when:

- The same failure mode occurs twice
- A new hidden evidence pattern is found
- A reviewer downgrades confidence for a reason not covered by the rubric
- A client or expert identifies a missing evidence class
- A regulatory or customer-document pattern becomes recurring
- A source category proves consistently low-value and can be de-emphasized

Updates should preserve the internal operating standard: improve evidence recall, improve confidence discipline, and reduce unsupported conclusions.

## Final Internal Principle

Liberty Tree's durable advantage will not come from producing more polished packets than competitors. It will come from finding better evidence, recording where it came from, knowing when evidence is weak, and making every investigation improve the next one.

An analyst has done the job when an expert reviewer can follow the path, test the confidence rating, see the gaps, and trust that the investigation was disciplined before the packet was written.
