# Liberty Tree PFAS Evidence Packet

## Purpose

The PFAS Evidence Packet is Liberty Tree's standard documentation framework for helping manufacturers organize source-indexed evidence related to PFAS compliance readiness.

The packet is not a legal opinion, regulatory certification, product certification, laboratory determination, or assurance that a product complies with any law. It is a structured evidence package that assembles client-provided and supplier-provided documentation, identifies gaps, and gives reviewers a traceable basis for follow-up.

## Deliverable Architecture

The standard packet is assembled in this order:

1. Cover Page
2. Executive Summary
3. Engagement Scope
4. Applicable Regulatory Framework
5. Product Inventory
6. Supplier Inventory
7. Document Inventory
8. SDS Review Matrix
9. Supplier Declaration Matrix
10. PFAS Evidence Matrix
11. Missing Documentation Register
12. Gap Assessment
13. Risk Summary
14. Recommended Next Steps
15. Source Index
16. Appendix Structure

Supporting files in this folder:

- [section-specifications.md](section-specifications.md): required purpose, inputs, outputs, sources, review rules, AI uses, confidence ratings, traceability requirements, and draft templates for every packet section.
- [packet-template.md](packet-template.md): a fillable client-facing draft packet.

## How Liberty Tree Prepares an Evidence Packet

Liberty Tree prepares the packet through a source-first workflow:

1. Confirm the engagement scope, products, markets, facilities, date range, and intended use of the packet.
2. Create a document control record with a packet ID, version, preparer, technical reviewer, client reviewer, and issue date.
3. Build the product, supplier, and document inventories from client-provided records.
4. Assign source IDs to every document, declaration, SDS, correspondence item, report, regulatory source, and reviewer note.
5. Extract structured data from SDSs, supplier declarations, product records, and relevant supporting documents.
6. Populate evidence matrices only with source-indexed entries.
7. Mark regulatory citations as placeholders until authoritative sources are selected and reviewed.
8. Identify missing documents, incomplete declarations, source conflicts, and records requiring human review.
9. Draft the gap assessment, risk summary, and recommended next steps using traceable evidence references.
10. Complete quality review, resolve reviewer comments, and issue a controlled packet version.

## Workflow

```text
Engagement scope
  -> source intake and source ID assignment
  -> product, supplier, and document inventories
  -> SDS and declaration review
  -> PFAS evidence matrix
  -> missing documentation register
  -> gap assessment and risk summary
  -> recommended next steps
  -> source index and appendices
  -> human quality review
  -> controlled issue
```

Each substantive statement in the packet should trace to at least one source ID, reviewer note, or explicit placeholder. If a statement cannot be traced, it should be removed, revised, or marked as a gap.

## Regulatory Citation Placeholders

The packet does not invent regulatory requirements. Where regulatory citations belong, use placeholders until the applicable authoritative source is identified and reviewed.

Recommended placeholder format:

```text
[REG-CIT-### | Jurisdiction: TBD | Topic: TBD | Authoritative source: TBD | Date accessed: TBD | Reviewer: TBD]
```

Authoritative sources to populate later may include:

- Official statutory or regulatory text from the applicable jurisdiction.
- Official agency guidance, rulemaking notices, compliance bulletins, or FAQs.
- Official registers, gazettes, or regulator-maintained program pages.
- Written scope direction supplied by client counsel or a qualified regulatory specialist.
- Client-approved market-entry, distribution, or product-use assumptions.

Any summary of a regulatory requirement must identify the source, access date, reviewer, and applicability rationale. If the authoritative source is not yet reviewed, the packet should say so plainly.

## Assumptions

- The client provides product lists, supplier lists, SDSs, supplier declarations, testing records, specifications, procurement records, and correspondence needed for review.
- The packet reflects the information available as of the issue date.
- Supplier statements are treated as evidence sources, not independently verified facts, unless separate verification is documented.
- The packet may include multiple jurisdictions or product families only when the engagement scope explicitly includes them.
- Analytical testing, legal interpretation, and regulatory certification are outside the packet unless separately scoped.
- AI-assisted extraction may be used to improve speed and consistency, but AI output is not accepted into the final packet without human review.

## Limitations

- This framework is not a legal opinion.
- This framework is not regulatory certification.
- This framework does not establish product compliance.
- This framework does not replace attorney review, regulator guidance, laboratory testing, supplier due diligence, or formal product certification.
- This framework does not determine whether PFAS are present unless supported by reviewed analytical records or other source-indexed evidence.
- Regulatory summaries remain placeholders until populated from authoritative sources and reviewed by a qualified human reviewer.

## Quality Standards

Liberty Tree evidence packets should meet the following standards:

- Source-indexed: every substantive claim links to a source ID, reviewer note, or placeholder.
- Current: source issue dates, received dates, version dates, and review dates are recorded.
- Bounded: scope limits are clear and repeated where conclusions could otherwise be overread.
- Evidence-weighted: supplier declarations, SDSs, specifications, and analytical reports are not treated as equivalent unless the basis is explained.
- Gap-aware: missing or incomplete records are logged instead of silently ignored.
- Reviewable: a third-party reviewer can reproduce how each conclusion was reached.
- Controlled: packet versions, changes, and reviewer approvals are documented.
- Conservative: uncertain, conflicting, or unsupported items are marked for follow-up.

## Review Process

Minimum review roles:

- Preparer: compiles sources, assigns IDs, populates inventories, drafts matrices, and records assumptions.
- Technical reviewer: checks source traceability, matrix logic, confidence ratings, and gap characterization.
- Client reviewer: confirms product scope, supplier relationships, document completeness, and factual business context.
- Regulatory or legal reviewer, when scoped: reviews regulatory citations, applicability analysis, and jurisdiction-specific language.

Recommended review stages:

1. Intake completeness check.
2. Source ID and inventory quality check.
3. Matrix extraction review.
4. Gap and risk calibration review.
5. Regulatory placeholder or citation review.
6. Final packet issue review.

No final packet should be issued with AI-generated conclusions that have not been reviewed by a human preparer or reviewer.

## Confidence Rating Standard

Use a section-level or line-item confidence rating where applicable:

- High: direct source evidence supports the entry, scope match is clear, and human review is complete.
- Medium: evidence is relevant but partial, indirect, dated, supplier-limited, or dependent on a documented assumption.
- Low: evidence is incomplete, conflicting, unverified, or insufficient for the intended use.
- Pending: authoritative source, supplier response, document, or human review is still outstanding.
- Not applicable: the section is administrative or structural rather than evidentiary.

Confidence ratings do not mean legal certainty or regulatory approval. They describe the strength and review status of the evidence packet record.

