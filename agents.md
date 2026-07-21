# KlubOS — Agent Context

This file is the operating context for every agent working on KlubOS. It describes the current founder-led product direction, the customer we are prioritizing, the problem we are solving, and how the repository’s product surfaces fit together.

Last reviewed: 2026-07-15
Current strategy: **DACH context, Germany first, tennis clubs first.**

Use this file together with the current repository, the user’s task, and the latest Notion content. The repository is the source of truth for what is currently implemented. Notion is the source of background strategy and research. When older strategy pages are broader than this brief, follow the current focus in this file: German tennis clubs first; do not prioritize football or other sports unless the founder explicitly changes the direction.

## 1. Identity, relationship, and language

- **KlubOS** is the canonical company, project, and product name everywhere.
- KlubOS is a software hub for tennis-club boards. It is made up of multiple widgets and work areas; the AI assistant is one important part of the system, not the entire product.
- The primary market context is the German-speaking DACH region, with **Germany as the immediate focus**. Austria and Switzerland are relevant later, but they should not distract from learning and winning in Germany.
- The immediate sport focus is **tennis clubs**. Do not lead-generate for football, golf, indoor sports, or other sports in the current phase unless the founder explicitly asks for it.
- Customer-facing communication is **German-first**. Use natural, plain German for club boards. Use English for code and internal technical documentation when that is clearer.
- The internal assistant working with the founder is called **Brain Agent**.

## 2. The idea and vision

### KlubOS in one paragraph

KlubOS is a web-based software hub for tennis-club boards in Germany that brings the board’s daily administrative work into one coordinated app. It includes a dashboard and different widgets for areas such as members, finances, sponsors, court planning, events, settings, and club knowledge. The integrated Vereins-KI is one widget and one orchestration layer within that hub: it helps the board turn natural-language requests into plans, documents, messages, summaries, and actions across the relevant work areas. KlubOS is therefore not merely a chatbot where users throw commands and hope everything happens automatically. It is the operating workspace that connects the club’s information and workflows, using AI to make everyday board work much faster, more effective, and easier to manage. The board remains in control of decisions and approvals.

### Founder-market fit

KlubOS is being built from real club experience, not from a distant view of the market. One founder is based in Munich, is originally from Dortmund, plays in TC Kirchhörde’s men’s team, is the team captain, and is also part of the club board. This gives KlubOS direct access to the language, routines, frustrations, seasonal rhythms, and trust dynamics of German tennis clubs.

Agents should use this founder-market fit carefully: it supports authentic understanding and access, but it is not a reason to invent customer claims, testimonials, or market proof.

## 3. Core thesis

Tennis clubs are increasingly missing people willing to take on board responsibilities. The people who do take responsibility often have too much to do, alongside work, family, sport, and everyday life. A large share of their time goes into repetitive administration rather than leading the club, supporting members, or improving the tennis community.

KlubOS is the practical answer to that pressure: help the board master more work in a much shorter and more effective time, all in one app. It should reduce the amount of administrative work the board has to carry and make the club less dependent on individual people remembering how everything works.

The central product promise is:

> The board decides. KlubOS helps the board get the work done.

AI is the multiplier, not the thesis by itself. The thesis is that a focused, connected workspace can give a tennis-club board more capacity with the people it already has.

Every agent should optimize for:

- Less time spent on repetitive board administration.
- More work completed by a limited number of board members.
- Better continuity when roles change or someone leaves.
- One connected place instead of scattered spreadsheets, chats, documents, and memory.
- A useful result the board can review and use immediately.

Do not optimize for AI novelty, feature count, or automation theatre if it does not make the board’s real work easier.

## 4. Ideal customer profile (ICP)

### Primary ICP

The primary customer is a **board member of a German tennis club registered as an `e.V.`**. The club has ongoing tennis operations and a board that wants to use AI and connected software to save time in daily administration.

The product is not limited to unpaid or formally voluntary workers. Many tennis-club board roles are voluntary or volunteer-heavy, which is a major source of the problem, but KlubOS is for **all relevant tennis-club boards**—including clubs with paid staff, mixed structures, or more professional operations when the product can create value.

### Geography and sport focus

- Immediate focus: Germany.
- Broader strategic region: DACH—Germany, Austria, and Switzerland.
- Immediate sport focus: tennis only.
- Do not treat football or other sports as current ICP segments.
- Expansion to other sports or countries is a later learning decision, not a default assumption.

### Club size: a learning variable, not a hard filter

Do not impose a rigid member-count range yet.

- Clubs below 100 members may have less administrative work or may not have a fully structured board. This is a hypothesis to investigate, not a reason to reject every small club.
- In general, more members, teams, courts, events, sponsors, and administrative complexity can mean more potential value.
- Larger clubs remain interesting. A club that starts to look like a company, has paid staff, or has a more complex structure may have even more administrative needs and may be a strong future customer.
- Use size to prioritize research and outreach, not as an unvalidated exclusion rule.
- When gathering evidence, record member count, number of courts, teams, events, staff, and visible administrative complexity separately. Do not reduce fit to member count alone.

### Board contact priority

All board roles can matter, but they are not equally effective first contacts. Prioritize them as follows unless the task gives a different objective:

1. **Vorstandsvorsitzende/r / 1. Vorsitzende/r** — primary decision-maker and best first contact. Owns the overall burden and can approve a new operating tool.
2. **Kassenwart/in** — budget gatekeeper and important trust/security stakeholder. Needs a clear value case, cost rationale, and confidence in data handling.
3. **Schriftführer/in or communications lead** — often a powerful internal champion because they handle minutes, emails, newsletters, announcements, and documentation.
4. **Sportwart/in** — strong operational user for court planning, teams, matches, and tennis operations.
5. **Jugendwart/in** — relevant user and possible champion, but usually less effective as the first commercial contact than the chairperson.

The CRM currently has exact job-title options for `Vorstandsvorsitzende/r`, `Kassenwart`, `Sportwart/in`, and `Jugendwart/in`. If a secretary or communications lead is important but the destination schema has no matching option, preserve the exact schema and record the role clearly in Notes rather than inventing a new value silently.

### Current-state signals

Strong-fit clubs often show several of these signals:

- Board work is distributed across Excel, WhatsApp, email, Word, shared drives, or disconnected specialist tools.
- The chairperson or board is asking for more volunteers or a successor.
- A board member has recently changed roles or is new to the position.
- The club is preparing for a new tennis season, team registrations, tournaments, club championships, or a general meeting.
- Court allocation, member administration, finances, sponsors, communications, or events are visibly time-consuming.
- The club is growing or has many teams, courts, events, sponsors, or administrative obligations.
- There is a visible desire to modernize without a clear, simple solution already in place.

### Not the current priority

- Prospecting football, golf, indoor-sport, or generic non-tennis clubs.
- Treating members, players, parents, coaches, or general visitors as the primary buyer.
- Rejecting a club solely because it is small or because it has some paid staff.
- Assuming a large club is automatically out of scope because it looks more professional.

## 5. The problem KlubOS solves

Describe the problem in the language of daily club work, not abstract “digital transformation” language.

1. **Too few people for too much work:** clubs are struggling to fill board roles and retain people who already carry too much responsibility.
2. **Administrative overload:** board members spend evenings and weekends on members, payments, court allocation, team operations, sponsors, events, emails, minutes, documents, and reports.
3. **Fragmented tools:** spreadsheets, WhatsApp, email, Word, booking tools, and personal folders create copying, searching, version confusion, and manual follow-up.
4. **Knowledge is concentrated in individuals:** when a chairperson, treasurer, or long-serving board member leaves, important processes and context can disappear with them.
5. **Tennis-specific complexity:** courts, training times, teams, matches, tournaments, seasonal planning, coaches, youth programs, memberships, and club events interact with one another.
6. **Existing tools solve fragments:** a club may have a member database or booking tool, but still lack one connected board workspace that helps execute the work around those records.
7. **AI is underused when it is disconnected:** a generic chatbot can draft text, but without the club’s structured data and workflows it cannot reliably act as the board’s operating layer.

The core opportunity is not to make boards work harder with a new tool. It is to give them more capacity with one connected app.

## 6. Product definition: a multi-widget operating hub

### What KlubOS is

- A board-first software hub for the daily operation of a tennis club.
- A dashboard made of widgets and work areas for different administrative domains.
- A shared workspace where board members can work from the same club information and processes.
- An integrated Vereins-KI that can understand context, assist with tasks, and orchestrate work across relevant widgets.
- A system that helps generate practical outputs: plans, reports, minutes, emails, reminders, summaries, and organized records.
- A product that can become more valuable as the club’s information and workflows are connected.

### The AI’s role

The AI chatbot is not the product boundary. It is an interaction and orchestration layer inside KlubOS.

- A board member can ask for help in natural German.
- The AI can use relevant KlubOS context and help produce a useful output.
- The AI should connect to widgets and workflows instead of forcing every task through an isolated chat transcript.
- The board should be able to review, edit, approve, export, or reject important outputs.
- Agents must not describe KlubOS as “just a chatbot” or imply that every task happens invisibly without board control.

### What KlubOS is not

- Not only a chatbot.
- Not a member-facing social network.
- Not a generic project-management system.
- Not only a member booking app.
- Not a replacement for board judgment, responsibility, or approval.
- Not a promise that every administrative task is already fully automated.

## 7. Repository-backed product surfaces

The current repository is the most concrete expression of the product direction. Treat these pages as prototype/product surfaces, not proof that every underlying workflow is production-ready.

| Surface | Repository page | What it represents |
| --- | --- | --- |
| Board dashboard | `dashboard.html` | The daily overview: members, next events, court occupancy, open tasks, board meetings, and active sponsors. |
| Vereins-KI | `vereins-ki.html` | The AI assistant for prompts such as planning the summer season, writing a sponsor report, creating a general-meeting invitation, or sending a member reminder. |
| Member administration | `mitglieder.html` | Member records and recurring member work such as registrations, contributions, cancellations, and reminders. |
| Finance | `finanzen.html` | Income, expenses, balances, financial status, and the treasurer’s reporting work. |
| Sponsorship | `sponsoren.html` | Sponsor records, amounts, status, documents, deadlines, and follow-up. |
| Court and facility planning | `platzplanung.html` | A tennis-relevant planning surface for court/facility occupancy, training times, events, bookings, and availability. |
| Events | `events.html` | Club events, tournaments, meetings, registrations, and related coordination. |
| Club search and setup | `vereinssuche.html` | Finding/selecting a club during onboarding or setup. This is a supporting surface, not the core daily hub. |
| Settings and widget management | `einstellungen.html` | Club information, configuration, and the ability to manage which widgets are active. |

The landing page (`index.html`) also shows the intended widget system through concepts such as:

- Social Media Asset Generator.
- Platzbuchungsassistent.
- Finanz-Widget.
- Mitgliederverwaltung.
- Design Assistent for club identity and materials.
- Sponsorship Manager.
- Clubmagazin Assistent.
- Vereins-KI.

These are useful product-direction signals. An agent must distinguish between a landing-page concept, a static prototype surface, and a shipped backend capability.

## 8. Product vision and experience principles

- KlubOS should feel like one connected board workspace, not a collection of unrelated tools.
- Widgets make the work visible and navigable; AI makes the work faster and more effective.
- The AI should be able to move context between relevant work areas, subject to permissions and approval.
- A board member should be able to understand the value of KlubOS quickly and explain it to another board member in a few minutes.
- The first useful outcome should arrive quickly, ideally through a real tennis-club task rather than a feature tour.
- Good examples include: preparing the next season’s court allocation, drafting a sponsor report, creating an invitation for the Jahreshauptversammlung, summarizing a board meeting, preparing a newsletter, or identifying overdue member/admin work.
- The system should support different board roles without making every person learn every module.
- Outputs should be reviewable, editable, and exportable where appropriate.
- Design for people with mixed technical ability. Long-time Excel and WhatsApp users are first-class users.
- Reduce setup burden. Do not make a board complete a large configuration project before experiencing value.
- The board remains accountable for decisions, communications, payments, and other consequential actions.

## 9. Positioning and messaging

### Positioning

For tennis-club boards in Germany that are carrying too much administrative work with too few people, KlubOS is the connected board operating hub that brings daily club work into one app. It combines practical widgets for members, finances, sponsors, court planning, events, and club administration with an integrated AI assistant that helps the board execute work faster and more effectively. Unlike a standalone chatbot or a collection of disconnected tools, KlubOS connects the board’s workflows and club context in one place.

### Differentiators to emphasize

- **A hub, not a chatbot:** multiple widgets and work areas form the product; AI strengthens the system.
- **Board-first:** built for the people running the club, not primarily for members.
- **Tennis-specific starting point:** court planning, teams, matches, tournaments, seasonal operations, and club realities matter.
- **Connected context:** the value grows when club information and recurring processes are available together.
- **Operational outputs:** KlubOS helps create the actual work product, not only store data or produce generic suggestions.
- **More capacity with the existing board:** the goal is to save time and make limited human capacity go further.
- **German-first:** the product and communication should fit how German tennis clubs actually speak and work.
- **Founder-market fit:** the product is being built by people with direct experience inside German tennis-club boards.

### Message rules

- Lead with saved time, reduced board burden, and fewer disconnected tasks—not AI hype.
- Explain the hub and widget model before describing the AI assistant.
- Show a concrete tennis-club task and a usable result instead of listing every feature.
- Make clear that boards remain in control and that AI supports execution.
- Speak to all relevant board members, not only unpaid volunteers, while recognizing that voluntary administrative work is a major pressure point.
- Use familiar language: Vorstand, Vorsitzende/r, Kassenwart/in, Schriftführer/in, Sportwart/in, Jugendwart/in, Platzbelegung, Mannschaft, Medenspiel, Turnier, Protokoll, Sponsor, Jahreshauptversammlung.
- Avoid condescension toward older or less technical board members.
- Do not call KlubOS “just a chatbot.”
- Do not claim that a module is live, an integration exists, or an output is fully automated unless the repository or current product evidence supports it.
- Do not invent slogans, legal details, customer logos, testimonials, pricing exceptions, or brand guidelines that are not documented.

## 10. Founder-market-fit working principle

The founder’s connection to TC Kirchhörde should influence how we learn and communicate:

- Start with real tennis-board workflows and real seasonal pain.
- Use the founder’s access to understand, observe, and test—not to overstate market validation.
- Favor conversations and demonstrations with tennis-club chairs and boards over abstract market assumptions.
- Turn firsthand observations into product hypotheses, then validate them with other clubs.
- Protect the trust of the founder’s club and every research participant.

## 11. Lead generation and CRM playbook

When asked to generate leads, optimize for qualified **German tennis-club board contacts**, not the largest raw list.

### Lead qualification checklist

Prioritize a club when most of these are true:

- German tennis club registered as an `e.V.`.
- Active board and visible tennis operations.
- Evidence of administration around courts, teams, matches, tournaments, members, sponsors, finances, events, or communications.
- A chairperson or board contact can be identified and verified.
- There is a visible trigger: board change, succession pressure, new season, tournament/event preparation, growth, overload, or fragmented tooling.
- The club appears large or complex enough to have recurring administrative work—or is valuable as a small-club research case.

Do not make member count a hard pass/fail criterion yet. For every lead, record what is known about club size and operational complexity so we can learn where the strongest fit actually is.

Do not prospect football or other non-tennis clubs in the current phase.

### Correct contact targets

Use the board priority order in the ICP. The chairperson is normally the best first contact. A treasurer or secretary may be a strong internal sponsor; a sports or youth officer is usually a secondary entry point unless the campaign specifically targets a tennis workflow they own.

The CRM schema currently supports:

- `Vorstandsvorsitzende/r`
- `Kassenwart`
- `Sportwart/in`
- `Jugendwart/in`

The waitlist and survey also use `President`, `Treasurer`, `Secretary`, and `Board Member`. Preserve the exact allowed values in the destination database. If a relevant role is missing, use Notes or request a schema update rather than silently creating a new value.

### Required lead record quality

Capture as much as is available and verifiable:

- Club Name.
- Full Name.
- Job Title / board role.
- Email.
- Phone, if publicly provided and appropriate.
- Official club website.
- City.
- Club size or member count, if verified.
- Tennis operations signal: courts, teams, tournaments, events, or similar.
- Pipeline Stage.
- Last Contact.
- Notes with fit rationale, trigger, source URL, date checked, and uncertainty.
- Survey Responses relation, when applicable.

Rules:

- Verify that the person is associated with the club and role; never infer a role from a name alone.
- Prefer official club websites, board/imprint pages, tennis-association listings, or a directly supplied source.
- Never fabricate email patterns, phone numbers, member counts, board roles, or pain points.
- Use a generic club inbox only when no board contact is available, and mark it as generic.
- Check for duplicate clubs and contacts before creating new records.
- Separate fact from inference. “The official site lists 8 courts and 12 teams” is a fact; “the board is overloaded” is a hypothesis unless supported by evidence.
- Do not collect unnecessary personal data. Treat contact data as personal data and follow applicable outreach and opt-out rules.

### CRM pipeline stages

Use the exact current CRM statuses:

1. `Not contacted yet`
2. `Survey sent`
3. `Survey completed`
4. `In talks`
5. `Waitlist signup`
6. `No interest`

When reporting leads, include fit rationale, target role, tennis relevance, evidence/source, confidence, and recommended next action.

## 12. Pricing and commercial guardrails

The documented pricing model is a working strategy, not proof of willingness to pay. For the current phase, reason about it primarily in relation to German tennis clubs.

- **Pilot:** structured and time-limited, with onboarding and a clear transition decision afterward.
- **Core:** EUR 99/month in the documented model.
- **Pro:** EUR 179/month in the documented model.
- **Club:** EUR 299/month in the documented model.
- **Enterprise:** tailored discovery and pricing for unusually complex or organization-like clubs.
- **Services:** documented one-time options include onboarding, data migration, and custom workflows.
- **Model rules:** no freemium, no mandatory annual lock-in, and no per-seat pricing are part of the documented strategy.

Do not negotiate or promise discounts, legal terms, service levels, or feature availability without explicit authorization. The willingness of tennis clubs to pay must be validated through real conversations, pilots, and payment—not assumed from survey enthusiasm.

## 13. Data protection and trust

KlubOS may process sensitive club and member data, including names, addresses, bank details, memberships, financial information, documents, and meeting records. Treat privacy and security as product requirements.

- Do not expose, copy, or enrich sensitive member data unless the task explicitly requires it and the handling is authorized.
- Do not send club or personal data to external AI/search tools without authorization and an appropriate data-handling basis.
- Treat GDPR/DSGVO compliance claims as unverified until current legal and technical documentation confirms them.
- The documented mitigation direction includes EU hosting, a standard data-processing agreement (`AVV`), and clear documentation of what the AI can access.
- For lead generation, use only appropriate, relevant contact data and respect applicable outreach and opt-out requirements.
- Flag tasks involving member data, financial data, authentication, access control, AI data exposure, or legal claims for careful review.

## 14. Technical and repository context

The repository contains an evolving prototype with static HTML pages, shared JavaScript/CSS, and an Astro scaffold. The `.html` pages are valuable product references because they show the intended dashboard and widget model. Inspect the repository before assuming a feature is shipped or before designing a new module.

The broader Notion product vision describes React/TypeScript, Supabase for database/authentication, and an AI API layer. Treat that as architecture direction, not proof of the current implementation. The AI layer should remain as provider-agnostic as practical.

## 15. Current risks and questions to validate

- **Where is the strongest club-size fit?** Clubs below 100 members may have less work, but this must be tested. Larger and more professional clubs may still be excellent customers.
- **Which board role converts best?** The chairperson is the default first contact, but treasurers, secretaries, sports officers, and youth officers may be powerful champions for specific workflows.
- **What is the first undeniable time-saving moment?** Test real tennis tasks instead of relying on feature interest.
- **Will clubs pay?** Distinguish curiosity, survey interest, pilot participation, and actual payment.
- **What is truly shipped?** Separate static prototypes, planned widgets, and production workflows.
- **How should AI act across widgets?** Keep permissions, transparency, editability, and approval clear.
- **How should the product serve larger, company-like clubs?** Do not reject them prematurely; learn whether they need a different commercial or onboarding path.
- **Data protection:** confirm hosting, AVV, retention, access controls, and AI data processing before making legal or security claims.
- **Broader sport expansion:** do not spend current execution effort on football or other sports until the German tennis focus has produced learning and traction.
- **Brand and legal details:** do not invent missing entity, domain, slogan, visual identity, or legal details.

## 16. Default working rules for every agent

1. Start from the user’s requested outcome and the current repository state.
2. Default to German tennis clubs in Germany unless the task explicitly broadens the scope.
3. Treat KlubOS as a multi-widget operating hub. The AI assistant is one component and orchestration layer, not the whole product.
4. Use the actual repository pages as product evidence: dashboard, Vereins-KI, members, finances, sponsors, court planning, events, club search, and settings.
5. Treat “planned,” “vision,” “strategy,” “prototype,” and “risk” statements as different from shipped, validated, or legally approved facts.
6. Optimize for saving board time and making limited human capacity go further.
7. Speak to all relevant board members, not only formally voluntary workers, while recognizing the shortage of volunteers and the burden of voluntary administration.
8. Prefer concrete tennis-club workflows and usable outputs over generic explanations or feature lists.
9. Use German-first customer language and familiar tennis-club vocabulary.
10. Do not invent brand fields, legal details, customer proof, pricing exceptions, integrations, testimonials, roles, contacts, or capabilities.
11. Protect personal, member, financial, and authentication data.
12. For lead-generation work, return verified decision-maker contacts with evidence and confidence, not guessed contacts.
13. If sources conflict, surface the conflict. For current execution priorities, this file’s Germany-first and tennis-first direction wins unless the founder explicitly updates it.
14. If a task changes positioning, pricing, legal posture, data handling, or the product boundary, call out the decision before presenting it as settled.

## 17. Source pages

- [KlubOS](https://app.notion.com/p/dddce3a5cb6f43df9bf81fd294b7cef4)
- [Business Plan](https://app.notion.com/p/0f1a8b0d1984401e9411aa4aa6cdc5b1)
- [Product Vision / Solution](https://app.notion.com/p/37bf49daed5280abb80be74b96c2db04)
- [ICP](https://app.notion.com/p/37bf49daed52803c958adb2021ca80b4)
- [Painpoints](https://app.notion.com/p/37bf49daed5280d583f4c875fe423678)
- [Unfair Advantage / UVP](https://app.notion.com/p/37bf49daed528011a1bcc98e2c20bc41)
- [Pricing & Revenue Model](https://app.notion.com/p/37bf49daed52802cba86c742f4568ddd)
- [Competitive Landscape](https://app.notion.com/p/37bf49daed5280a7a0cce77781a131f9)
- [Competition-Analyst — Agent Brief](https://app.notion.com/p/39ef49daed5281f3b811e46502ef77f9)
- [Key Risks & Mitigants](https://app.notion.com/p/37bf49daed5280cbb280ea5230292b5b)
- [Brand & Identity](https://app.notion.com/p/9858227add1149f69227f31415881e76)
- [CRM database](https://app.notion.com/p/c52fb1df33354742b52777364ebc48e7)
- [Waitlist database](https://app.notion.com/p/e247f759c662444a933e303691e9535f)
- [Primary Research Survey database](https://app.notion.com/p/410e7baa65fb47dd9f00a311c1688200)
- [Execution Roadmap](https://app.notion.com/p/37bf49daed5280a5956ad2033540fd32)

## 18. Visual identity and UI system

The current website and software surfaces establish a clear KlubOS visual language. Treat `klubos-ci.md` as the detailed repository reference and keep new UI work aligned with it.

- **Primary font:** Satoshi, with the existing fallback stack `Avenir Next`, `Manrope`, system UI. Use 400 for body, 500 for controls, 600 for headings, 700–800 sparingly for display numbers and hero moments.
- **Core palette:** warm off-white `#F3F1F0`, white `#FFFFFF`, warm surface `#ECE8E5`, dark warm text `#1B1816`, muted text `#6A625E`, dim text `#A29A96`, border `#DED8D4`, and KlubOS Terracotta `#BB5522` with hover `#9F461B`. The Terracotta is intentionally inspired by the clay courts of Roland-Garros and is a direct tennis signal in the brand.
- **Semantic colors:** danger `#BA3F36`, warning `#A8761D`, success `#3E7A56`.
- **Shape:** thin `0.5px` borders, radius tokens `8px / 12px / 16px`, 999px pills, soft shadows and light glass/blur surfaces.
- **Experience:** calm, warm, precise, board-first and operational. Show concrete widgets and useful outputs; avoid neon AI aesthetics, cold blue SaaS defaults, or excessive decoration.
- **Logo:** use `assets/klubos-logo-soft.svg` as the primary B Soft lockup, with the softly rounded two-module mark and mixed-case `KlubOS` wordmark. Use `assets/klubos-logo-soft-white.svg` on dark or terracotta surfaces, and `assets/klubos-app-icon.svg` as the D App Icon/favicon. Do not recreate the wordmark as ordinary text or introduce a competing logo.
- **Secondary colors** such as green, blue, pink, violet, orange, and sand are for status, charts, tennis illustrations, or widget previews—not replacements for Terracotta as the primary brand accent.
- **Source of truth:** reuse tokens from `css/style.css`; document any new visual token in `klubos-ci.md` and the Notion Brand & Identity page.
