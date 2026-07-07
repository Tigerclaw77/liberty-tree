# PFAS Evidence Packet Section Specifications

## Document Controls

Recommended identifiers:

- Packet ID: `PFAS-PKT-[CLIENT]-[YYYYMMDD]-[VERSION]`
- Product ID: `PROD-###`
- Supplier ID: `SUP-###`
- Document ID: `DOC-###`
- Source ID: `SRC-###`
- Regulatory citation placeholder: `REG-CIT-###`
- Evidence ID: `EVID-###`
- Gap ID: `GAP-###`
- Appendix ID: `APP-###`

Traceability rule: every substantive entry should cite a source ID, regulatory placeholder, evidence ID, gap ID, or reviewer note.

## 1. Cover Page

### Purpose

Identify the packet, client, covered scope, issue status, version, and review ownership.

### Required Inputs

- Client legal name and operating name.
- Packet title and packet ID.
- Covered product families, SKUs, or product IDs.
- Covered jurisdictions or market scope, if defined.
- Issue date, version, and status.
- Liberty Tree preparer and reviewer names.
- Client reviewer name, if applicable.

### Expected Outputs

- Controlled cover page.
- Clear disclaimer that the packet is not legal advice, regulatory certification, or product certification.
- Version and review status visible on first page.

### Data Sources

- Engagement letter or statement of work.
- Client intake form.
- Client-approved product scope.
- Liberty Tree document control log.

### Human Review Requirements

- Confirm client name, packet title, issue status, and scope.
- Confirm disclaimers match engagement terms.
- Confirm no compliance conclusion appears on the cover page.

### AI Opportunities

- Format cover metadata from intake records.
- Check consistency between cover page scope and engagement scope.
- Flag missing document control fields.

### Confidence Rating

Not applicable for legal or technical confidence. Administrative completeness may be rated High, Medium, Low, or Pending.

### Traceability Requirements

- Link scope statements to engagement source IDs.
- Link product family references to product inventory IDs.
- Link jurisdiction references to scope notes or regulatory placeholders.

### Draft Template

```text
PFAS Evidence Packet

Prepared for: [CLIENT LEGAL NAME]
Prepared by: Liberty Tree Compliance
Packet ID: [PFAS-PKT-CLIENT-YYYYMMDD-V#]
Version: [DRAFT / CLIENT REVIEW / FINAL]
Issue date: [DATE]
Covered products: [PRODUCT FAMILIES / PROD-### RANGE]
Covered market or jurisdiction scope: [SCOPE OR TBD]

Important limitation:
This packet is a structured, source-indexed evidence package. It is not a legal opinion, regulatory certification, product certification, or determination of PFAS presence or absence.

Prepared by: [NAME]
Technical review: [NAME / PENDING]
Client review: [NAME / PENDING]
```

## 2. Executive Summary

### Purpose

Summarize scope, evidence reviewed, primary gaps, overall readiness posture, and recommended follow-up without overstating compliance status.

### Required Inputs

- Approved engagement scope.
- Product, supplier, and document inventory counts.
- SDS review findings.
- Supplier declaration findings.
- PFAS evidence matrix.
- Missing documentation register.
- Gap assessment and risk summary.

### Expected Outputs

- Concise overview of packet contents.
- Evidence readiness summary.
- High-priority gaps and next steps.
- Clear limitations and review status.

### Data Sources

- All packet matrices.
- Source index.
- Reviewer notes.
- Client-approved assumptions.

### Human Review Requirements

- Confirm all summary statements trace to detailed sections.
- Remove unsourced conclusions.
- Confirm the summary does not imply certification or legal advice.
- Check that confidence language matches matrix ratings.

### AI Opportunities

- Draft a summary from reviewed matrices.
- Compare summary statements against source IDs.
- Flag unsupported claims or inconsistent counts.

### Confidence Rating

Use the lowest relevant confidence rating from the underlying evidence for each summarized conclusion.

### Traceability Requirements

- Cite section numbers, evidence IDs, source IDs, or gap IDs after each substantive statement.
- Identify pending regulatory citations with `REG-CIT-###` placeholders.

### Draft Template

```text
This PFAS Evidence Packet covers [PRODUCT SCOPE] for [CLIENT] based on records provided through [DATE].

Records reviewed:
- Products in scope: [COUNT] ([PROD RANGE])
- Suppliers in scope: [COUNT] ([SUP RANGE])
- Documents reviewed: [COUNT] ([DOC RANGE])
- SDS records reviewed: [COUNT]
- Supplier declarations reviewed: [COUNT]

Readiness summary:
- [SUMMARY STATEMENT] [EVID-### / GAP-### / SRC-###]
- [SUMMARY STATEMENT] [EVID-### / GAP-### / SRC-###]

Primary gaps:
- [GAP-###] [GAP SUMMARY]

Recommended next steps:
- [ACTION] [OWNER] [TARGET DATE]

Limitations:
This executive summary is evidence-organizing support only and should be read with the packet limitations, source index, and detailed matrices.
```

## 3. Engagement Scope

### Purpose

Define the boundaries of the packet so reviewers understand what products, suppliers, documents, jurisdictions, and time periods are included or excluded.

### Required Inputs

- Statement of work or engagement scope.
- Client intake responses.
- Product list.
- Supplier list.
- Jurisdiction or market assumptions.
- Date range of documents reviewed.

### Expected Outputs

- In-scope products, suppliers, and document classes.
- Out-of-scope items.
- Jurisdictional placeholders or market assumptions.
- Date boundaries and version boundaries.

### Data Sources

- Engagement letter.
- Client intake form.
- Client email confirmations.
- Product master data.
- Supplier master data.

### Human Review Requirements

- Confirm scope with client reviewer.
- Confirm exclusions are explicit.
- Confirm no unsupported jurisdictional assumptions are introduced.

### AI Opportunities

- Reconcile product and supplier lists against intake scope.
- Detect possible out-of-scope documents.
- Draft scope text from structured intake data.

### Confidence Rating

High when confirmed by engagement source and client review. Medium when based on intake records only. Pending when client confirmation is outstanding.

### Traceability Requirements

- Link all scope boundaries to source IDs.
- Link exclusions to client direction or engagement terms.
- Assign `REG-CIT-###` placeholders to jurisdictional references requiring later authority review.

### Draft Template

```text
In scope:
- Products: [PROD-### to PROD-###]
- Suppliers: [SUP-### to SUP-###]
- Document categories: [SDS / declarations / specifications / test reports / correspondence / other]
- Date range reviewed: [START DATE] to [END DATE]
- Market or jurisdiction scope: [TBD / CLIENT-SUPPLIED ASSUMPTION / REG-CIT-### PLACEHOLDER]

Out of scope:
- [ITEM OR CATEGORY] [SOURCE OR ASSUMPTION]

Known scope limitations:
- [LIMITATION] [SRC-### / NOTE-###]
```

## 4. Applicable Regulatory Framework

### Purpose

Reserve a structured place for applicable PFAS regulatory citations and applicability analysis once authoritative sources have been selected and reviewed.

### Required Inputs

- Jurisdictions or markets in scope.
- Product categories and use cases.
- Client distribution assumptions.
- Authoritative legal or regulatory source documents.
- Review notes from qualified regulatory or legal reviewer, when scoped.

### Expected Outputs

- Regulatory citation table with placeholders or reviewed citations.
- Applicability rationale for each citation.
- Citation status and reviewer status.
- Clear indication of pending or unreviewed items.

### Data Sources

- Official statutory or regulatory text.
- Official regulator guidance, notices, FAQs, bulletins, or registers.
- Client counsel or qualified regulatory specialist memoranda.
- Client-approved market and distribution assumptions.

### Human Review Requirements

- Regulatory citations must be populated only from authoritative sources.
- A qualified reviewer must approve requirement summaries before issue.
- Any pending citation must remain labeled as pending.
- Do not infer obligations from secondary summaries unless explicitly approved and identified.

### AI Opportunities

- Maintain citation placeholders.
- Extract citation metadata from authoritative documents after human source selection.
- Compare product categories against reviewer-approved applicability criteria.
- Flag missing access dates, source URLs, or reviewer fields.

### Confidence Rating

Pending until authoritative source review is complete. High only when source, applicability rationale, and qualified human review are complete.

### Traceability Requirements

- Each row must include `REG-CIT-###`, source ID, access date, reviewer, and status.
- Requirement summaries must cite the exact authoritative source record.
- Applicability rationale must cite product IDs and scope assumptions.

### Draft Template

```text
Regulatory framework status: [PLACEHOLDER / PARTIALLY REVIEWED / REVIEWED]

| Citation ID | Jurisdiction | Topic | Authoritative source | Date accessed | Applicability rationale | Status | Reviewer |
| --- | --- | --- | --- | --- | --- | --- | --- |
| REG-CIT-001 | [TBD] | [TBD] | [Official source pending] | [TBD] | [To be populated after source review] | Pending | [TBD] |

Important note:
No regulatory requirement summary should be added to this section until the authoritative source has been identified, indexed, and reviewed.
```

## 5. Product Inventory

### Purpose

Create the controlled list of products, SKUs, components, materials, or product families covered by the packet.

### Required Inputs

- Client product master list.
- SKU list or item master.
- Bills of material, if included.
- Product descriptions and categories.
- Market or jurisdiction scope by product, if available.

### Expected Outputs

- Product inventory table.
- Product IDs used throughout the packet.
- Scope status for each product.
- Linkage to suppliers, documents, and evidence entries.

### Data Sources

- ERP export.
- Product master data.
- Bills of material.
- Client intake workbook.
- Product specification sheets.

### Human Review Requirements

- Client confirms the product list is complete for the engagement scope.
- Reviewer checks duplicates, retired SKUs, renamed products, and version conflicts.
- Reviewer confirms whether components or only finished goods are in scope.

### AI Opportunities

- Normalize product names.
- Detect duplicate or inconsistent SKUs.
- Map products to related suppliers and documents.
- Flag products without supporting evidence.

### Confidence Rating

High when product list is client-confirmed and source-linked. Medium when generated from exports but not client-confirmed. Pending when scope confirmation is outstanding.

### Traceability Requirements

- Each product row must include product ID and source ID.
- Product-to-supplier and product-to-document links should cite supporting inventory or client source.

### Draft Template

```text
| Product ID | Product name | SKU / part number | Product family | Component or finished good | In scope? | Supplier IDs | Document IDs | Source IDs | Notes | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PROD-001 | [Name] | [SKU] | [Family] | [Type] | [Yes/No/TBD] | SUP-### | DOC-### | SRC-### | [Notes] | [High/Medium/Low/Pending] |
```

## 6. Supplier Inventory

### Purpose

Create the controlled list of suppliers connected to the products, materials, or documents in scope.

### Required Inputs

- Supplier master list.
- Product-to-supplier mapping.
- Contact details for PFAS documentation requests.
- Supplier declarations or responses.
- Procurement or quality records, if available.

### Expected Outputs

- Supplier inventory table.
- Supplier IDs used throughout packet.
- Supplier documentation status.
- Contact and follow-up owner fields.

### Data Sources

- ERP supplier master.
- Approved vendor list.
- Procurement records.
- Quality management system records.
- Supplier correspondence.

### Human Review Requirements

- Client confirms supplier relationships and active status.
- Reviewer checks parent/subsidiary naming, distributor versus manufacturer distinctions, and duplicate supplier records.
- Reviewer verifies follow-up contacts before outbound requests.

### AI Opportunities

- Normalize supplier names.
- Identify duplicate supplier records.
- Match supplier declarations to supplier IDs.
- Draft supplier follow-up request lists.

### Confidence Rating

High when client-confirmed and linked to products. Medium when source-linked but not client-confirmed. Pending when supplier status or role is unclear.

### Traceability Requirements

- Each supplier row must include source IDs.
- Supplier-product relationships must link to product inventory or procurement source.
- Supplier declaration status must link to document IDs or missing documentation gap IDs.

### Draft Template

```text
| Supplier ID | Supplier name | Supplier role | Related products | Contact | Declaration status | Last response date | Source IDs | Follow-up owner | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SUP-001 | [Name] | [Manufacturer / distributor / material supplier / TBD] | PROD-### | [Contact] | [Received / Missing / Incomplete / Not requested] | [Date] | SRC-### | [Owner] | [High/Medium/Low/Pending] |
```

## 7. Document Inventory

### Purpose

Index every document reviewed or requested for the packet so evidence can be traced and gaps can be reproduced.

### Required Inputs

- SDSs.
- Supplier declarations.
- Product specifications.
- Bills of material.
- Test reports, if provided.
- Certifications, if provided.
- Correspondence.
- Regulatory source documents or placeholders.

### Expected Outputs

- Document inventory table.
- Document IDs and source IDs.
- Review status, owner, issue date, received date, and version.
- Relationship between documents and products or suppliers.

### Data Sources

- Client data room.
- Email attachments.
- Supplier portal exports.
- QMS or PLM system exports.
- Official regulatory source files, when reviewed.

### Human Review Requirements

- Confirm document legibility, completeness, version, and relevance.
- Check whether superseded documents should be retained in appendix or marked inactive.
- Verify document type and relationship to products or suppliers.

### AI Opportunities

- Classify documents by type.
- Extract dates, titles, issuer names, and product references.
- Detect duplicates or potentially superseded versions.
- Flag missing metadata.

### Confidence Rating

High when document metadata is complete and human-reviewed. Medium when document is source-linked but metadata is incomplete. Low when relevance is uncertain. Pending when review is incomplete.

### Traceability Requirements

- Assign every source a `DOC-###` or `SRC-###`.
- Link each document to applicable product IDs, supplier IDs, evidence IDs, or gap IDs.

### Draft Template

```text
| Document ID | Source ID | Document type | Title / description | Issuer | Issue date | Received date | Version | Related products | Related suppliers | Review status | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DOC-001 | SRC-001 | [SDS / declaration / spec / test report / correspondence / regulatory source] | [Title] | [Issuer] | [Date] | [Date] | [Version] | PROD-### | SUP-### | [Not reviewed / Reviewed / Superseded / Pending] | [Notes] |
```

## 8. SDS Review Matrix

### Purpose

Capture structured observations from Safety Data Sheets relevant to PFAS evidence readiness without treating SDS silence as proof of PFAS absence.

### Required Inputs

- SDS documents.
- Product-to-SDS mapping.
- Supplier or manufacturer identity.
- SDS issue or revision dates.
- Reviewer-approved extraction fields.

### Expected Outputs

- SDS review matrix.
- SDS coverage status by product.
- Extracted statements and noted limitations.
- Gaps for missing, outdated, or mismatched SDS records.

### Data Sources

- SDS PDFs or source files.
- Supplier portals.
- Client QMS or EHS document repositories.
- Product inventory.

### Human Review Requirements

- Confirm SDS applies to the product or material in scope.
- Review AI-extracted text against source document.
- Check issue dates and language or jurisdiction versions.
- Confirm that absence of listed PFAS-related terms is not represented as conclusive absence.

### AI Opportunities

- Extract SDS metadata and referenced substances.
- Search for reviewer-approved PFAS-related terminology.
- Compare SDS product names against inventory.
- Flag SDSs missing issue dates or product matches.

### Confidence Rating

High when SDS-product match and extraction are human-reviewed. Medium when SDS applies but is dated, partial, or supplier-limited. Low when product match is uncertain. Pending when SDS is missing or not reviewed.

### Traceability Requirements

- Each SDS row must cite document ID and source ID.
- Extracted text must cite page, section, or location when available.
- Any conclusion relying on SDS review must link to evidence ID or gap ID.

### Draft Template

```text
| SDS review ID | Product ID | Supplier ID | SDS document ID | SDS issue date | Product match confirmed? | Relevant extracted statements | PFAS term review status | Limitations | Evidence ID / Gap ID | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SDS-001 | PROD-001 | SUP-001 | DOC-001 | [Date] | [Yes/No/TBD] | [Text summary with location] | [Reviewed / Pending] | [Limitations] | EVID-### / GAP-### | [High/Medium/Low/Pending] |
```

## 9. Supplier Declaration Matrix

### Purpose

Organize supplier statements related to PFAS, covered products, scope, dates, and limitations.

### Required Inputs

- Supplier declarations.
- Declaration request templates, if used.
- Supplier responses and correspondence.
- Product-to-supplier mapping.
- Declaration review criteria.

### Expected Outputs

- Supplier declaration matrix.
- Declaration coverage by product and supplier.
- Statement type, scope, limitations, and expiration or issue dates.
- Follow-up items for missing or inadequate declarations.

### Data Sources

- Supplier declarations.
- Supplier email correspondence.
- Supplier portal records.
- Procurement or quality records.
- Client-approved request language.

### Human Review Requirements

- Confirm declaration authenticity and issuer.
- Confirm covered products, materials, and date range.
- Review limitations, exclusions, and definitions used by supplier.
- Do not convert supplier declaration into legal certification unless separately supported.

### AI Opportunities

- Extract declaration metadata and scope language.
- Compare declaration coverage against product inventory.
- Flag missing signatures, dates, product references, or definition mismatches.
- Draft supplier clarification questions.

### Confidence Rating

High when declaration is product-specific, current for the packet issue date, and human-reviewed. Medium when declaration is supplier-level or partially scoped. Low when declaration is vague or conflicting. Pending when missing or awaiting review.

### Traceability Requirements

- Each declaration row must cite document ID and source ID.
- Coverage claims must link to product IDs and supplier IDs.
- Limitations must be preserved and linked to source text.

### Draft Template

```text
| Declaration ID | Supplier ID | Product IDs covered | Document ID | Issue date | Statement summary | Scope limitations | Signature / authority | Follow-up needed? | Evidence ID / Gap ID | Confidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DECL-001 | SUP-001 | PROD-### | DOC-### | [Date] | [Summary] | [Limitations] | [Name / title / TBD] | [Yes/No] | EVID-### / GAP-### | [High/Medium/Low/Pending] |
```

## 10. PFAS Evidence Matrix

### Purpose

Provide the main crosswalk between products, suppliers, documents, regulatory placeholders, evidence statements, confidence ratings, and review status.

### Required Inputs

- Product inventory.
- Supplier inventory.
- Document inventory.
- SDS review matrix.
- Supplier declaration matrix.
- Analytical records, if provided.
- Regulatory citation placeholders or reviewed citations.
- Reviewer notes.

### Expected Outputs

- Evidence matrix with one row per product-evidence relationship or product-supplier-evidence relationship.
- Evidence status and confidence rating.
- Cross-references to gaps and next steps.

### Data Sources

- All packet inventories and matrices.
- Source index.
- Client-provided test reports or specifications.
- Reviewer notes.

### Human Review Requirements

- Verify every evidence statement against source material.
- Confirm evidence type and weight.
- Resolve conflicts or move them to gap assessment.
- Confirm confidence ratings are conservative and documented.

### AI Opportunities

- Assemble candidate evidence rows from source-indexed matrices.
- Detect products with no supporting evidence.
- Flag contradictory evidence statements.
- Suggest confidence ratings for human review.

### Confidence Rating

Use line-item rating. High requires direct, reviewed, product-specific evidence. Medium may be indirect or partial. Low indicates weak, conflicting, or insufficient support. Pending indicates missing source or incomplete human review.

### Traceability Requirements

- Each row must include evidence ID, product ID, source ID, document ID where applicable, reviewer, date reviewed, and confidence rating.
- Regulatory references must use `REG-CIT-###` placeholders unless reviewed citations are approved.

### Draft Template

```text
| Evidence ID | Product ID | Supplier ID | Evidence type | Evidence statement | Source IDs | Document IDs | Regulatory placeholder | Review status | Reviewer | Confidence | Related gap / action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EVID-001 | PROD-001 | SUP-001 | [SDS / declaration / test report / specification / correspondence / other] | [Source-indexed statement] | SRC-### | DOC-### | REG-CIT-### / N/A | [Draft / Reviewed / Pending] | [Name] | [High/Medium/Low/Pending] | GAP-### / ACTION-### |
```

## 11. Missing Documentation Register

### Purpose

Track missing, incomplete, outdated, conflicting, or unreviewed records that limit packet readiness.

### Required Inputs

- Product inventory.
- Supplier inventory.
- Document inventory.
- SDS review matrix.
- Supplier declaration matrix.
- Evidence matrix.
- Client and supplier correspondence.

### Expected Outputs

- Missing documentation register.
- Gap ID for each missing or inadequate item.
- Owner, priority, requested date, due date, and current status.

### Data Sources

- Packet matrices.
- Supplier request log.
- Client data room.
- Email correspondence.
- Reviewer notes.

### Human Review Requirements

- Confirm each gap is real and not caused by duplicate naming or indexing error.
- Confirm ownership and priority with client.
- Close gaps only when replacement evidence is indexed and reviewed.

### AI Opportunities

- Compare required evidence categories against available documents.
- Generate draft gap descriptions.
- Identify stale requests or missing follow-up dates.
- Match late-arriving documents to open gaps.

### Confidence Rating

High when the missing item is confirmed by inventory cross-check and human review. Medium when likely missing but client confirmation is pending. Pending when document matching is incomplete.

### Traceability Requirements

- Each gap must cite affected product IDs, supplier IDs, evidence IDs, or document request sources.
- Closure must cite the source ID that resolves the gap.

### Draft Template

```text
| Gap ID | Missing / deficient item | Affected products | Affected suppliers | Why it matters | Source basis | Owner | Priority | Requested date | Due date | Status | Closure evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| GAP-001 | [Item] | PROD-### | SUP-### | [Reason tied to packet readiness] | SRC-### / EVID-### | [Owner] | [High/Medium/Low] | [Date] | [Date] | [Open / In progress / Closed] | SRC-### / TBD |
```

## 12. Gap Assessment

### Purpose

Analyze the missing documentation register and evidence matrix to describe readiness gaps, their likely causes, and their effect on the packet's evidentiary completeness.

### Required Inputs

- Missing documentation register.
- Evidence matrix.
- Product and supplier inventories.
- Reviewer notes.
- Client constraints or priorities.

### Expected Outputs

- Gap categories.
- Materiality or priority ranking for packet readiness.
- Recommended remediation path.
- Open questions for client, supplier, or regulatory reviewer.

### Data Sources

- Gap register.
- Evidence matrix.
- Source index.
- Review meeting notes.

### Human Review Requirements

- Confirm categorization and priority.
- Ensure legal or regulatory conclusions are not implied.
- Confirm gaps are described as evidence limitations, not compliance failures, unless legal review separately directs language.

### AI Opportunities

- Cluster gaps by product, supplier, document type, or owner.
- Draft neutral gap narratives.
- Identify repeated supplier response patterns.
- Suggest follow-up sequencing.

### Confidence Rating

High when gap evidence is complete and reviewer-approved. Medium when prioritization depends on assumptions. Low when gap scope is uncertain. Pending when source matching or client confirmation is incomplete.

### Traceability Requirements

- Each gap assessment statement must cite gap IDs and affected product or supplier IDs.
- Any regulatory relevance must cite `REG-CIT-###` placeholders or reviewed citations.

### Draft Template

```text
Gap category: [Documentation coverage / supplier response / SDS currency / declaration scope / regulatory citation / testing record / other]

Affected records:
- [GAP-###] [PROD-###] [SUP-###]

Assessment:
[Neutral statement describing the evidence limitation and its packet-readiness effect.]

Recommended remediation:
[Action, owner, timing, closure evidence needed.]

Confidence:
[High/Medium/Low/Pending] based on [source basis].
```

## 13. Risk Summary

### Purpose

Summarize evidence-readiness risks arising from missing, incomplete, conflicting, or low-confidence documentation.

### Required Inputs

- Gap assessment.
- Evidence matrix.
- Missing documentation register.
- Product and supplier criticality inputs, if provided by client.
- Regulatory placeholders or reviewed citations.

### Expected Outputs

- Evidence-readiness risk summary.
- Risk level or priority for follow-up.
- Basis for rating and confidence.
- Clear limitation that risk is not a legal compliance determination.

### Data Sources

- Gap assessment.
- Evidence matrix.
- Source index.
- Client business priority notes.
- Reviewer notes.

### Human Review Requirements

- Confirm risk language is tied to evidence readiness, not legal liability.
- Confirm risk ratings are defined in the packet.
- Confirm the basis for each risk rating is traceable.
- Escalate legal or regulatory interpretations for qualified review.

### AI Opportunities

- Draft risk summaries from gap categories.
- Check consistency between gap priority and risk summary.
- Identify products or suppliers with concentrated gaps.
- Flag conclusory language.

### Confidence Rating

Use a separate confidence rating for the evidence supporting each risk summary. Do not present risk level as a compliance conclusion.

### Traceability Requirements

- Each risk row must cite gap IDs, evidence IDs, source IDs, and affected product or supplier IDs.
- Regulatory relevance must cite placeholders or reviewed citations.

### Draft Template

```text
| Risk ID | Evidence-readiness risk | Affected products / suppliers | Basis | Risk priority | Confidence | Related gaps | Recommended response |
| --- | --- | --- | --- | --- | --- | --- | --- |
| RISK-001 | [Neutral risk statement] | PROD-### / SUP-### | EVID-### / GAP-### / SRC-### | [High/Medium/Low] | [High/Medium/Low/Pending] | GAP-### | [Action] |

Note:
Risk priority reflects evidence-readiness follow-up priority only. It is not a legal conclusion or regulatory determination.
```

## 14. Recommended Next Steps

### Purpose

Translate gaps and evidence-readiness risks into practical, sequenced actions for the client and suppliers.

### Required Inputs

- Gap assessment.
- Risk summary.
- Missing documentation register.
- Client priorities and deadlines.
- Supplier follow-up status.

### Expected Outputs

- Action plan with owners, timing, dependencies, and closure criteria.
- Optional supplier request list.
- Optional regulatory review queue.

### Data Sources

- Gap register.
- Risk summary.
- Client review meeting notes.
- Supplier correspondence log.

### Human Review Requirements

- Confirm action owners and timelines with client.
- Confirm technical or legal recommendations are within engagement scope.
- Confirm closure criteria are evidence-based.

### AI Opportunities

- Draft action plan from gaps and risks.
- Prioritize follow-up by affected product count, supplier criticality, and due dates.
- Draft supplier request language for human approval.
- Track open versus closed actions.

### Confidence Rating

High when actions are directly tied to reviewed gaps and client-confirmed priorities. Medium when priorities depend on assumptions. Pending when owner or timeline is not confirmed.

### Traceability Requirements

- Each action must cite related gap IDs, risk IDs, product IDs, supplier IDs, or regulatory placeholders.
- Closure criteria must identify the evidence needed to close the action.

### Draft Template

```text
| Action ID | Recommended action | Owner | Related gap / risk | Products / suppliers | Closure evidence needed | Target date | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ACTION-001 | [Action] | [Client / supplier / Liberty Tree / legal reviewer] | GAP-### / RISK-### | PROD-### / SUP-### | [DOC/SRC needed] | [Date] | [Open / In progress / Complete] |
```

## 15. Source Index

### Purpose

Provide the master index of sources supporting the packet so reviewers can reproduce each matrix entry and conclusion.

### Required Inputs

- All documents reviewed.
- Source files or links.
- Metadata from document inventory.
- Reviewer notes.
- Regulatory source placeholders or reviewed sources.

### Expected Outputs

- Source index table.
- Source IDs and document IDs.
- Custody, location, issue date, received date, and review status.
- Cross-reference to packet sections and evidence IDs.

### Data Sources

- Client data room.
- Email records.
- Supplier portals.
- Official regulatory sources.
- Liberty Tree review notes.

### Human Review Requirements

- Confirm source accessibility and file integrity.
- Confirm source title, issuer, and date.
- Confirm restricted or confidential source handling.
- Confirm all packet references resolve to index entries.

### AI Opportunities

- Extract source metadata.
- Identify unreferenced sources and unresolved references.
- Check source ID consistency.
- Draft index entries from document inventory.

### Confidence Rating

High when metadata and references are reviewed. Medium when metadata is partial. Pending when source access, review, or indexing is incomplete.

### Traceability Requirements

- Every source ID must be unique.
- Every evidence, gap, or regulatory citation row must resolve to a source index entry or explicit placeholder.
- Superseded sources must remain traceable if used historically.

### Draft Template

```text
| Source ID | Document ID | Source title | Source type | Issuer / custodian | Date issued | Date received / accessed | Location | Related sections | Review status | Confidentiality | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SRC-001 | DOC-001 | [Title] | [SDS / declaration / spec / test report / correspondence / regulatory source / reviewer note] | [Issuer] | [Date] | [Date] | [Data room path / URL / archive reference] | [Sections] | [Reviewed / Pending] | [Client confidential / public / TBD] | [Notes] |
```

## 16. Appendix Structure

### Purpose

Define the supporting appendix organization for documents, extracts, logs, and review records without overwhelming the main packet.

### Required Inputs

- Source index.
- Document inventory.
- Packet matrices.
- Reviewer notes.
- Client-required appendix preferences.

### Expected Outputs

- Appendix map.
- Appendix IDs.
- Appendix contents and cross-references.
- Packaging instructions for confidential or restricted records.

### Data Sources

- Source index.
- Document inventory.
- Data room folder structure.
- Review log.

### Human Review Requirements

- Confirm appendix contents match source index.
- Confirm confidential documents are handled according to client instructions.
- Confirm appendix does not include unnecessary sensitive records.
- Confirm all appendix references in main packet resolve.

### AI Opportunities

- Generate appendix map from source index.
- Identify sources referenced in the packet but missing from appendix map.
- Flag duplicate appendix entries.
- Draft appendix labels and cross-references.

### Confidence Rating

High when appendix map is complete and reviewed. Medium when pending client packaging instructions. Pending when source index is incomplete.

### Traceability Requirements

- Each appendix item must cite appendix ID, source ID, document ID, and related section.
- Main packet references must resolve to appendix IDs where included.

### Draft Template

```text
Appendix A - Source Index
Appendix B - Product Inventory Support
Appendix C - Supplier Inventory Support
Appendix D - Safety Data Sheets
Appendix E - Supplier Declarations
Appendix F - Product Specifications and Bills of Material
Appendix G - Analytical Records, if provided
Appendix H - Regulatory Source Placeholders or Reviewed Regulatory Sources
Appendix I - Correspondence and Request Logs
Appendix J - Review Notes and Quality Control Records

| Appendix ID | Appendix title | Included source IDs | Related packet sections | Confidentiality handling | Status |
| --- | --- | --- | --- | --- | --- |
| APP-A | Source Index | SRC-### | Section 15 | [Handling] | [Draft / Reviewed / Final] |
```

