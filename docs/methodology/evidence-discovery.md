# Liberty Tree Evidence Discovery Methodology

Date: 2026-07-07  
Status: Core operating methodology  
Scope: PFAS Evidence Packets and future documentation-heavy compliance domains

## Purpose

Liberty Tree's Evidence Discovery methodology defines how an analyst finds, verifies, ranks, and records source material before any evidence packet is drafted.

The production simulation revealed a critical operational fact: the highest-value PFAS document may be public and available, but not discoverable through a naive search or crawler. It may be hidden in a product-page dropdown, embedded JavaScript, an alternate document path, a distributor copy, an archived page, or a supplier portal.

This methodology treats evidence discovery as the core value-producing activity. The packet is the client-facing output of that discovery discipline.

This methodology is not a legal opinion, not regulatory certification, and not a substitute for laboratory testing, supplier representation, or counsel review where those are required. It is a structured approach for locating, qualifying, and tracing evidence.

## Operating Thesis

Liberty Tree creates value when it can reliably answer three questions better than a client, a generic consultant, or a naive AI workflow:

1. What evidence exists?
2. Where is it located, including non-obvious locations?
3. How much confidence should a buyer, reviewer, or compliance lead place in it?

The business risk is not only whether the packet is well written. The larger risk is whether material evidence was missed.

## Method Principles

1. Discovery precedes interpretation.
2. Source origin matters.
3. Product and SKU specificity are stronger than product-family assumptions.
4. A document is not evidence until its scope, date, source, and relevance are understood.
5. Direct manufacturer evidence is preferred, but lower-tier sources can reveal missing paths.
6. Absence of evidence is a finding, not a compliance conclusion.
7. Conflicts must be preserved and escalated, not smoothed over.
8. AI may accelerate search and extraction, but humans remain accountable for source judgment and scope judgment.
9. A final packet must allow an expert reviewer to reproduce the discovery path.
10. Discovery completeness is defensible, not absolute.

## 1. Document Discovery Hierarchy

Reliability depends on source authority, product specificity, currency, document control, evidence basis, and traceability. The hierarchy below ranks sources for PFAS documentation review. A lower-ranked source may still be useful when it leads to a higher-ranked source.

Customer specifications and regulatory databases are included because they often define the question being asked. They do not, by themselves, prove the PFAS status of a specific product.

| Rank | Source Type | Reliability | Primary Use | Main Risk |
| --- | --- | --- | --- | --- |
| 1 | Product-specific manufacturer PFAS declaration | Highest | Direct evidence of manufacturer representation for a product, SKU, or product family | May be limited by date, jurisdiction, product scope, or undisclosed evidence basis |
| 2 | Product-specific manufacturer compliance certificate or test report | Highest when authentic and current | Supports a declared status or specific test-based statement | Test scope, analyte list, sample identity, and lab method may not match the buyer's request |
| 3 | Manufacturer SDS for the exact product and region | High for disclosed hazardous ingredients and handling information | Identifies disclosed ingredients, product identity, revision date, and manufacturer contact | SDS is not a full formulation disclosure and may not address all PFAS concerns |
| 4 | Manufacturer technical data sheet for the exact product | Medium to high | Confirms product identity, intended use, materials, and performance attributes | Usually not a compliance declaration |
| 5 | Manufacturer product page and controlled document library | Medium to high | Establishes current product context and may expose official document links | Important files may be hidden in dropdowns, scripts, or non-anchor links |
| 6 | Supplier or customer portal documents from a controlled account | Medium to high | Provides formal documents not publicly indexed | Access limits, export restrictions, and unclear document control may apply |
| 7 | Manufacturer general environmental or compliance statement | Medium | Provides company-level policy or broad product-family context | Often too general for a specific product or customer request |
| 8 | Customer specification, OEM restricted substance list, or procurement requirement | High for defining requested evidence; low for product proof | Defines the standard, format, or declaration requested from the supplier | Can be mistaken for evidence of the product itself |
| 9 | Regulatory databases and official agency lists | High for official regulatory context; low for product proof | Confirms substance status, regulatory terms, and authoritative references | Usually does not identify composition of the client's product |
| 10 | Archived manufacturer documents or pages | Medium | Reveals historical versions, discontinued products, old document paths, and revision conflicts | May be obsolete or superseded |
| 11 | Distributor-hosted copies of manufacturer SDS, TDS, or declarations | Low to medium | Helpful when manufacturer source is unavailable or hidden | Copy may be stale, incomplete, renamed, or detached from source control |
| 12 | Third-party compliance databases or document aggregators | Low to medium | Discovery lead, cross-check, or gap indicator | Provenance, update cycle, and licensing may be unclear |
| 13 | Trade publications, conference materials, or public presentations | Low for product proof; useful for context | Market or sector context, regulatory pressure, and terminology | Usually not product-specific |
| 14 | Community anecdotes, forums, Reddit, and informal discussions | Lead only | Identifies possible pain points or hidden workflows | Not verified evidence |
| 15 | Search snippets, AI-generated answers, and unsourced summaries | Not evidence | Search lead only | High risk of incompleteness or fabrication |

### Practical Rule

The strongest packet is not the one with the most documents. It is the one that connects the most relevant documents to the exact product, exact request, exact source path, exact date, and exact evidence basis.

## 2. Discovery Strategy

Evidence discovery should proceed in expanding rings. Analysts should begin with the highest-authority source and expand outward only when the direct source is incomplete, ambiguous, or inaccessible.

### 2.1 Define the Control Question

Before searching, the analyst must define:

- Client or buyer request, if available
- Product name, SKU, part number, grade, kit component, and region
- Manufacturer or supplier legal entity
- Document types requested or implied
- Regulatory or customer framework placeholders to be populated from authoritative sources
- Required response format, if any
- Deadline and use case

If the control question is missing, Liberty Tree may conduct discovery, but the packet must mark conclusions as limited by undefined scope.

### 2.2 Analyst Search Method

The analyst should search in this order:

1. Manufacturer product page for the exact product or SKU
2. Manufacturer document library, SDS library, compliance page, and downloads page
3. Product-page HTML beyond visible links
4. Manufacturer site search using product names, SKU variants, and document terms
5. Search engine queries restricted to the manufacturer domain
6. Search engine queries across the public web
7. Supplier portal or customer portal, where the client provides authorized access
8. Distributor-hosted copies of manufacturer documents
9. Archived manufacturer pages and documents
10. Regulatory databases and official guidance for context
11. Third-party databases, trade materials, and community discussions as leads only

For each search ring, the analyst should record:

- Search terms used
- Source locations searched
- Documents found
- Documents expected but not found
- Hidden paths discovered
- Date and time of retrieval
- Search limitations

### 2.3 Product Identity Expansion

The analyst should search for product identity variants, including:

- SKU with and without punctuation
- Product name with spaces, hyphens, and legacy capitalization
- Old product names or discontinued names
- Kit names and component names
- Region-specific naming
- Language-specific names
- Parent product family names
- Document filenames derived from product numbers
- CAS numbers or material identifiers only when relevant and source-backed

Product-family evidence must not be applied to a specific product unless the document clearly states that the product is included.

### 2.4 AI Search Method

AI should be used to accelerate discovery, not to replace source judgment. Appropriate AI responsibilities include:

- Generate search term variants from product names, SKUs, and document titles
- Identify likely document names and path patterns
- Extract links from HTML, PDFs, and text
- Inspect page content for non-obvious download references
- Cluster duplicate or near-duplicate documents
- Compare document dates, revision numbers, titles, and product identifiers
- Summarize discovered evidence with source citations
- Flag missing document classes based on the control question
- Draft reviewer questions when evidence is incomplete or conflicting

AI must not:

- Treat a search result snippet as evidence
- Invent a source path or missing document
- Infer product compliance from unrelated documents
- Resolve legal or regulatory interpretation without human review
- Convert absence of evidence into a compliance conclusion

### 2.5 Hidden Link Discovery

Many important documents are not exposed as ordinary links. Analysts and AI-assisted workflows should inspect:

- Dropdown `option` values
- Button targets and form actions
- `data-*` attributes
- JavaScript variables containing document URLs
- Embedded JSON or page state
- Inline event handlers
- Sitemap files and document indexes
- PDF filename patterns
- Redirect destinations
- Download endpoints
- Product configurator or document selector outputs
- Language and region switches

The analyst should remain within authorized, public, or client-provided access. Discovery discipline does not justify bypassing access controls, ignoring site terms, or scraping private systems without permission.

### 2.6 Version Conflict Handling

When documents conflict, the packet must preserve the conflict. The analyst should compare:

- Source authority
- Issue date
- Revision date
- Revision number
- Product scope
- SKU or part number coverage
- Jurisdiction or market
- Language
- Manufacturer entity
- Document type and evidence basis
- Retrieval path

Default preference should be given to the most current, product-specific, manufacturer-controlled source. However, if a lower-ranked source appears newer or more specific, the conflict must be escalated rather than resolved silently.

### 2.7 Document Revision Tracking

Each document in the evidence register should include:

- Document ID assigned by Liberty Tree
- Original title
- Document type
- Source organization
- Source URL or access path
- Retrieval date
- Issue date
- Revision date or revision number
- Product names and SKUs covered
- Jurisdiction or region
- Language
- Evidence basis, if stated
- Hash or file fingerprint when available
- Superseded or duplicate document references
- Conflict notes
- Reviewer status

Revision tracking is essential because a stale document can look authoritative while no longer representing the manufacturer's current position.

## 3. Evidence Confidence

Evidence confidence is a discovery and traceability rating. It is not a legal conclusion and not a certification of compliance.

### Confidence Dimensions

Every material evidence item should be evaluated across these dimensions:

- Source authority
- Product specificity
- Currency
- Document control
- Evidence basis
- Relevance to the control question
- Extraction quality
- Conflict status
- Traceability

The overall confidence rating should be capped by the weakest material dimension. For example, a document from a manufacturer may still be Medium confidence if it is undated or only product-family specific.

### Confidence Levels

| Level | Definition | Typical Evidence |
| --- | --- | --- |
| High | Direct, current, product-specific evidence from a controlled source, with clear scope, traceable retrieval path, and no unresolved conflict | Manufacturer PFAS declaration for exact SKU; current product SDS plus matching product declaration; controlled supplier portal certificate |
| Medium | Relevant evidence from a credible source, but with a limitation in specificity, date, basis, or completeness | Manufacturer general statement; SDS that supports but does not answer the PFAS question; distributor copy matching known manufacturer document |
| Low | Evidence is potentially relevant but weak, stale, indirect, incomplete, or conflicted | Third-party copy; archived PDF; ambiguous product-family statement; document without date or clear source path |
| Unknown | Evidence is unavailable, inaccessible, unreadable, or cannot be tied to the product or request | Broken link; login-restricted document not provided; search snippet only; AI inference; unavailable supplier declaration |

### Confidence Statement Format

Each evidence item should be accompanied by a plain-language confidence statement:

> Confidence: Medium. The document is manufacturer-authored and current as retrieved, but it covers a product family rather than the exact SKU requested. No product-specific PFAS declaration was located during public-source discovery.

## 4. Failure Modes

| Failure Mode | Why It Matters | Detection Method | Control |
| --- | --- | --- | --- |
| Hidden URLs | Material documents may not appear in visible links or basic crawls | Inspect HTML, dropdowns, scripts, forms, and embedded page state | Hidden-link discovery step is mandatory before final QA |
| Obsolete PDFs | Old documents may contradict or overstate current evidence | Compare issue dates, revision dates, source paths, and current product pages | Preserve conflicts and prefer current controlled source only after review |
| Distributor copies | Distributor files may be stale or incomplete | Compare against manufacturer site and metadata | Use as lead or fallback, not primary source unless disclosed as limitation |
| Conflicting revisions | Different documents may support different conclusions | Document clustering and revision comparison | Escalate unresolved conflicts |
| Missing declarations | The most requested evidence may not be public | Search manufacturer, portal, distributor, archive, and customer sources | Record as missing documentation and recommend supplier outreach |
| Broken links | Evidence may exist but be temporarily unavailable or moved | Retry, check redirects, inspect archives, search filenames | Record retrieval failure and alternate paths attempted |
| Duplicate documents | Repeated copies can create false confidence | Compare titles, dates, hashes, content, and filenames | Deduplicate while preserving source paths |
| Dynamic portals | Documents may load through scripts or authenticated selectors | Review page behavior, source markup, and client-provided portal exports | Escalate when authorized access is required |
| Multilingual duplicates | Same document may vary by region or language | Compare language, jurisdiction, product scope, and date | Use region-appropriate document and preserve variants |
| Kit or component ambiguity | A kit may require documents for each component | Separate product, kit, and component evidence | Do not apply one component's evidence to the whole kit |
| Product-family leakage | Broad statements may be misapplied to a specific SKU | Check explicit inclusion of product name or SKU | Cap confidence and escalate if specificity is required |
| SDS overreach | SDS is often mistaken for full composition evidence | Review SDS purpose and disclosed sections | Use SDS as supporting evidence only unless it directly answers the request |
| Declaration basis ambiguity | A declaration may not state whether based on testing, supplier declarations, or formulation review | Inspect declaration language and supporting documents | Record basis as stated, or Unknown if absent |
| Search snippet reliance | Snippets may be incomplete or wrong | Open and archive the source document | Snippets are leads only |
| AI-inferred source | AI may invent plausible filenames or paths | Require retrievable source URL or client-provided file | Reject unsupported AI output |
| Customer request mismatch | Evidence may not answer the exact format or standard requested | Compare evidence to the control question | Escalate scope mismatch before delivery |

## 5. Escalation Rules

Human intervention is required whenever source judgment, scope judgment, legal wording, or customer representation risk exceeds routine analyst review.

| Trigger | Escalation Owner | Required Action |
| --- | --- | --- |
| Product or SKU scope is ambiguous | Senior reviewer | Determine whether evidence can be used, capped, or must be excluded |
| Only distributor, archived, or third-party evidence is available | Senior reviewer | Decide whether to use as low-confidence lead or require supplier outreach |
| Manufacturer documents conflict | Senior reviewer or subject-matter expert | Compare source authority and revisions; document unresolved conflict |
| Declaration basis is unclear | Senior reviewer | Mark basis as Unknown and determine whether client outreach is needed |
| Customer request asks for certification, legal attestation, or warranty language | Legal or authorized client representative | Liberty Tree must not supply unauthorized legal or supplier representations |
| Regulatory interpretation is material to the answer | Subject-matter expert or counsel | Confirm interpretation before packet language is finalized |
| Evidence suggests testing may be required | Subject-matter expert | Identify testing question and avoid substituting documentation review for test results |
| Hidden high-value evidence is found after initial review | Senior reviewer | Reopen evidence matrix, source index, gap assessment, and risk summary |
| AI extraction fails or document text is unreadable | Human analyst | Manually inspect document or use alternate extraction methods |
| Portal access is required | Client or authorized portal user | Obtain authorized export or permission; do not bypass access controls |
| Missing evidence affects a material conclusion | Senior reviewer | Convert to explicit gap, recommended next step, or client question |

### Escalation Principle

When in doubt, Liberty Tree should downgrade confidence and preserve the uncertainty. A defensible packet is more valuable than an overconfident packet.

## 6. Quality Checklist

Before a PFAS Evidence Packet is delivered, Liberty Tree should confirm that evidence discovery was sufficiently complete for the stated scope.

### Discovery Adequacy Checklist

- Control question is documented.
- Product names, SKUs, regions, and components are defined.
- Manufacturer product page was reviewed.
- Manufacturer SDS library was reviewed.
- Manufacturer TDS or technical document library was reviewed where available.
- Manufacturer compliance, environmental, and declaration pages were reviewed.
- Product-page HTML was inspected for hidden document links.
- Dropdowns, form values, scripts, and embedded page data were checked where relevant.
- Manufacturer-domain search was performed with documented search terms.
- Public web search was performed with documented search terms.
- Distributor-hosted documents were checked when manufacturer evidence was incomplete.
- Archived documents were checked when version history or missing files were material.
- Regulatory and customer sources were used only to define context or requested evidence, not to prove product status.
- Every material document has source URL or access path, retrieval date, issue or revision date, and product scope.
- Duplicate documents were identified and clustered.
- Conflicting documents were preserved and escalated.
- Missing expected documents were recorded in the missing documentation register.
- Confidence ratings were assigned and capped by material limitations.
- All AI-generated summaries were checked against source documents.
- No unsupported compliance conclusion appears in the packet.
- Reviewer can reproduce how the highest-value documents were found.

### Delivery Standard

Evidence discovery is sufficiently complete when a competent reviewer can see:

- What was searched
- What was found
- What was not found
- Which hidden or indirect paths were checked
- Which sources were considered authoritative
- Which conflicts or limitations remain
- Why the packet's claims are limited to the evidence actually collected

This standard does not guarantee that no additional evidence exists. It makes the discovery process transparent and reviewable.

## 7. Future Software Opportunities

The methodology should remain human-accountable, but software could reduce missed evidence and QA time. The estimates below are directional hypotheses that require validation through production runs.

| Opportunity | What It Would Improve | Expected Reduction In Missed Evidence | Human Role That Remains |
| --- | --- | --- | --- |
| Hidden-link extractor | Finds document paths in dropdowns, scripts, embedded JSON, forms, and data attributes | 20% to 35% | Decide whether each path is authoritative and relevant |
| SKU and product-variant query generator | Expands search across naming variants, regions, and legacy identifiers | 10% to 20% | Confirm which variants are in scope |
| Manufacturer-domain document mapper | Builds a map of public SDS, TDS, declaration, and compliance pages | 20% to 30% | Review access limits and source authority |
| PDF metadata and fingerprinting | Detects duplicates, stale versions, and revision changes | 10% to 20% | Decide how conflicts affect confidence |
| Revision conflict detector | Flags inconsistent dates, titles, revision numbers, or product scopes | 15% to 25% | Resolve or escalate conflicts |
| Evidence graph | Links product, SKU, document, source, date, evidence basis, and claim | 25% to 40% | Validate relationship quality and scope |
| Missing-evidence classifier | Identifies expected but absent evidence classes based on the control question | 15% to 25% | Decide which gaps matter commercially or technically |
| Broken-link and archive resolver | Recovers moved or archived documents | 5% to 15% | Determine whether archived evidence can be used |
| Portal intake analyzer | Structures client-provided supplier portal exports and uploaded documents | 15% to 30% | Verify authorization, scope, and completeness |
| Reviewer QA dashboard | Shows unresolved conflicts, low-confidence evidence, missing fields, and source gaps | 10% to 20% missed-evidence reduction; 20% to 35% QA time reduction | Conduct final judgment and approve packet language |

### Software Boundary

Software should improve recall, comparison, and traceability. It should not make final compliance conclusions, supplier representations, legal interpretations, or client-facing assurances without human review.

## Competitive Advantage Assessment

Could Liberty Tree's evidence-discovery methodology become a meaningful competitive advantage?

Yes, but only if it becomes an operating system rather than a document.

The advantage is meaningful because many compliance workflows assume the evidence is easy to find. The production simulation showed the opposite: a high-value PFAS declaration can be present, public, and still missed by a naive crawler because it is hidden in page structure rather than exposed as a normal link. A firm that systematically finds those documents can deliver more complete packets, identify stronger gaps, and earn reviewer trust.

The advantage is not automatically durable. A written checklist can be copied. The defensible advantage comes from execution:

- Accumulated knowledge of manufacturer document patterns
- A growing evidence graph across products, suppliers, and source paths
- Reusable search heuristics for hidden document locations
- Reviewer calibration on confidence ratings and escalation triggers
- Case history showing where naive search failed
- Client trust that Liberty Tree finds evidence before summarizing it

This methodology is most commercially valuable in domains where documents are distributed across product pages, portals, libraries, distributors, archives, and regulatory context. It is less valuable when the client already has a complete, well-organized supplier data room or when the decisive work is laboratory testing rather than documentation discovery.

The critical risk is buyer perception. Clients may not initially understand that discovery is the high-value work. Liberty Tree will need to demonstrate missed-evidence prevention through examples, QA logs, and before-and-after discovery records. If buyers see only the final packet, they may price the work like report writing. If they see the discovery rigor, the business can command a premium.

The conclusion is therefore conditional: evidence discovery can become Liberty Tree's moat, but only if the firm measures it, repeats it, reviews it, and proves that it finds material evidence that ordinary workflows miss.
