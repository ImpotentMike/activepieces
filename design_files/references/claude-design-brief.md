# Paste-ready brief for Claude Design

Copy everything below the line into a new Claude Design chat. It is self-contained — no repo access needed.

---

I'm designing an **AI chat panel inside a workflow builder**. I need mockups only, not working code.

## The product

**PromptFlow** — an internal workflow automation platform for Gamuda Technologies, built on Activepieces. Teams describe recurring tasks (pull a report, send a summary) and the platform runs them on a schedule. The people using this screen are **product managers and admins**, not automation specialists.

## The screen

A workflow builder. Three regions:

- **Top:** a slim header bar with the flow name and publish controls.
- **Centre:** a canvas with a dotted background. Workflow steps are stacked vertically as cards connected by short vertical lines — a trigger at the top, then actions below it. Each card has a small app icon, a title, and a subtitle.
- **Right:** a resizable panel that opens when you click a step. It holds that step's settings form. It can also show run history or version history. Minimum width 400px.

## What I'm adding

The assistant has **two entry points**, and they share one conversation.

**1 — A start card on the canvas.** On a blank flow only, a **560px** card floats above the empty trigger: a title, one line of explanation, a composer with a **Build with AI** button, three short suggestion chips, and below it a divider reading *or* and a **Choose a trigger manually** button. Sending from here hands the conversation off to the panel, and the card retires.

**2 — A chat panel on the left**, between the app's nav and the canvas. It pushes the canvas rather than floating over it, and it's resizable.

- Default width **380px**, min 320, max 560
- Collapses to a **40–48px icon rail**
- Composer pinned to the bottom, conversation scrolls above it

**A tension I want you to solve:** the same composer and the same three prompts get 560px of room on the canvas card and 380px in the panel. I need both to feel like one component at two measures, not two different designs. The chips especially — full sentences won't fit on one row at 380.

The assistant builds workflows from a description. It follows a fixed script: gather requirements one question at a time → propose a workflow and stop → confirm which project → check app connections one at a time → ask for missing configuration → build the flow step by step.

## The seven message types the panel has to render

These are the building blocks. Each needs to work at 380px wide.

1. **Proposal** — a summary line plus a small vertical flow diagram (icon + label per step, connected by lines), with **Build this automation** and **Discard** buttons.
2. **Build progress** — the same step list, but each row now shows live status: `queued` → `setting up…` → `validating…` → `added` → `error`. Icons and colour carry the state. A **Open flow** link at the end.
3. **Question form** — one or more questions in a card. Some are multiple choice, some are free text. A submit button.
4. **Connection needed** — "You need to connect WhatsApp" with a button that opens the normal connection screen. Never asks for credentials in the chat.
5. **Connection picker** — pick among existing connections for an app, shown as selectable rows with names and status.
6. **Project picker** — pick which project to build in.
7. **Quick replies** — small suggestion chips under an assistant message.

Plus: an **approval gate** card for anything with real-world consequence — "This will test the flow and send a real WhatsApp message" with Approve / Deny.

And a collapsed **"Show reasoning"** disclosure under assistant messages that expands into the tool-by-tool activity log.

## The idea I most want to see designed well

**The canvas is the chat's second half.** When the assistant proposes a workflow, don't only show the diagram in the chat — render **ghost / dashed preview nodes on the canvas itself**, with a floating **Accept / Discard** bar over them. While building, the real node on the canvas lights up as each step gets configured, and the chat keeps only a compact status list.

If that reads well, the sidebar earns its width. If it doesn't, a full-screen chat would be better and the whole thing falls apart.

The second idea: every assistant turn that changed the flow carries a quiet **"Revert to before this"** control.

## Screens I need

1. **Blank-slate canvas** — the 560px start card above an empty trigger, with the *or / choose a trigger manually* escape hatch. Suggestion chips read: *Weekly Trudax report* · *Daily WhatsApp summary* · *KM submission alert*.
2. **Collapsed rail** — the builder at rest, chat closed.
3. **Panel empty state** — the narrow twin of screen 1, at 380px. A heading, a sub-line, and three example prompts as clickable rows:
   - *Run a Trudax query every Monday and email the team*
   - *Send a WhatsApp summary daily at 6pm*
   - *Notify the CMU officer when a KM submission comes in*
4. **Proposal** — user message, assistant reply, proposal card — **plus the ghost nodes on the canvas beside it.**
5. **Needs input** — a question form and a connection-needed card, both at 380px.
6. **Building** — the progress card mid-build, with one step done, one configuring, one queued.
7. **Approval gate.**
8. **Both panels open** — chat left, canvas centre, step settings right. Show it at **1440px** and at **1280px**. At 1280 the canvas only gets ~540px, so I need to see whether it holds or whether the chat should auto-collapse to its rail.
9. **Completed turn** with the revert control.

**One question on flow, not visuals:** the start card is gated on the conversation being empty, so a single message retires it for good. If someone clears or abandons the conversation there's no way back to that blank-slate card. Is that right, or does it need a route back?

## Visual system — please match this, don't invent one

```
Primary      #2563EB   (hover #1D4ED8, tint #EFF6FF)
Neutrals     #FAFAFA #F4F4F5 #E4E4E7 #A1A1AA #71717A #3F3F46 #18181B
Success      #16A34A      Warning #D97706      Danger #DC2626
Radius       4 / 6 / 8 / 12 / full
Shadow       card 0 1px 3px rgba(0,0,0,.05)
Type         Inter (body) · Poppins (headings) · Roboto Mono (data, status, IDs)
Body size    14px default
```

Light and dark both, please.

**One decision I want your opinion on:** should the AI panel get its own accent colour (violet is what's mocked today) to separate it from the blue product chrome, or should it stay on brand blue? Show me whichever you think is right and say why.

## Voice

Guided, not technical. Zero dead-ends — every error says what to do next. Progressive disclosure — reasoning is collapsed by default. Say *"connect your Trudax account"*, not *"configure OAuth credentials"*.
