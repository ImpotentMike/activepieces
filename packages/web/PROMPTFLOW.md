# PromptFlow Customization Notes

This is a fork of Activepieces being customized to look and feel like PromptFlow, an internal workflow automation platform for Gamuda Technologies. The real product will eventually be built by engineering on top of Activepieces; this fork is an exploratory spike by a designer (not engineering) to validate the customization path and prototype the PromptFlow visual identity.

This file is additive to Activepieces' own `AGENTS.md` and `packages/web/CLAUDE.md` — read those for codebase orientation and conventions. This file covers PromptFlow-specific decisions only.

## Scope of this fork

- **In scope:** theming and branding (colors, logo, copy, naming), the theme switcher dev overlay (`theme-switcher.tsx`), visual customization of existing Activepieces screens.
- **Out of scope (do not build):** AI chat for workflow creation, document-to-workflow interpretation, AI-assisted debugging, webhook-triggered workflows beyond what Activepieces already supports, multi-party approval routing, SLA monitoring, sub-workflow orchestration, connector marketplace, embedded mode, RAG/Deep Research integration. These are PromptFlow Phase 2+ and are not part of this spike.
- **Files that should not be touched in this spike:** anything outside `packages/web/`, anything outside theme/branding concerns. If a task seems to require editing AI providers, MCP server code, secret managers, billing, or other backend services, flag it instead of doing it.

## Design language

**Violet is brand and state, not action.** Used for the PromptFlow wordmark, the Trigger tag on canvas nodes, the selected-node outline, running/pulse animations. Never used as a button fill or as a primary CTA color.

**Indigo is primary CTA only.** Publish, Save Draft, Create new workflow, Test run, equivalent action buttons. Reserving indigo for action keeps it readable.

**Semantic state colors are non-negotiable.** Incomplete = amber. Succeeded = green. Failed = red. Paused = amber. Skipped = neutral gray. Running = blue (deliberately distinct from violet so users don't conflate selection with execution).

**Tone reference: Linear and Vercel.** Calm, dense-but-legible, professional. No exclamation marks. No "Awesome!" or "Great!" confirmations. Errors are matter-of-fact, not apologetic. Copy is direct and instructive.

**Owner avatar colors and log-level colors are intentionally hardcoded** (not theme-able). They're identity/terminal palettes, not brand colors. Don't tokenize them.

## Standing rules for Code

1. **Commit small and often.** Every meaningful change gets its own commit with a clear message. Don't bundle unrelated edits into one commit.
2. **Stay on the `promptflow-customization` branch.** Do not commit to `main`. Do not push to origin without being asked. Do not pull from upstream without being asked.
3. **Don't touch files outside the current task's scope.** If a task is "swap the logo," don't also modify the language toggle or the MCP server. Flag drift before acting on it.
4. **Use existing design tokens where Activepieces has them.** Don't introduce new hex values, raw px literals, or hardcoded font sizes in new code unless there's no existing token to reference.
5. **No new dependencies without asking.** If a task seems to require a new library, surface it first instead of installing.
6. **Be direct about gaps.** If you stub, mock, hardcode, or skip something, say so explicitly at the end of your reply. Don't soften it.
7. **Don't redesign without being asked.** If a task touches a screen, preserve its existing structure unless I explicitly request changes.
8. **Ask before refactoring.** If you spot something worth refactoring outside the scope of the current task, flag it and wait for approval.

## Working style

- I am a designer learning React and TypeScript. Explain framework-specific patterns when they come up. Talk to me as a peer on design and product; don't dumb down design language.
- When I ask for a change, give me the smallest correct version of it. Don't bundle unrelated improvements.
- When you finish a task, walk me through what you changed and how to verify it.
- If you disagree with my request, say so and explain why before doing it. I want pushback, not deference.

## Open questions (do not invent answers)

1. **Recipient model for delivery steps.** When configuring an Email or WhatsApp delivery node, are recipients chosen from a static list, pulled from user data, or both? Affects the "configure recipients" form.
2. **WhatsApp template approval lead time.** WhatsApp Business API requires pre-approved templates. How does that surface in the UI — pick from approved templates, request new ones, or both?
3. **Result formatting across channels.** A Trudax saved-question result is structured data. How does it render in an email (table? plain text? attachment?) vs. WhatsApp (truncated? linked?)?
4. **Trudax API contract.** What does `execute saved question` actually return? Sync or async? Failure shape?
5. **Project membership model.** A user has Builder role in Trudax and Admin role in SISS. How is this represented in the UI? Are membership and role one thing or two?

Resolve via Wee Wei Wen (Product) for #1-3 and #5. Engineering for #4. Draft each question into a Slack message before sending — don't bring half-formed asks.

## Provenance note

A previous attempt described this work as a separate React + Vite prototype. That prototype was never actually built — the work has always been here, in Activepieces' frontend. If you find references in old conversations to `src/pages/Workflows.jsx`, `tokens.css`, `Rail.jsx`, or a standalone Vite project, ignore them. They don't exist. The real work is in `packages/web/`.
