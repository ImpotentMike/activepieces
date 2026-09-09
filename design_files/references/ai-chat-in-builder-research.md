# AI Chat in the Builder — Research & Design Brief

Research date: 2026-08-26. Audience: design (Alif, Wee Wei Wen) + whoever picks this up in Claude Design.
Scope: **UI/UX mock only.** Nothing here assumes backend work in Phase 1.

---

## TL;DR

1. **A sidebar is the right call** — but put it on the **left**, make it **resizable**, and make it **push** the canvas rather than overlay it. The right side of the builder is already spoken for.
2. **You are not starting from zero.** This repo already contains a fully-wired AI flow-building agent — it's just parked on a separate page (`/chat`) instead of next to the canvas. ~4,000 lines of chat UI and ~40 agent tools already exist.
3. **Every competitor has moved the chat next to the canvas.** n8n, Zapier, Make, and Power Automate all did this. A standalone chat destination is now the outlier pattern.
4. **The differentiator nobody has nailed is *review and revert*.** PromptFlow already has flow versioning. Wiring "undo this AI change" into the chat is a governance win that fits Gamuda's PM/admin audience better than it fits Zapier's.
5. **The canvas should be the second half of the chat.** Don't draw the flow twice. Proposals become ghost nodes on the canvas; the chat holds the conversation.

---

## Part 1 — What already exists in this codebase

### 1a. A complete AI flow builder, on its own page

`packages/web/src/app/routes/chat-with-ai/` — a full-page, ChatGPT-shaped builder at `/chat`, linked from the project nav (`components/project-layout/index.tsx:80`). Roughly 4,000 lines across 15 components.

| Component | What it does |
|---|---|
| `conversation-list.tsx` | Chat history sidebar, rename/delete |
| `chat-model-selector.tsx` | Model picker |
| `chat-thinking-loader.tsx` | Streaming "thinking" state |
| `activity-accordion.tsx` | Collapsed reasoning / tool-call log (550 lines) |
| `build-progress-card.tsx` | **Live per-step build card** (495 lines) |
| `proposal-flow-diagram.tsx` | **Mini flow diagram rendered inline in chat** |
| `multi-question-form.tsx` | Structured question form (choice + text) |
| `connection-picker-card.tsx` / `connection-required` | Connection selection, never through free text |
| `project-picker-card.tsx` | Project scoping |
| `tool-approval-form.tsx` | Approve/deny gate for destructive tools |

**Backend:** `packages/server/api/src/app/ee/chat/` — streaming service, conversation entity, history compaction, approval gate, MCP client. Note the path: this is **EE-gated**, which matters for Gamuda's self-hosted edition decision.

### 1b. The agent's tool surface (~40 MCP tools)

`ap_create_flow`, `ap_build_flow`, `ap_add_step`, `ap_update_step`, `ap_update_trigger`, `ap_add_branch`, `ap_update_branch`, `ap_delete_step`, `ap_flow_structure`, `ap_get_piece_props`, `ap_resolve_property_options`, `ap_test_step`, `ap_test_flow`, `ap_lock_and_publish`, `ap_manage_notes`, `ap_list_connections`, `ap_list_runs`, `ap_get_run`, `ap_retry_run`, `ap_list_tables`, `ap_insert_records`, …

**Eight tools require explicit user approval** (`chat-mcp.ts:55`): `ap_delete_table`, `ap_delete_step`, `ap_delete_branch`, `ap_delete_records`, `ap_run_action`, `ap_test_step`, `ap_test_flow`, `ap_change_flow_status` — plus *any* non-`ap_` tool. The approval UI already exists.

### 1c. The "block protocol" — how the model draws UI

The model emits fenced code blocks that the frontend parses into rich cards (`lib/message-parsers.ts:50`):

```
automation-proposal   → inline flow diagram
multi-question        → structured form (choice / text)
connection-required   → "you need to connect X" card
connection-picker     → pick among existing connections
project-picker        → pick target project
build-progress        → live build card
quick-replies         → suggestion chips
```

**This is the most reusable asset in the whole feature.** Any sidebar design should render these same seven block types — that's what keeps chat and canvas from drifting apart.

### 1d. The conversation script the agent already follows

From `packages/server/api/src/assets/prompts/chat-system-prompt.md`:

1. **Gather requirements** — one question at a time, via `multi-question`. Stop and wait.
2. **Propose** — show `automation-proposal`, nothing else in that message. Wait for "Build this automation".
3. **Confirm project** — "Build this flow inside [Project]?" Yes / change project.
4. **Check connections** — one piece at a time; picker or "connect this" card. Stop and wait.
5. **Gather configuration** — resolve dropdown options, ask for missing text fields.
6. **Build** — `build-progress` card, then one step at a time: validate → apply → next. Finally add canvas notes (green = what the flow does; orange = fields that need manual fixing).

This maps almost 1:1 to what n8n's assistant does. Design *to this script* — it's the real interaction model.

### 1e. Your fork's existing mock

`packages/web/src/app/builder/promptflow-ai/` on branch `feat/promptflow-rebrand`. **Updated 7 Sep 2026** — this moved after the first pass of this research.

**The panel**
- Left rail. **340px expanded / 40px collapsed**, `Bot` icon, violet accent.
- Mocked script: user message → confirmation reply → `AiProposalCard` at 600ms / 1200ms.
- `Apply to canvas` → `toast('Preview only — applying to the canvas is not wired up yet')`.

**Shared state (new)**
`ai-panel-context.tsx` — `PromptFlowAiProvider` now owns `expanded`, `messages`, `startWidgetDismissed`, and the composer ref, wrapping the whole builder body. The panel and the canvas both read one conversation.

**Canvas start card (new)**
`flow-canvas/widgets/ai-start-widget.tsx` — a **560px** card floating above the trigger on a blank flow, with its own composer, a `Build with AI` button, three short suggestion chips, and an `or — Choose a trigger manually` escape hatch.

- Visible only when: not readonly, no run, not dismissed, **no messages yet**, and the trigger is `EMPTY` with no `nextAction`. Strictly a blank-slate affordance.
- It **replaces** `TestFlowWidget` / `IncompleteSettingsButton` in `widgets/index.tsx` while shown — a hard swap, not coexistence.
- `canvas-controls.tsx` reserves an extra **300px** of viewport headroom so the card lands in view on open.
- Sending from it calls `setExpanded(true)`, so the conversation **hands off from canvas to sidebar** on first message.

**Composer is now shared** — `AiComposer` takes `minRows` / `maxRows` / `submitLabel`, and its border/padding wrapper moved out to the caller so it can sit inside a card.

**Still open**

| Recommendation | Status |
|---|---|
| Canvas / contextual entry point | **Done** — the start card, plus canvas-to-panel handoff |
| One conversation across surfaces | **Done inside the builder.** `/chat` is still a separate conversation |
| Panel inside `ResizablePanelGroup` | **Not done** — still mounted outside it at `builder/index.tsx`, still fixed 340px |
| Width 380 / 320 / 560 | **Not done** — still 340 |
| Both-panels-open rule | **Not done** |
| Ghost preview nodes on canvas | **Not done** — `applyProposal` is still the toast |
| Revert affordance | **Not done** |
| One proposal renderer | **Not done** — fork's `AiProposal` still separate from `/chat`'s `ProposalStep` / `stepVisuals` |

**Two new tensions the start card creates:**

1. **560 on the canvas, 340 in the panel.** The same composer and the same three prompts get 560px of measure on the canvas and 340px in the sidebar. The content will reflow hard between them. This strengthens the case for widening the panel — and it means the empty state has to be designed twice.
2. **The card never comes back.** `messageCount === 0` gates it, so one message retires it permanently. If someone dismisses the panel conversation there's no route back to the blank-slate card. Worth deciding whether that's correct or a dead end.

### 1f. The layout constraint that decides the placement question

```
┌──────────────────────────────────────────────────────────────┐
│ BuilderHeader                                                │
├────────┬─────────────────────────────────┬───────────────────┤
│  AI    │                                 │  Right sidebar    │
│  panel │         Flow canvas             │  (ResizablePanel) │
│  340px │      (ResizablePanel)           │  min 400px        │
│  fixed │                                 │  max 60%          │
│        │                                 │                   │
│        │                                 │  PIECE_SETTINGS   │
│        │                                 │  RUNS             │
│        │                                 │  VERSIONS         │
└────────┴─────────────────────────────────┴───────────────────┘
```

`RightSideBarType` has three occupants already (`builder/types/index.ts`). **The right side is contested; the left is free.** That settles it — the AI panel goes left.

But it creates the state that needs the most design attention:

| Screen width | AI 340 + Settings 400 | Canvas left over |
|---|---|---|
| 1920 | 740 | 1180 — fine |
| 1440 | 740 | 700 — fine |
| 1280 | 740 | 540 — tight |
| 1024 | 740 | 284 — broken |

**Design a rule for "both panels open."** Options: auto-collapse AI to the rail when step settings open; cap the combined width; or make the AI panel overlay-on-top below 1280.

---

## Part 2 — How competitors do it

| Product | Where the chat lives | Interaction model |
|---|---|---|
| **n8n** (AI Assistant / AI Workflow Builder) | Opened from the **left sidebar** as a dedicated surface; also **contextual entry from node error messages** | Pick project → propose plan → user confirms → **build visible live alongside the chat** → test & review before production. Explicit approval for publish/delete. Credential secrets never sent to the LLM; a **credential card** links out to the normal credential screen. |
| **Zapier Copilot** | Prompt box **above the Zap steps** for a new Zap; persistent Copilot chat in the **lower-left**, composer pinned to the bottom of the left sidebar | Summarizes its actions in the sidebar with a **"Show reasoning"** expander. **Never acts without confirmation.** Accepts **images/sketches** and **voice**. Conversation **carries over** between products (e.g. dashboard → Zap editor). Thumbs up/down on responses. |
| **Make** | Opened from inside the scenario builder — explicitly "no tab switching" | Real-time animation of thinking, elapsed time, and **which tools ran in what order**. A separate **agent reasoning panel** explains why an action was chosen. |
| **Power Automate** | Copilot pane on the **right, open by default**, collapsible (expand button returns top-right). Step config pane moved to the **left** | Copilot suggestions walk you through completing each step; available only in the new designer. |

### Patterns worth stealing

1. **Chat lives beside the canvas, not on its own page.** All four moved this way. Your `/chat` route is the outlier.
2. **Plan → confirm → build.** Universal. You already do it.
3. **Reasoning is progressive disclosure.** Zapier's "Show reasoning", Make's reasoning panel, your `activity-accordion`. Collapsed by default, one click to open.
4. **Credentials never travel through the chat.** A card in the chat links out to the real connection screen. You already do this (`connection-required` / `connection-picker`).
5. **Contextual entry points beat a single button.** n8n's best idea: "Ask AI" appears *on a failing node*. The chat opens pre-loaded with that error.
6. **Confirmation before consequence.** Zapier: no actions without confirmation. n8n: explicit approval for publish/delete. You: 8 gated tools.

### The gap — where PromptFlow can be better

**Nobody handles "the AI changed my flow and I want that specific change back."** n8n's answer is essentially "generated workflows are normal workflows, review them yourself." The emerging 2026 pattern (Notion AI's activity feed being the cited example) is a **revert control next to every logged AI action**.

PromptFlow already has the machinery: `RightSideBarType.VERSIONS` and `FlowVersionsList`. Every AI turn that mutates the flow can snapshot a version and offer **"Revert to before this"** inline in the chat. For an internal Gamuda platform where PMs and admins own governance — and where flows may have been authored by Trudax/SpatialQ via API rather than by a human — this is worth more than it is to Zapier.

---

## Part 3 — Recommendation

### The answer to "AI chat at the sidebar?" — yes, with four refinements

**1. Left side, resizable, pushes the canvas.**
Confirms your instinct and the existing mock. Left because the right is taken; pushes rather than overlays because an assistant that hides the flow you're reasoning about defeats the point. Move it *inside* the `ResizablePanelGroup` so it gets a drag handle.

**Width:** 340px is tight once a proposal diagram, a connection card, and a build-progress list are in it. Competitors run ~360–420. Recommend **default 380, min 320, max 560**, persisted per user. Collapsed rail stays 40–48px.

**2. Treat `/chat` and the builder panel as one feature with two surfaces.**
Not two features. Zapier's "conversation carried over to Zap editor" is exactly right: a conversation started on the dashboard should continue in the builder with the same history. Practically, that means designing the panel against the **same seven block types** the `/chat` page already renders, at a narrower width.

**3. The canvas is the second half of the chat.**
This is the biggest opportunity and the strongest argument for a sidebar over a full page — otherwise a full page would be strictly better.

- **Proposal** → render as **ghost / dashed preview nodes on the canvas**, not only as a card in the chat. An Accept / Discard bar floats over the canvas.
- **Build progress** → the real node on the canvas lights up as it's configured; the chat carries a compact status list, not a duplicate diagram.
- **"Fields need manual attention"** → link the chat line directly to the node, and reuse the existing `incomplete-settings-widget` on the canvas.

Nobody else does the ghost-preview well. It's the thing that makes the sidebar earn its width.

**4. Add the revert affordance.**
Every AI turn that mutated the flow gets a subtle "Revert to before this" using flow versions. Consistent with the PRD's "trust and safety" and "zero dead-ends" principles.

### Three states to design, not one

| State | Notes |
|---|---|
| **Collapsed rail** | 40–48px, `Bot` icon. This is the default for someone who opened the builder to edit, not to chat. |
| **Chat open, no step selected** | The main state. Full width available to the canvas beside it. |
| **Chat open + step settings open** | The hard one. Decide the rule (auto-collapse? width cap? overlay below 1280?) and design the transition. |

Plus the sub-states inside the panel: empty / example prompts · streaming · proposal pending · building · needs-input (question, connection, project) · approval required · error / retry.

### Scope note

The PRD defers AI-assisted creation to **Phase 2** — this is a Phase 2 design exploration. That's fine and worth doing now for exactly the reason the handoff doc flagged: the Phase 1 builder layout shouldn't get painted into a corner. Reserving the left rail and settling the "both panels open" rule *now* is the cheap version of that insurance.

---

## Part 4 — Brief for Claude Design

### Design tokens (already established in `design_files/promptflow-prototype/project/pf-app-shell.html`)

```
Primary   #2563EB (600) · #3A75F6 (500) · #EFF6FF (50)
Gray      #FAFAFA 50 → #09090B 950
Success   #16A34A · Warning #D97706 · Danger #DC2626
Radius    xs 4 · s 6 · m 8 · l 12 · full
Shadow    card 0 1px 3px rgba(0,0,0,.05) · context 0 12px 50px rgba(0,0,0,.10)
Fonts     Inter (sans) · Poppins (display) · Roboto Mono (mono)
Shell     sidebar 264 / collapsed 64 · header 48 + 64 · tabs 44
```

Existing components to match: `pf-card`, `pf-status-pill`.
Note the current mock uses a **violet** `Bot` icon against a blue primary — worth deciding deliberately whether AI gets its own accent colour or stays on brand blue.

### Screens to mock

1. **Collapsed rail** — builder at rest.
2. **Empty state** — heading, sub, three Gamuda-flavoured example prompts (Trudax / WhatsApp / CMU submission), composer at the bottom.
3. **Proposal** — user message, assistant reply, `automation-proposal` diagram card, "Build this automation" / "Discard" — **plus the ghost nodes on the canvas beside it.**
4. **Needs input** — `multi-question` form and a `connection-required` card at 380px.
5. **Building** — `build-progress` card, per-step statuses (queued → setting up → validating → added → error), piece icons, "Open flow".
6. **Approval gate** — "This will test the flow and send a real WhatsApp message. Approve / Deny."
7. **Both panels open** — chat left, canvas centre, step settings right, at 1440 and at 1280.
8. **Done + revert** — completed turn with "Revert to before this".

### Copy voice

PRD section 6: *guided not technical, zero dead-ends, confidence through clarity, progressive disclosure, visual transparency, fast predictable feedback, trust and safety.* Users are Gamuda PMs and admins, not automation experts. Say "connect your Trudax account", not "configure OAuth credentials".

---

## Source files

| What | Where |
|---|---|
| Existing sidebar mock | `packages/web/src/app/builder/promptflow-ai/` |
| Full-page AI builder | `packages/web/src/app/routes/chat-with-ai/` |
| Builder layout | `packages/web/src/app/builder/index.tsx:92` |
| Right sidebar types | `packages/web/src/app/builder/types/index.ts` |
| Block protocol | `packages/web/src/app/routes/chat-with-ai/lib/message-parsers.ts:50` |
| Agent script | `packages/server/api/src/assets/prompts/chat-system-prompt.md` |
| Approval gate | `packages/server/api/src/app/ee/chat/mcp/chat-mcp.ts:55` |
| Design tokens | `design_files/promptflow-prototype/project/pf-app-shell.html` |

## External sources

- n8n — [AI Assistant](https://docs.n8n.io/build/ways-of-building-workflows/ai-assistant), [AI Workflow Builder](https://docs.n8n.io/build/ways-of-building-workflows/ai-workflow-builder/), [community announcement](https://community.n8n.io/t/introducing-the-ai-assistant-the-workflow-building-agent-inside-n8n/302667)
- Zapier — [Copilot guide](https://zapier.com/blog/zapier-copilot-guide/), [Build Zaps faster with Copilot](https://help.zapier.com/hc/en-us/articles/23503999825421-Build-Zaps-faster-using-AI-powered-Copilot-Beta)
- Make — [AI Agents in the scenario builder](https://help.make.com/meet-the-new-make-ai-agents-app), [AI Assistant walkthrough](https://www.xray.tech/post/make-ai-assistant)
- Power Automate — [Create a cloud flow using Copilot](https://learn.microsoft.com/en-us/power-automate/create-cloud-flow-using-copilot), [Copilot FAQ](https://learn.microsoft.com/en-us/power-automate/faqs-copilot)
- [Designing for AI Agents: 10 UX Patterns (2026)](https://mantlr.com/blog/designing-for-ai-agents-ux-patterns-2026)
