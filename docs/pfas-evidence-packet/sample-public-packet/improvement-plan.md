# PFAS Sample Packet Improvement Plan

Source QA artifact: `qa-review.md`  
Plan status: Backlog and roadmap only. Existing packet deliverables are not modified by this plan.  
Plan date: July 7, 2026

## Objective

Turn the QA review into a product-improvement backlog for the sample PFAS Evidence Packet. The goal is to make the sample credible as a paid Liberty Tree deliverable without weakening the conservative evidence posture.

The target buyer reaction for the revised packet is:

"This is a controlled evidence file that makes uncertainty useful, gives my team next steps, and can be reviewed by EHS, legal, procurement, QA, and customer-response teams without losing the thread."

## Scoring Scale

Implementation effort:

- Low: can be completed in a short editing pass.
- Medium: requires schema updates, source review, or coordinated packet changes.
- High: requires expert review, source capture workflow, or cross-file restructuring.

Impact:

- Low: improves polish but not core buyer trust.
- Medium: materially improves usefulness or repeatability.
- High: materially changes buyer confidence, reviewability, or delivery leverage.

Delivery path:

- AI can solve: can be drafted or implemented by AI from existing packet sources, then spot checked.
- AI + expert: AI can structure or draft, but expert review is required before use.
- Expert only: requires qualified legal, regulatory, technical, or client-context judgment.

## Improvement Backlog

### IMP-001: Add Pinpoint Citations

Underlying weakness: Evidence currently cites source IDs but not precise page numbers, SDS sections, web page sections, table fields, or short source excerpts.

Why it reduces buyer confidence: A buyer or reviewer must hunt inside source documents to verify claims. That makes the packet feel less audit-ready and less premium.

Classification: evidence, process, workflow

Delivery path: AI + expert

Implementation effort: High

Impact on buyer confidence: High

Impact on repeatability: High

Impact on scalability: High

Notes: AI can propose citation locations and source excerpts. A human reviewer must confirm each citation against the source.

### IMP-002: Add Formal Document Control And Review Signoff

Underlying weakness: The packet lacks a controlled cover or review page with preparer, technical reviewer, QA reviewer, review dates, issue status, exceptions, and approval status.

Why it reduces buyer confidence: Premium buyers expect visible controls. Without signoff, the packet feels like a draft artifact rather than a governed consulting deliverable.

Classification: process, presentation, workflow

Delivery path: AI can solve

Implementation effort: Low

Impact on buyer confidence: High

Impact on repeatability: High

Impact on scalability: Medium

Notes: Use a standard packet control table that can become part of every future Liberty Tree evidence packet.

### IMP-003: Add Buyer-Facing Executive Memo

Underlying weakness: The executive summary is accurate but too brief to explain the business value, decision path, and meaning of the gaps.

Why it reduces buyer confidence: Buyers may see a documentation inventory instead of a decision-support product worth paying for.

Classification: content, presentation

Delivery path: AI + expert

Implementation effort: Medium

Impact on buyer confidence: High

Impact on repeatability: Medium

Impact on scalability: Medium

Notes: The memo should explain what is known, what is unknown, what decisions are blocked, and what the buyer should do next.

### IMP-004: Add Source Capture Controls

Underlying weakness: The source index lists URLs but does not document downloaded file names, archived file paths, capture dates, hashes, screenshots, or PDF snapshots.

Why it reduces buyer confidence: Public sources can change. Without capture controls, the packet may be hard to defend later.

Classification: evidence, process, workflow

Delivery path: AI + expert

Implementation effort: High

Impact on buyer confidence: High

Impact on repeatability: High

Impact on scalability: High

Notes: AI can generate a capture log schema. Human review should confirm captures and file integrity.

### IMP-005: Convert Regulatory Section Into A Review Queue

Underlying weakness: The regulatory section is careful but somewhat empty. It indexes 40 CFR 721.10536 but does not give a formal queue of questions for qualified review.

Why it reduces buyer confidence: Buyers need to see that regulatory uncertainty is being managed, not merely avoided.

Classification: legal wording, regulatory interpretation, workflow

Delivery path: AI + expert

Implementation effort: Medium

Impact on buyer confidence: High

Impact on repeatability: High

Impact on scalability: High

Notes: AI can draft the queue structure. A qualified reviewer must validate question framing before use with clients.

### IMP-006: Strengthen Gap-To-Decision Framing

Underlying weakness: Gaps identify missing records and closure evidence, but they do not consistently state what decision is blocked, what happens if the gap stays open, or whether the gap is normal, unusual, or critical.

Why it reduces buyer confidence: Buyers pay for prioritized judgment, not just a list of missing documents.

Classification: content, workflow, presentation

Delivery path: AI + expert

Implementation effort: Medium

Impact on buyer confidence: High

Impact on repeatability: High

Impact on scalability: Medium

Notes: Add fields for blocked decision, business effect, closure owner, priority rationale, and consequence if unresolved.

### IMP-007: Add Expert QA Checklist

Underlying weakness: Expert review paths are implied but not captured in a checklist showing exactly what was checked, by whom, and with what result.

Why it reduces buyer confidence: The packet is reviewable, but not visibly reviewed.

Classification: process, workflow

Delivery path: AI can solve

Implementation effort: Low

Impact on buyer confidence: High

Impact on repeatability: High

Impact on scalability: High

Notes: Include product identity, SDS match, supplier identity, declaration scope, source capture, regulatory citation status, evidence/gap/action linkage, and prohibited-claims checks.

### IMP-008: Separate Public Demo Limits From Client Deliverable Limits

Underlying weakness: The packet says it is public-source only, but it does not fully separate demonstration constraints from what a client engagement would include.

Why it reduces buyer confidence: A prospect may mistake public-source thinness for Liberty Tree's normal work product depth.

Classification: content, presentation

Delivery path: AI can solve

Implementation effort: Low

Impact on buyer confidence: High

Impact on repeatability: Medium

Impact on scalability: Medium

Notes: Add a clear "public demo constraint" note and a parallel "client packet would include" list.

### IMP-009: Add Evidence Coverage Dashboard

Underlying weakness: The packet has detailed matrices but lacks a one-page dashboard showing product count, supplier count, SDS status, declaration status, testing status, regulatory review status, open gaps, and confidence distribution.

Why it reduces buyer confidence: Buyers need a fast read before they engage with technical matrices.

Classification: presentation, content

Delivery path: AI can solve

Implementation effort: Medium

Impact on buyer confidence: High

Impact on repeatability: High

Impact on scalability: High

Notes: This is one of the best ways to make the sample feel like a premium deliverable without changing the underlying evidence posture.

### IMP-010: Normalize Matrix Confidence And Add Notes Columns

Underlying weakness: Some matrix fields mix multiple confidence judgments in one cell, such as source confidence and product-specific conclusion confidence.

Why it reduces buyer confidence: Mixed confidence values can look imprecise and make automated reuse harder.

Classification: evidence, presentation, workflow

Delivery path: AI can solve

Implementation effort: Medium

Impact on buyer confidence: Medium

Impact on repeatability: High

Impact on scalability: High

Notes: Split confidence into structured fields: source confidence, applicability confidence, review confidence, and reviewer notes.

### IMP-011: Clarify Product/Source Thinness As A Deliberate Demo Feature

Underlying weakness: The public evidence set is thin, and the packet does not fully use that thinness to teach the buyer why source gaps are normal in early PFAS readiness work.

Why it reduces buyer confidence: A buyer could interpret sparse public sources as weak diligence rather than a realistic demonstration of gap discovery.

Classification: content, presentation

Delivery path: AI can solve

Implementation effort: Low

Impact on buyer confidence: Medium

Impact on repeatability: Medium

Impact on scalability: Medium

Notes: Add language explaining that a public packet demonstrates screening logic, while client packets add supplier outreach, client records, and controlled source capture.

### IMP-012: Make Value Proposition Sharper

Underlying weakness: The packet does not yet fully answer the buyer concern: "Am I paying for a compliance deliverable or a documentation inventory?"

Why it reduces buyer confidence: If the commercial promise is vague, buyers may undervalue the evidence packet or expect legal certification.

Classification: content, presentation, legal wording

Delivery path: AI + expert

Implementation effort: Medium

Impact on buyer confidence: High

Impact on repeatability: Medium

Impact on scalability: Medium

Notes: Position the packet as a controlled evidence file that prepares teams for counsel, suppliers, auditors, customers, and internal decision-making.

### IMP-013: Improve Visual And Structural Polish Of Matrices

Underlying weakness: The matrices are functional but visually plain, which can make the deliverable feel like data hygiene rather than premium advisory work.

Why it reduces buyer confidence: Buyers often judge quality by how quickly the artifact helps them understand status, priority, and action.

Classification: presentation

Delivery path: AI can solve

Implementation effort: Medium

Impact on buyer confidence: Medium

Impact on repeatability: Medium

Impact on scalability: Medium

Notes: Improve headings, column order, section summaries, and status indicators. Avoid turning the packet into marketing material.

### IMP-014: Distinguish Review Performed From Review Pending

Underlying weakness: The packet says some items are reviewed for demo and others are pending, but the distinction is not consistently formalized across sections.

Why it reduces buyer confidence: Buyers and experts need to know what has been checked versus what is merely queued.

Classification: process, evidence, workflow

Delivery path: AI can solve

Implementation effort: Medium

Impact on buyer confidence: High

Impact on repeatability: High

Impact on scalability: High

Notes: Use standardized review states: indexed, extracted, human-reviewed, technically reviewed, legally reviewed, pending, not applicable.

### IMP-015: Add Note Index For Reviewer Notes

Underlying weakness: The scope table references `NOTE-001`, but there is no note index.

Why it reduces buyer confidence: Unresolved identifiers damage trust in the traceability system.

Classification: evidence, process

Delivery path: AI can solve

Implementation effort: Low

Impact on buyer confidence: Medium

Impact on repeatability: Medium

Impact on scalability: Medium

Notes: Either add a note index or remove note IDs until the note register exists.

### IMP-016: Reframe "Applicable Regulatory Framework" For Demo Packets

Underlying weakness: The section title may imply an applicability review that the sample explicitly does not perform.

Why it reduces buyer confidence: The title can create tension between conservative legal language and buyer expectations.

Classification: legal wording, presentation

Delivery path: AI + expert

Implementation effort: Low

Impact on buyer confidence: Medium

Impact on repeatability: Medium

Impact on scalability: Medium

Notes: Consider "Regulatory Citation Control" or "Regulatory Sources Pending Applicability Review" for public demonstration packets.

### IMP-017: Define Regulatory Review Questions

Underlying weakness: The packet does not list the exact questions a legal or regulatory reviewer must answer.

Why it reduces buyer confidence: Regulatory uncertainty feels passive unless the next review step is explicit.

Classification: regulatory interpretation, legal wording, workflow

Delivery path: AI + expert

Implementation effort: Medium

Impact on buyer confidence: High

Impact on repeatability: High

Impact on scalability: High

Notes: Include product category, jurisdiction, distribution state or country, intentional addition definition, substance scope, reporting duties, customer documentation duties, exemptions, and effective dates.

### IMP-018: Distinguish Background Sources From Binding Authority

Underlying weakness: EPA background context, eCFR text, SDS regulatory language, and legal interpretation are all indexed, but the packet needs clearer source-status labeling.

Why it reduces buyer confidence: Buyers and reviewers need to know which sources are context, which are authoritative, and which require legal interpretation.

Classification: evidence, legal wording, regulatory interpretation

Delivery path: AI + expert

Implementation effort: Medium

Impact on buyer confidence: High

Impact on repeatability: High

Impact on scalability: High

Notes: Add source authority type: product evidence, supplier evidence, background context, official regulatory text, unofficial current text, legal interpretation, client assumption.

### IMP-019: Separate "Citation Observed" From "Citation Applicable"

Underlying weakness: `REG-CIT-001` is indexed carefully, but the packet should make it impossible to confuse a citation appearing in an SDS with a citation applying to the reviewed product.

Why it reduces buyer confidence: This is a subtle but important PFAS review control. Buyers need confidence that Liberty Tree will not overread SDS regulatory language.

Classification: legal wording, regulatory interpretation, evidence

Delivery path: AI + expert

Implementation effort: Medium

Impact on buyer confidence: High

Impact on repeatability: High

Impact on scalability: High

Notes: Add separate fields for citation source, observed context, applicability status, reviewer required, and conclusion status.

### IMP-020: Clarify Evidence-Readiness Risk Versus Business Risk

Underlying weakness: The risk summary says risk means evidence-readiness risk, but it could more clearly distinguish documentation risk from commercial, operational, legal, and regulatory risk.

Why it reduces buyer confidence: Buyers may misread risk priorities as legal exposure or product compliance findings.

Classification: legal wording, content, presentation

Delivery path: AI + expert

Implementation effort: Medium

Impact on buyer confidence: Medium

Impact on repeatability: Medium

Impact on scalability: Medium

Notes: Add risk taxonomy and keep legal/regulatory risk categories pending expert review.

### IMP-021: Add Sequencing, Dependencies, And Effort To Next Steps

Underlying weakness: Recommended next steps are useful but do not show sequence, dependencies, or estimated effort.

Why it reduces buyer confidence: Buyers need to understand what to do first, what can be parallelized, and what will require supplier or legal input.

Classification: workflow, content

Delivery path: AI can solve

Implementation effort: Medium

Impact on buyer confidence: Medium

Impact on repeatability: High

Impact on scalability: High

Notes: Add sequence number, dependency, estimated effort, response owner, and closure criteria.

### IMP-022: Show Human QA Controls Without Exposing AI

Underlying weakness: The packet benefits from structured extraction and matrixing, but does not visibly show human QA controls that would make AI-assisted work acceptable to a premium buyer.

Why it reduces buyer confidence: Buyers may trust the artifact more when they see professional controls, reviewer checkpoints, and exception logs.

Classification: process, workflow

Delivery path: AI + expert

Implementation effort: Medium

Impact on buyer confidence: High

Impact on repeatability: High

Impact on scalability: High

Notes: Add extraction review status, reviewer initials, exception handling, and prohibited-claims checks. Do not expose prompts, models, or automation details.

### IMP-023: Demonstrate Scalability Beyond One Product

Underlying weakness: The scenario is narrow, and the packet does not yet show how the same structure scales to multiple products, suppliers, or document classes.

Why it reduces buyer confidence: Buyers with larger portfolios need to see that the framework can handle real operating complexity.

Classification: content, presentation, workflow

Delivery path: AI can solve

Implementation effort: Medium

Impact on buyer confidence: Medium

Impact on repeatability: High

Impact on scalability: High

Notes: Add a short "how this scales" note or optional portfolio dashboard template without inventing more sample facts.

### IMP-024: Add Source Capture Appendix Or Evidence Room Map

Underlying weakness: The QA review calls for source capture references and a source capture appendix; the current packet has a source index but no evidence room map.

Why it reduces buyer confidence: Premium buyers expect the packet to be reproducible from a controlled source bundle.

Classification: evidence, process, workflow

Delivery path: AI + expert

Implementation effort: High

Impact on buyer confidence: High

Impact on repeatability: High

Impact on scalability: High

Notes: The evidence room map should show source file, packet ID, archive location, capture method, hash if available, and related evidence rows.

### IMP-025: Add Stronger Summary Tables

Underlying weakness: The packet has rich detail but lacks concise status tables that summarize the state of products, suppliers, evidence, gaps, risks, and actions.

Why it reduces buyer confidence: Buyers need a fast way to understand status before reviewing the full matrix set.

Classification: presentation, content

Delivery path: AI can solve

Implementation effort: Medium

Impact on buyer confidence: Medium

Impact on repeatability: Medium

Impact on scalability: High

Notes: This overlaps with the evidence coverage dashboard but can also improve each major section.

## Prioritized Roadmap

### Phase A: Must Fix Before First Client

These items are required before using the packet as a first-client work product or serious sales sample.

| Priority | Improvement | Why Phase A |
| ---: | --- | --- |
| 1 | `IMP-001` Add pinpoint citations | Core auditability gap. Expert reviewers need source locations, not just source IDs. |
| 2 | `IMP-002` Add formal document control and review signoff | Converts the packet from draft artifact to controlled work product. |
| 3 | `IMP-004` Add source capture controls | Public and supplier sources must be reproducible. |
| 4 | `IMP-007` Add expert QA checklist | Shows exactly where expert review occurs. |
| 5 | `IMP-014` Distinguish review performed from review pending | Prevents overreading review status. |
| 6 | `IMP-006` Strengthen gap-to-decision framing | Makes gaps feel like value, not failure. |
| 7 | `IMP-005` Convert regulatory section into a review queue | Makes regulatory uncertainty actionable without making legal conclusions. |
| 8 | `IMP-017` Define regulatory review questions | Gives legal/regulatory reviewers a clear QA entry point. |
| 9 | `IMP-019` Separate citation observed from citation applicable | Prevents a high-risk regulatory overclaim. |
| 10 | `IMP-003` Add buyer-facing executive memo | Makes the work commercially legible. |
| 11 | `IMP-008` Separate public demo limits from client deliverable limits | Prevents prospects from mistaking public-source thinness for normal delivery depth. |
| 12 | `IMP-015` Add note index for reviewer notes | Closes a traceability defect. |

Phase A completion definition: a qualified reviewer can trace each material statement to a captured source location, see what has and has not been reviewed, and understand what decisions remain blocked.

### Phase B: Improves Commercial Value

These items make the packet easier to sell, easier to read, and more valuable to buyers.

| Priority | Improvement | Why Phase B |
| ---: | --- | --- |
| 1 | `IMP-009` Add evidence coverage dashboard | Gives buyers a one-page status view. |
| 2 | `IMP-012` Make value proposition sharper | Clarifies why the packet is paid advisory support, not a document dump. |
| 3 | `IMP-021` Add sequencing, dependencies, and effort to next steps | Makes the packet operational for client teams. |
| 4 | `IMP-020` Clarify evidence-readiness risk versus business risk | Improves buyer interpretation and reduces legal ambiguity. |
| 5 | `IMP-025` Add stronger summary tables | Improves scanability and executive use. |
| 6 | `IMP-011` Clarify source thinness as a deliberate demo feature | Makes the sample's limits feel intentional and educational. |
| 7 | `IMP-013` Improve visual and structural polish of matrices | Makes the deliverable feel more premium. |
| 8 | `IMP-016` Reframe "Applicable Regulatory Framework" for demo packets | Reduces title-to-content mismatch. |

Phase B completion definition: a buyer can understand the packet's value in five minutes and assign the next actions internally without needing the preparer to narrate the artifact.

### Phase C: Future Refinement

These items improve long-term repeatability, automation, and portfolio-scale delivery.

| Priority | Improvement | Why Phase C |
| ---: | --- | --- |
| 1 | `IMP-010` Normalize matrix confidence and add notes columns | Improves schema discipline and future automation. |
| 2 | `IMP-018` Distinguish background sources from binding authority | Important for scale, especially across jurisdictions and source types. |
| 3 | `IMP-022` Show human QA controls without exposing AI | Strengthens the operating model for AI-assisted delivery. |
| 4 | `IMP-023` Demonstrate scalability beyond one product | Helps market larger portfolio engagements. |
| 5 | `IMP-024` Add source capture appendix or evidence room map | Important for mature delivery operations and source-bundle handoff. |

Phase C completion definition: the packet model is ready to support repeatable client delivery across multiple products, suppliers, and review teams.

## Expected Scores After Phase A

If Liberty Tree completed every Phase A item with good execution, I would expect the revised packet to score:

| Category | Current QA score | Expected after Phase A | Reason |
| --- | ---: | ---: | --- |
| Overall quality | 76/100 | 88/100 | Phase A would fix the largest professionalism gaps: control page, pinpoint citations, source capture, review states, regulatory queue, and executive memo. |
| Buyer confidence | 68/100 | 84/100 | Buyers would see a controlled, decision-oriented work product instead of a promising technical demo. |
| Expert-review readiness | 84/100 | 93/100 | Pinpoint citations, QA checklist, review state discipline, and observed-versus-applicable regulatory controls would make expert QA substantially faster and cleaner. |

## Product Management Conclusion

The QA review does not indicate that the sample packet is structurally wrong. It indicates that the packet is currently under-packaged relative to the value Liberty Tree wants to claim.

Phase A should be treated as the minimum viable professional packet. Phase B makes the sample commercially persuasive. Phase C turns the method into a scalable delivery system.

