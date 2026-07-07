# PFAS Evidence Packet Production Workflow

Document status: Production system design  
Date: July 7, 2026  
Scope: End-to-end workflow for producing a Liberty Tree PFAS Evidence Packet  
Start point: Client Intake  
End point: Final Human QA and Delivery

## Operating Assumptions

This workflow is designed for a fixed-price PFAS Evidence Packet engagement where Liberty Tree organizes source-indexed evidence for compliance readiness. The packet is not a legal opinion, regulatory certification, product certification, or analytical determination.

Baseline engagement assumptions:

- Product scope: one product family or defined SKU set.
- Supplier scope: approximately 10-30 suppliers.
- Document scope: approximately 100-300 documents.
- Source types: SDSs, supplier declarations, product specifications, bills of material where available, testing records where available, supplier correspondence, client records, and regulatory citation placeholders or reviewed citations.
- Expert review is the primary human labor. AI and software should reduce time spent on intake, classification, extraction, cross-referencing, drafting, and consistency checks.
- Supplier response time can dominate elapsed duration and should be tracked separately from Liberty Tree production time.

## Production Workflow

### 1. Client Intake

Objective: Capture the client's business context, product scope, intended use, deadlines, and known PFAS documentation pressure points.

Required inputs:

- Client contact and project owner.
- Product families, SKUs, materials, or components under review.
- Known customer, retailer, regulator, or market-driver request.
- Target delivery date.
- Known supplier list or procurement owner.
- Known documents already available.
- Engagement limitations and exclusions.

Outputs:

- Intake record.
- Preliminary scope summary.
- Initial product and supplier count estimate.
- Initial document request list.
- Open questions log.

AI responsibilities:

- Convert intake notes into structured fields.
- Identify missing intake fields.
- Draft initial scope summary.
- Suggest likely document categories based on product type.

Human responsibilities:

- Confirm intended use and engagement boundaries.
- Identify whether legal or regulatory review is separately scoped.
- Confirm commercial priority and delivery constraints.
- Approve the initial intake record.

Quality gates:

- Product scope is defined enough to assign product IDs.
- Client understands the packet is not legal advice or certification.
- Known deadlines and external drivers are documented.
- Missing intake information is logged.

Estimated time:

- Current: 1-2 hours human time.
- Optimized: 30-45 minutes human time after structured intake form.

Common failure modes:

- Scope is described as "all products" without a product list.
- Client expects a compliance conclusion rather than evidence organization.
- Deadline is driven by a customer request but the actual request is not provided.
- Legal review is assumed but not scoped.

Opportunities for automation:

- Web intake form with required fields.
- Intake completeness scoring.
- Auto-generated document request checklist.
- Auto-generated engagement scope draft.

### 2. Scope Confirmation And Engagement Controls

Objective: Convert intake into a controlled packet scope, document control record, version plan, and review responsibility model.

Required inputs:

- Intake record.
- Statement of work or engagement authorization.
- Product scope.
- Supplier scope.
- Jurisdiction or market assumptions, if any.
- Client reviewer and Liberty Tree reviewer names.

Outputs:

- Packet ID.
- Version and issue-status plan.
- Scope table.
- Exclusion list.
- Review role assignments.
- Traceability ID conventions for the engagement.

AI responsibilities:

- Draft the scope table.
- Identify ambiguous exclusions.
- Generate packet ID and ID ranges.
- Compare scope language against packet limitations.

Human responsibilities:

- Approve in-scope and out-of-scope items.
- Confirm whether the review is public-source, client-source, supplier-source, or mixed.
- Confirm review roles and escalation paths.

Quality gates:

- Packet ID assigned.
- In-scope and out-of-scope products are explicit.
- Client reviewer is identified.
- Legal/regulatory review status is documented as included, excluded, or pending.

Estimated time:

- Current: 1-2 hours.
- Optimized: 30-60 minutes.

Common failure modes:

- Jurisdiction is assumed but not confirmed.
- Components and finished goods are mixed without clear boundaries.
- Client wants one packet to answer multiple different customer requests.
- Review roles are left informal.

Opportunities for automation:

- Scope template generator.
- ID registry.
- Scope consistency checker.
- Automated exclusion prompts.

### 3. Data Room Setup And Source Capture

Objective: Establish a controlled location for all source materials and record source custody before evidence extraction begins.

Required inputs:

- Client documents.
- Supplier documents.
- Public source links, if used.
- Data room or shared drive access.
- File naming conventions.

Outputs:

- Controlled source folder.
- Source capture log.
- Original-file archive.
- Working-copy folder.
- Source ID assignment queue.

AI responsibilities:

- Propose file classifications.
- Detect duplicate files and likely superseded versions.
- Extract candidate metadata from file names and documents.
- Flag missing issue dates, titles, or owners.

Human responsibilities:

- Confirm access permissions and confidentiality handling.
- Confirm source capture method.
- Resolve duplicate or conflicting files.
- Approve source archive structure.

Quality gates:

- Original sources are preserved.
- Each source has custody, access date, and storage location.
- Public sources are captured as PDF, screenshot, or archived reference where practical.
- Confidential sources are marked.

Estimated time:

- Current: 3-6 hours.
- Optimized: 1-2 hours.

Common failure modes:

- Files arrive through email, portal, and shared drives with no central control.
- Public links change after review.
- Duplicate SDSs are treated as separate evidence.
- Confidential files are mixed with public sources.

Opportunities for automation:

- Source ingestion portal.
- File hash generation.
- Duplicate detection.
- Auto-generated source capture log.
- Public-page snapshot capture.

### 4. Product Inventory Creation

Objective: Build the controlled list of products, SKUs, components, materials, or product families covered by the packet.

Required inputs:

- Client product list.
- SKU or part-number export.
- Product descriptions.
- Bills of material, if available.
- Scope table.

Outputs:

- Product inventory.
- Product IDs.
- Product-to-document links where available.
- Product scope status.
- Product inventory gaps.

AI responsibilities:

- Normalize product names.
- Detect duplicate SKUs or naming conflicts.
- Propose product family grouping.
- Match products to documents and SDS candidates.

Human responsibilities:

- Confirm which products are in scope.
- Confirm whether the review covers finished goods, components, or both.
- Resolve retired, renamed, or region-specific products.

Quality gates:

- Every in-scope product has a product ID.
- Product list is client-confirmed or marked pending.
- Product-to-document assumptions are not accepted without evidence.
- Unknown products are logged as gaps.

Estimated time:

- Current: 3-8 hours depending on SKU count.
- Optimized: 1-3 hours.

Common failure modes:

- Product names differ across SDSs, ERPs, and supplier declarations.
- SKU families are mistaken for individual products.
- Product scope changes after evidence review starts.
- Bills of material are unavailable or outdated.

Opportunities for automation:

- SKU normalization.
- Product-family clustering.
- Product-to-document matching.
- Product inventory completeness scoring.

### 5. Supplier Inventory And Relationship Mapping

Objective: Build the controlled supplier inventory and connect suppliers to products, materials, documents, and follow-up actions.

Required inputs:

- Supplier master list.
- Approved vendor list.
- Procurement records.
- Product-to-supplier mapping.
- Supplier contacts.
- Existing supplier declarations.

Outputs:

- Supplier inventory.
- Supplier IDs.
- Supplier-product relationship table.
- Supplier contact list.
- Supplier documentation status.

AI responsibilities:

- Normalize supplier names.
- Identify duplicate supplier records.
- Map supplier names across documents and procurement exports.
- Flag distributor-versus-manufacturer ambiguity.

Human responsibilities:

- Confirm supplier roles.
- Confirm correct follow-up contacts.
- Resolve parent/subsidiary naming issues.
- Approve supplier outreach list.

Quality gates:

- Each supplier has a supplier ID.
- Each supplier-product relationship has a source basis or is marked pending.
- Supplier contacts are verified before outreach.
- Missing supplier mapping is logged.

Estimated time:

- Current: 3-8 hours.
- Optimized: 1-3 hours.

Common failure modes:

- Distributor is mistaken for manufacturer.
- Supplier declaration covers the company but not the specific product.
- Procurement data is stale.
- Supplier contact is not the person authorized to provide PFAS documentation.

Opportunities for automation:

- Supplier deduplication.
- Supplier role classification.
- Product-supplier graph.
- Supplier contact validation queue.

### 6. Document Inventory And Classification

Objective: Index every reviewed or requested document and classify it for extraction, review, and packet assembly.

Required inputs:

- Source archive.
- Product inventory.
- Supplier inventory.
- Document type definitions.
- Source capture log.

Outputs:

- Document inventory.
- Document IDs and source IDs.
- Document type classification.
- Document-product and document-supplier relationships.
- Document review status.

AI responsibilities:

- Classify documents by type.
- Extract title, issuer, issue date, revision date, product name, supplier name, and document number.
- Propose product and supplier relationships.
- Flag missing metadata and unreadable files.

Human responsibilities:

- Approve document classifications.
- Confirm document relevance.
- Resolve superseded documents.
- Confirm whether each document is adequate for evidence extraction.

Quality gates:

- Every reviewed document has a document ID and source ID.
- Document metadata is complete or marked pending.
- Superseded or duplicate documents are identified.
- No substantive evidence is used from an unindexed document.

Estimated time:

- Current: 6-12 hours.
- Optimized: 2-4 hours.

Common failure modes:

- Unindexed documents are used in narrative sections.
- SDSs are mismatched to products.
- Old declarations are accepted as current.
- Correspondence is not indexed but influences conclusions.

Opportunities for automation:

- Document classification model.
- Metadata extraction.
- Duplicate and supersession detection.
- Source-to-evidence relationship builder.

### 7. Regulatory Scope Framing And Citation Queue

Objective: Create a controlled queue for regulatory citations and applicability questions without inventing regulatory conclusions.

Required inputs:

- Engagement scope.
- Market and distribution assumptions.
- Product categories.
- Client customer request, if any.
- Official regulatory sources, if already identified.
- Legal/regulatory review scope.

Outputs:

- Regulatory citation queue.
- Regulatory placeholders.
- Applicability question list.
- Legal/regulatory review status.
- Prohibited-claims reminders.

AI responsibilities:

- Maintain citation placeholders.
- Extract citation metadata from selected authoritative sources.
- Draft reviewer questions.
- Flag unsupported regulatory language.

Human responsibilities:

- Decide whether regulatory review is in scope.
- Select authoritative sources.
- Confirm whether a qualified legal or regulatory reviewer is required.
- Approve any requirement summary before use.

Quality gates:

- No requirement is summarized without authoritative source and review status.
- "Citation observed" is separated from "citation applicable."
- Jurisdiction and market assumptions are explicit.
- Legal conclusions are excluded unless separately reviewed.

Estimated time:

- Current: 2-6 hours plus legal review if scoped.
- Optimized: 1-2 hours plus legal review if scoped.

Common failure modes:

- Public guidance is treated as binding requirement.
- SDS regulatory text is applied to product without review.
- State, federal, international, retailer, and customer requirements are mixed.
- Effective dates and product categories are not checked.

Opportunities for automation:

- Regulatory citation queue.
- Placeholder generator.
- Source authority classifier.
- Prohibited-claims checker.

### 8. Supplier Request Preparation And Outreach

Objective: Prepare controlled supplier requests for missing PFAS declarations, SDS confirmations, formulation clarifications, and supporting evidence.

Required inputs:

- Supplier inventory.
- Product inventory.
- Missing document categories.
- Client-approved request language.
- Supplier contact list.
- Legal/regulatory scope constraints.

Outputs:

- Supplier request package.
- Supplier request log.
- Requested evidence list.
- Follow-up schedule.
- Response status tracker.

AI responsibilities:

- Draft product-specific request language.
- Generate supplier-specific request tables.
- Identify missing declaration fields.
- Summarize supplier response status.

Human responsibilities:

- Approve request language.
- Confirm supplier contacts.
- Send or authorize outreach.
- Handle supplier pushback and confidentiality constraints.

Quality gates:

- Requests identify exact products and SKUs.
- Requested declaration scope and definitions are clear.
- Supplier response authority is requested.
- Outreach is logged with dates and owners.

Estimated time:

- Current: 4-10 hours plus supplier response time.
- Optimized: 1-3 hours plus supplier response time.

Common failure modes:

- Generic supplier declaration request does not cover products in scope.
- Supplier responds with a broad corporate policy but no product-specific evidence.
- Supplier asks for NDA before sharing formulation details.
- Follow-up dates are not tracked.

Opportunities for automation:

- Supplier request generator.
- Email merge from product-supplier table.
- Response tracker.
- Supplier portal for uploads.
- Automated reminder schedule.

### 9. SDS Extraction And Review

Objective: Extract structured SDS observations and determine whether each SDS can support product-specific evidence readiness.

Required inputs:

- SDS documents.
- Product inventory.
- Supplier inventory.
- Document inventory.
- SDS review criteria.

Outputs:

- SDS review matrix.
- SDS-product match status.
- Extracted SDS metadata.
- PFAS-relevant term review.
- SDS-related gaps.

AI responsibilities:

- Extract SDS title, product code, supplier, issue date, revision date, sections, hazardous ingredients, regulatory references, and relevant terms.
- Propose product matches.
- Flag outdated, missing, or mismatched SDSs.
- Identify PFAS-relevant terminology for human review.

Human responsibilities:

- Confirm SDS-product match.
- Review extracted text against the source.
- Decide whether SDS limitations require follow-up.
- Ensure SDS silence is not treated as PFAS absence.

Quality gates:

- Each SDS row cites document ID, source ID, and page/section location.
- Product match is confirmed or marked pending.
- Extracted observations are reviewed.
- SDS-based conclusions remain limited.

Estimated time:

- Current: 8-20 hours.
- Optimized: 2-6 hours.

Common failure modes:

- SDS title resembles product name but covers a different SKU.
- Hazardous ingredient table is mistaken for full formulation.
- Absence of PFAS terms is overread.
- Regulatory statements are treated as compliance conclusions.

Opportunities for automation:

- SDS parser.
- Product-code matching.
- PFAS term scanner.
- Section-level citation extraction.
- SDS freshness dashboard.

### 10. Supplier Declaration Extraction And Review

Objective: Extract and evaluate supplier declarations for product scope, PFAS language, definitions, authority, limitations, and date status.

Required inputs:

- Supplier declarations.
- Supplier inventory.
- Product inventory.
- Declaration request language.
- Document inventory.

Outputs:

- Supplier declaration matrix.
- Declaration coverage map.
- Declaration limitations.
- Declaration-related gaps.
- Follow-up questions.

AI responsibilities:

- Extract issuer, date, signatory, covered products, PFAS definitions, exclusions, limitations, expiration date, and statement language.
- Compare declaration coverage against product inventory.
- Flag missing signature, vague scope, outdated declarations, and definition mismatches.

Human responsibilities:

- Confirm declaration authenticity and product coverage.
- Evaluate whether limitations are material.
- Approve follow-up questions.
- Avoid converting supplier statements into compliance certification.

Quality gates:

- Each declaration cites source and document IDs.
- Product coverage is explicit.
- Definitions and limitations are preserved.
- Confidence rating reflects evidence strength.

Estimated time:

- Current: 6-16 hours.
- Optimized: 2-5 hours.

Common failure modes:

- Supplier declaration covers "all products" without SKU list.
- Definition of PFAS differs from customer or regulatory scope.
- Declaration is unsigned or stale.
- Supplier declaration is treated as independently verified fact.

Opportunities for automation:

- Declaration parser.
- Product coverage checker.
- Definition comparison.
- Expiration and renewal tracker.
- Supplier declaration scorecard.

### 11. Supporting Evidence Review

Objective: Review non-SDS and non-declaration evidence such as specifications, BOMs, testing records, procurement records, certifications, and correspondence.

Required inputs:

- Product specifications.
- Bills of material.
- Testing records, if provided.
- Certifications or customer forms.
- Procurement records.
- Relevant correspondence.
- Document inventory.

Outputs:

- Supporting evidence entries.
- Evidence weight notes.
- Test record status, if applicable.
- Additional gaps.
- Reviewer notes.

AI responsibilities:

- Extract product identifiers, material identifiers, dates, issuer, method names, and relevant claims.
- Match supporting documents to products and suppliers.
- Flag unsupported claims, missing method details, and inconsistent dates.

Human responsibilities:

- Assess evidence relevance and weight.
- Decide whether testing records are in scope and adequate.
- Confirm whether correspondence should be treated as source evidence.
- Escalate technical questions.

Quality gates:

- Each supporting document has a source ID.
- Analytical records include method, lab, date, sample identity, and scope if used.
- Correspondence used as evidence is indexed.
- Evidence weight is documented.

Estimated time:

- Current: 4-12 hours.
- Optimized: 1-4 hours.

Common failure modes:

- BOM is outdated or partial.
- Testing report sample does not match product.
- Certification is not product-specific.
- Email statements are used without source control.

Opportunities for automation:

- Document-type extraction templates.
- Test report metadata extraction.
- Product/sample matching.
- Evidence-weight suggestion engine.

### 12. Evidence Matrix Assembly

Objective: Build the central crosswalk between products, suppliers, documents, source locations, evidence statements, confidence ratings, gaps, and actions.

Required inputs:

- Product inventory.
- Supplier inventory.
- Document inventory.
- SDS review matrix.
- Supplier declaration matrix.
- Supporting evidence entries.
- Regulatory citation queue.
- Reviewer notes.

Outputs:

- PFAS evidence matrix.
- Evidence IDs.
- Confidence ratings.
- Product/supplier/source crosswalk.
- Evidence-to-gap links.

AI responsibilities:

- Assemble candidate evidence rows.
- Link product, supplier, document, source, citation, gap, and action IDs.
- Propose confidence ratings.
- Flag contradictions and unlinked evidence.

Human responsibilities:

- Approve evidence statements.
- Confirm confidence ratings.
- Resolve conflicts.
- Remove unsupported or overbroad statements.

Quality gates:

- Every row has evidence ID, product ID, source ID, review status, and confidence rating.
- Every substantive evidence statement has pinpoint source location.
- No unreviewed AI-generated conclusion remains.
- Contradictions are either resolved or converted into gaps.

Estimated time:

- Current: 6-14 hours.
- Optimized: 2-5 hours.

Common failure modes:

- Evidence statement summarizes more than source supports.
- Confidence rating is too high.
- Gaps are not linked to evidence rows.
- Regulatory placeholders are treated as reviewed citations.

Opportunities for automation:

- Evidence matrix builder.
- Cross-reference validator.
- Confidence-rating suggestion.
- Missing-link detection.
- Contradiction detection.

### 13. Missing Documentation Register And Follow-Up Loop

Objective: Convert missing, incomplete, conflicting, or low-confidence records into controlled work items with owners and closure evidence.

Required inputs:

- Evidence matrix.
- Document inventory.
- Product inventory.
- Supplier inventory.
- Supplier request log.
- Reviewer notes.

Outputs:

- Missing documentation register.
- Gap IDs.
- Owner, priority, due date, and status.
- Closure evidence criteria.
- Follow-up queue.

AI responsibilities:

- Detect missing document classes.
- Draft gap descriptions.
- Link gaps to products, suppliers, evidence rows, and actions.
- Identify stale supplier requests.

Human responsibilities:

- Confirm gaps are real.
- Prioritize gaps by business and evidence-readiness impact.
- Assign owners.
- Close gaps only when replacement evidence is indexed and reviewed.

Quality gates:

- Every gap has affected products or suppliers.
- Every gap has closure evidence.
- Priority has rationale.
- Closed gaps cite resolving source IDs.

Estimated time:

- Current: 3-8 hours plus follow-up time.
- Optimized: 1-3 hours plus follow-up time.

Common failure modes:

- Missing document is actually present under another name.
- Gap is closed based on verbal assurance.
- Owner is unclear.
- Supplier follow-up is not tracked.

Opportunities for automation:

- Gap detector.
- Supplier reminder engine.
- Gap-to-action generator.
- Closure evidence validator.

### 14. Gap Assessment And Evidence-Readiness Risk Summary

Objective: Convert gap data into a neutral assessment of evidence-readiness limits, follow-up priorities, and decision constraints.

Required inputs:

- Missing documentation register.
- Evidence matrix.
- Product and supplier inventories.
- Regulatory citation queue.
- Client business priorities.
- Reviewer notes.

Outputs:

- Gap assessment.
- Evidence-readiness risk summary.
- Risk IDs.
- Priority rationale.
- Decision impact notes.

AI responsibilities:

- Cluster gaps by product, supplier, document type, and blocked decision.
- Draft neutral gap narratives.
- Propose evidence-readiness risk summaries.
- Flag language that sounds like legal conclusion.

Human responsibilities:

- Calibrate risk priority.
- Confirm business decision impact.
- Approve wording.
- Escalate legal/regulatory interpretation.

Quality gates:

- Risk is framed as evidence-readiness risk unless expert review expands scope.
- Each risk cites gap IDs and evidence IDs.
- Legal and regulatory risk statements are not made without qualified review.
- Gaps are framed as actionable value, not failure.

Estimated time:

- Current: 4-8 hours.
- Optimized: 1-3 hours.

Common failure modes:

- Documentation gap is described as compliance failure.
- Risk priority is not tied to evidence.
- Business impact is assumed.
- Regulatory exposure is implied without review.

Opportunities for automation:

- Gap clustering.
- Risk summary drafting.
- Prohibited language scanner.
- Priority rationale generator.

### 15. Recommended Next Steps And Action Plan

Objective: Translate gaps and evidence-readiness risks into sequenced actions with owners, dependencies, and closure criteria.

Required inputs:

- Gap assessment.
- Risk summary.
- Missing documentation register.
- Supplier request status.
- Client timelines.
- Legal/regulatory review queue.

Outputs:

- Recommended next steps.
- Action IDs.
- Sequence and dependency map.
- Closure evidence requirements.
- Optional supplier request packet.

AI responsibilities:

- Draft action table.
- Identify dependencies and parallel workstreams.
- Map actions to gaps and risks.
- Draft supplier follow-up language for human approval.

Human responsibilities:

- Approve action priority.
- Confirm owners and timelines.
- Decide whether testing, legal review, or supplier escalation is required.
- Calibrate client-facing recommendations.

Quality gates:

- Every action links to a gap, risk, product, supplier, or regulatory placeholder.
- Closure evidence is explicit.
- No action assumes legal conclusion.
- Client can understand what to do next.

Estimated time:

- Current: 2-5 hours.
- Optimized: 45-90 minutes.

Common failure modes:

- Actions are generic.
- Closure criteria are vague.
- Legal review and supplier follow-up are not sequenced.
- Client owner is not identified.

Opportunities for automation:

- Action-plan generator.
- Dependency mapping.
- Supplier request drafting.
- Client task export.

### 16. Packet Drafting And Assembly

Objective: Assemble the packet sections, matrices, source index, appendices, executive summary, limitations, and document control materials into a coherent deliverable.

Required inputs:

- Packet template.
- Product inventory.
- Supplier inventory.
- Document inventory.
- SDS review matrix.
- Supplier declaration matrix.
- Evidence matrix.
- Missing documentation register.
- Gap assessment.
- Risk summary.
- Action plan.
- Source index.
- Regulatory citation queue.

Outputs:

- Draft evidence packet.
- Executive summary or buyer-facing memo.
- Source index.
- Appendix map.
- QA checklist draft.
- Draft delivery bundle.

AI responsibilities:

- Assemble sections from approved structured data.
- Draft executive summary from reviewed evidence.
- Check internal references.
- Flag unsupported claims, missing IDs, and inconsistent counts.

Human responsibilities:

- Review packet narrative.
- Confirm executive summary is conservative and useful.
- Confirm appendices and source index resolve.
- Approve draft for expert review.

Quality gates:

- Packet includes all required sections or explains omissions.
- Every substantive statement is traceable.
- Counts match across sections.
- No placeholders are hidden.
- Limitations are visible and accurate.

Estimated time:

- Current: 6-12 hours.
- Optimized: 2-4 hours.

Common failure modes:

- Narrative drifts beyond matrix evidence.
- Counts differ between executive summary and inventories.
- Appendix references do not resolve.
- Draft sounds generic rather than client-specific.

Opportunities for automation:

- Packet generator.
- Cross-reference checker.
- Count consistency checker.
- Prohibited-claims scanner.
- Appendix map builder.

### 17. Expert Review And Client Factual Review

Objective: Conduct technical, regulatory/legal where scoped, and client factual review before final QA.

Required inputs:

- Draft packet.
- QA checklist.
- Source bundle.
- Evidence matrix.
- Gap register.
- Regulatory citation queue.
- Client factual context.

Outputs:

- Expert review comments.
- Client factual corrections.
- Regulatory/legal review notes, if scoped.
- Resolved issue log.
- Revised draft.

AI responsibilities:

- Prepare review packets by role.
- Summarize reviewer comments.
- Track unresolved issues.
- Check whether revisions create new traceability issues.

Human responsibilities:

- Technical reviewer checks evidence, source locations, confidence ratings, and gap logic.
- Client reviewer confirms factual business context.
- Legal/regulatory reviewer reviews citations and applicability if scoped.
- Preparer resolves comments.

Quality gates:

- Technical review completed.
- Client factual review completed or documented as pending.
- Regulatory/legal review status is explicit.
- All material comments are resolved, deferred, or logged.

Estimated time:

- Current: 6-16 hours across reviewers.
- Optimized: 3-8 hours across reviewers.

Common failure modes:

- Client changes product scope late.
- Expert reviewer finds unsupported evidence statements.
- Legal review is requested after packet drafting.
- Comments are resolved in narrative but not matrices.

Opportunities for automation:

- Role-specific review dashboards.
- Comment tracker.
- Revision impact checker.
- Evidence-to-comment mapping.

### 18. Final Human QA And Delivery

Objective: Complete final quality assurance, freeze the controlled packet version, and deliver the packet with clear limitations and source bundle status.

Required inputs:

- Revised packet.
- Resolved issue log.
- QA checklist.
- Source index.
- Appendix map.
- Delivery instructions.
- Final reviewer approval.

Outputs:

- Final PFAS Evidence Packet.
- Final source index.
- Final matrices and registers.
- Appendix or source bundle map.
- Delivery note.
- Internal closeout record.

AI responsibilities:

- Run final consistency checks.
- Check unresolved placeholders.
- Check ID references and broken links.
- Generate delivery-note draft.
- Confirm no prohibited claims appear.

Human responsibilities:

- Perform final QA.
- Approve delivery version.
- Confirm limitations are visible.
- Deliver packet to client.
- Archive final version and closeout record.

Quality gates:

- Final QA checklist complete.
- All source IDs resolve.
- All gaps are open, closed, or deferred with status.
- Regulatory review status is explicit.
- Packet does not claim compliance, certification, or legal advice unless separately reviewed and scoped.
- Delivery bundle matches packet version.

Estimated time:

- Current: 3-6 hours.
- Optimized: 1-2 hours.

Common failure modes:

- Final packet differs from reviewed draft.
- Source bundle omits a cited source.
- Placeholder text remains hidden in narrative.
- Delivery email overstates the packet's purpose.

Opportunities for automation:

- Final QA validator.
- ID resolution checker.
- Deliverable manifest generator.
- Version freeze and archive workflow.

## Reusable Artifacts

### Client And Scope Artifacts

- Client intake form.
- Engagement scope template.
- Product scope confirmation form.
- Jurisdiction and market assumptions worksheet.
- Exclusion register.
- Packet document control page.
- Review role assignment table.

### Source And Inventory Artifacts

- Source capture log.
- Source index.
- Evidence room map.
- Document inventory.
- Product inventory.
- Supplier inventory.
- Product-supplier relationship map.
- Document classification taxonomy.
- Note index and reviewer note register.

### Supplier Artifacts

- Supplier request email template.
- Supplier PFAS declaration request template.
- SDS confirmation request template.
- Formulation clarification request template.
- Supplier follow-up tracker.
- Supplier response log.
- Supplier escalation template.

### Review Matrices And Registers

- SDS review matrix.
- Supplier declaration matrix.
- Supporting evidence review matrix.
- PFAS evidence matrix.
- Missing documentation register.
- Gap assessment template.
- Evidence-readiness risk summary.
- Recommended next steps/action plan.
- Regulatory citation queue.
- Regulatory review question list.
- Confidence rating rubric.

### Packet And Delivery Artifacts

- Cover page.
- Executive memo.
- Executive summary.
- Evidence coverage dashboard.
- Source-indexed packet template.
- Appendix structure.
- QA checklist.
- Prohibited-claims checklist.
- Delivery note.
- Closeout record.
- Version archive manifest.

## Software Candidates Versus Human-Driven Components

### Should Eventually Become Software

| Component | Why software helps | Human role after software |
| --- | --- | --- |
| Intake form and completeness scoring | Standardizes scope and reduces missing setup information | Confirm scope and resolve exceptions |
| Packet ID and ID registry | Prevents duplicate IDs and broken references | Approve packet controls |
| Source ingestion and capture log | Improves reproducibility and reduces manual indexing | Confirm source custody and confidentiality |
| Document classifier | Speeds document inventory creation | Approve classifications and resolve edge cases |
| Metadata extractor | Reduces manual extraction from SDSs, declarations, and reports | Verify extracted metadata |
| Product and supplier matcher | Connects names across ERPs, SDSs, declarations, and correspondence | Resolve ambiguous matches |
| SDS parser | Extracts section-level evidence and citations | Confirm product applicability and interpretation limits |
| Supplier declaration parser | Extracts scope, definitions, dates, and limitations | Evaluate declaration quality |
| Evidence matrix builder | Assembles crosswalks from reviewed inventories | Approve evidence statements and confidence |
| Missing documentation detector | Finds coverage gaps quickly | Confirm gaps and prioritize |
| Regulatory citation queue manager | Controls placeholders and review status | Qualified reviewer handles interpretation |
| Cross-reference validator | Finds broken IDs and inconsistent counts | Resolve flagged issues |
| Prohibited-claims scanner | Reduces overclaim risk | Approve final wording |
| QA checklist tracker | Makes review status visible and repeatable | Complete expert review |
| Deliverable manifest generator | Ensures delivery bundle matches packet version | Approve final delivery |

### Should Remain Human-Driven

| Component | Why it remains human-driven | AI/software support |
| --- | --- | --- |
| Engagement scoping judgment | Scope depends on client intent, risk tolerance, and commercial context | Draft scope and highlight ambiguities |
| Client expectation management | Requires judgment, trust, and calibration | Provide talking points and limitation language |
| Supplier relationship handling | Suppliers may resist, negotiate, or require confidentiality handling | Draft request language and track status |
| Evidence weight decisions | Evidence strength depends on source context and technical meaning | Suggest confidence ratings and flag conflicts |
| Gap priority calibration | Priority depends on business use and client deadlines | Cluster and draft gap narratives |
| Legal and regulatory applicability | Requires qualified review and may be legal advice | Maintain citation queue and source packets |
| Technical interpretation of testing | Requires method, sample, and product context | Extract metadata and flag missing fields |
| Final executive judgment | The packet must be useful without overclaiming | Draft summaries and detect unsupported claims |
| Final human QA | Delivery accountability belongs to Liberty Tree | Run automated checks and issue manifests |

## Time And Labor Estimates

### Current Workflow Duration

Current workflow duration without mature software:

- Liberty Tree production time after receiving core documents: 10-15 business days.
- Typical elapsed duration including supplier follow-up: 3-6 weeks.
- Faster diagnostic using public/client documents only: 5-8 business days.

Primary bottlenecks:

- Product and supplier scope cleanup.
- Document inventory and source control.
- SDS/declaration extraction.
- Supplier response delay.
- Expert review and revisions.

### Optimized Liberty Tree Workflow Duration

Optimized workflow duration with reusable artifacts and AI-assisted production:

- Liberty Tree production time after receiving core documents: 4-7 business days.
- Typical elapsed duration including supplier follow-up: 2-4 weeks.
- Faster diagnostic using public/client documents only: 2-4 business days.

Optimization assumptions:

- Structured intake is used.
- Source ingestion and document classification are semi-automated.
- SDS and declaration extraction are AI-assisted.
- Evidence matrix, gap register, and action plan are generated from structured data.
- Expert review focuses on exceptions, confidence, and final wording rather than manual assembly.

### Human Hours Before AI

Estimated human hours before AI for baseline engagement:

| Workstream | Hours |
| --- | ---: |
| Intake and scope control | 3-5 |
| Data room and source indexing | 6-10 |
| Product and supplier inventory | 8-16 |
| Document classification | 8-14 |
| SDS review | 12-24 |
| Supplier declaration review | 10-20 |
| Supporting evidence review | 6-14 |
| Evidence matrix assembly | 8-16 |
| Gap register and risk summary | 6-12 |
| Action plan and executive summary | 4-8 |
| Packet assembly | 8-14 |
| Expert/client review support | 8-18 |
| Final QA and delivery | 4-8 |
| Total | 91-179 |

Practical fixed-price planning range before AI: 90-140 human hours for a moderately scoped packet, excluding long supplier wait time.

### Human Hours After AI

Estimated human hours after AI-assisted workflow:

| Workstream | Hours |
| --- | ---: |
| Intake and scope control | 1-2 |
| Data room and source indexing | 2-4 |
| Product and supplier inventory | 2-6 |
| Document classification | 2-4 |
| SDS review | 4-8 |
| Supplier declaration review | 3-7 |
| Supporting evidence review | 2-5 |
| Evidence matrix assembly | 2-4 |
| Gap register and risk summary | 2-4 |
| Action plan and executive summary | 1-3 |
| Packet assembly | 2-4 |
| Expert/client review support | 5-12 |
| Final QA and delivery | 1-3 |
| Total | 29-66 |

Practical fixed-price planning range after AI: 32-50 human hours for a moderately scoped packet, excluding supplier wait time.

Expert review becomes the dominant human labor:

- Technical evidence review: 8-16 hours.
- Legal/regulatory review, if scoped: 3-10 hours.
- Client factual review support: 2-6 hours.
- Final QA and delivery approval: 1-3 hours.

## Repeatability And Scalability

### Current State

Repeatability score: 6.5/10

Rationale: The packet framework is repeatable, but production still depends on manual source indexing, extraction, cross-referencing, and reviewer discipline.

Scalability score: 5.5/10

Rationale: Manual workflows can support initial engagements but will strain as product count, supplier count, and document volume increase.

### Optimized Liberty Tree Workflow

Repeatability score: 9/10

Rationale: With structured intake, source capture controls, reusable matrices, automated cross-reference validation, and QA checklists, the workflow can be delivered consistently across clients.

Scalability score: 8.5/10

Rationale: AI-assisted extraction and software-managed matrices make portfolio-scale packets feasible. Human bottlenecks remain for scope judgment, evidence weight, supplier escalation, legal/regulatory interpretation, and final QA.

## Fixed-Price Engagement Feasibility

Liberty Tree can realistically support fixed-price PFAS Evidence Packet engagements if the offer is scoped around evidence organization and expert review rather than open-ended compliance determination.

Fixed-price viability is strongest when:

- Product and supplier count bands are defined.
- Document volume limits are included.
- Supplier outreach rounds are capped.
- Legal/regulatory review is clearly included, excluded, or separately priced.
- Analytical testing is excluded or separately priced.
- Late scope changes trigger change orders.
- The packet delivers gaps, action plans, and source-indexed evidence rather than compliance certification.

Recommended fixed-price structure:

| Tier | Best for | Production assumption | Human hours after AI |
| --- | --- | --- | ---: |
| Diagnostic packet | One product family, limited supplier set, existing documents only | No supplier outreach beyond request drafting | 20-35 |
| Standard evidence packet | Defined product/SKU set, supplier outreach, SDS/declaration review | One outreach cycle and expert technical QA | 32-50 |
| Expanded portfolio packet | Multiple product families or higher document volume | Requires software-assisted portfolio tracking | 50-90 |
| Legal/regulatory add-on | Jurisdiction-specific applicability review | Qualified reviewer required | Separately scoped |

Conclusion: The optimized workflow can support fixed-price engagements in the $7.5k-$20k range when expert review is the primary human labor and the production system handles document operations, extraction, source indexing, matrix assembly, and QA checks. The business model becomes weaker if Liberty Tree accepts uncapped supplier follow-up, unclear product scope, or implied legal conclusions.

