# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Seeded Zivvy marketing blog posts (no third-party ERP branding)."""

from __future__ import annotations

from functools import lru_cache

POSTS: list[dict] = [
	{
		"slug": "introducing-zivvy",
		"title": "Introducing Zivvy",
		"date": "2026-07-10",
		"excerpt": (
			"A calmer workspace for CRM and operations — with clear Free, Pro, and Business plans "
			"for teams that want product clarity from day one."
		),
		"body": [
			(
				"p",
				"Zivvy is SaaS for teams that want modern business software without a maze of SKUs. "
				"Start on Free with CRM and light orders, then grow into accounting, inventory, HR, "
				"and manufacturing when you need them.",
			),
			("h2", "Why we built it"),
			(
				"p",
				"Growing companies in India and beyond deserve tooling that feels like a product on "
				"day one: clear branding, honest pricing, and upgrades that map to real work — not a "
				"checklist of modules you will never open.",
			),
			("h2", "How billing works"),
			(
				"p",
				"Paid plans are per-seat and billed through Polar. Pro is $18 per user / month; "
				"Business is $30. Annual billing is 20% off. Seat changes and invoices live in Polar’s customer portal.",
			),
			(
				"p",
				"Ready to try? Start free, or read the feature matrix on our pricing page.",
			),
		],
	},
	{
		"slug": "choosing-your-zivvy-plan",
		"title": "Choosing Free, Pro, or Business",
		"date": "2026-07-14",
		"excerpt": (
			"A practical guide to Zivvy’s three plans — when Free is enough, when Pro pays for "
			"itself, and when Business is the right ceiling."
		),
		"body": [
			(
				"p",
				"Zivvy keeps plan choice simple. Here is how we recommend thinking about it if you "
				"are an Indian SME or a small SaaS ops team evaluating business software.",
			),
			("h2", "Stay on Free when…"),
			(
				"ul",
				[
					"You need CRM basics and simple sales or purchase orders",
					"You have up to two system users",
					"Portal-style, read-oriented sharing is enough for now",
				],
			),
			("h2", "Move to Pro when…"),
			(
				"ul",
				[
					"You need full accounting, stock, or banking reconciliation",
					"HR leave and projects become daily workflows",
					"You have outgrown the two-user Free seat cap",
				],
			),
			("h2", "Choose Business when…"),
			(
				"ul",
				[
					"You run advanced manufacturing, quality, or assets",
					"You need multi-company or subscription/rental modules",
					"You want priority support surfaced in the product",
				],
			),
			(
				"p",
				"System Managers can upgrade anytime from Desk → Billing once Polar is configured. "
				"See pricing for current per-seat rates.",
			),
		],
	},
	{
		"slug": "privacy-and-cookies-at-zivvy",
		"title": "Privacy, cookies, and analytics at Zivvy",
		"date": "2026-07-18",
		"excerpt": (
			"How Vestcodes Co handles Zivvy data, consent, and optional product analytics — "
			"without surprise tracking."
		),
		"body": [
			(
				"p",
				"Trust is part of the product. Vestcodes Co publishes Terms, Privacy, Cookie, and "
				"Acceptable Use policies for Zivvy, governed by the laws of India.",
			),
			("h2", "What we collect"),
			(
				"p",
				"Account details, workspace data you enter, and billing identifiers from Polar. "
				"We do not sell personal information. Payment cards are handled by Polar.",
			),
			("h2", "Cookies and analytics"),
			(
				"p",
				"Essential cookies keep you signed in and secure. Optional analytics (PostHog) "
				"load only after you accept analytics cookies on our consent banner. "
				"Essential-only mode keeps the product working without marketing analytics.",
			),
			(
				"p",
				"Questions? Email contact@vestcodes.com — we are happy to help.",
			),
		],
	},
	{
		"slug": "crm-for-indian-smes",
		"title": "CRM for Indian SMEs: what actually matters",
		"date": "2026-07-19",
		"excerpt": (
			"Skip the enterprise checklist. Indian SMEs need a CRM that captures leads, follows "
			"quotes, and does not drown the team in configuration."
		),
		"body": [
			(
				"p",
				"Most Indian SMEs do not fail at CRM because they lack features. They fail because "
				"the tool is too heavy for the first ten deals — or too thin once invoices and stock "
				"show up.",
			),
			("h2", "Start with pipeline honesty"),
			(
				"p",
				"A useful CRM for a 5–30 person company tracks leads, opportunities, customers, "
				"and simple sales orders. If your team still lives in WhatsApp and spreadsheets, "
				"the first win is a shared pipeline — not a custom scoring model.",
			),
			("h2", "Connect sales to the next step"),
			(
				"p",
				"When a deal closes, you need a clean path to orders and, later, accounting. "
				"Zivvy Free is built for that CRM and light-order stage so you are not buying a "
				"full finance suite before you need one.",
			),
			("h2", "What to ignore early"),
			(
				"ul",
				[
					"Complex territory trees you will not maintain",
					"Module packs you will not open for six months",
					"Seat counts that punish a founder plus one sales hire",
				],
			),
			(
				"p",
				"If you are evaluating CRM for an Indian SME, try Zivvy Free first, then upgrade "
				"when inventory or books become daily work.",
			),
		],
	},
	{
		"slug": "inventory-vs-accounting-when-to-upgrade",
		"title": "Inventory vs accounting: when to leave Free",
		"date": "2026-07-20",
		"excerpt": (
			"CRM and light orders can live on Free. Stock valuation and full books are the "
			"usual signals it is time for Pro."
		),
		"body": [
			(
				"p",
				"Founders often ask whether they need inventory software or accounting software "
				"first. In practice, the upgrade trigger is when either becomes a weekly operational "
				"pain — not when a feature matrix looks impressive.",
			),
			("h2", "Stay on Free while…"),
			(
				"ul",
				[
					"You track customers and quotes more than warehouses",
					"Purchases are simple and infrequent",
					"A chartered accountant still owns the formal books outside the product",
				],
			),
			("h2", "Move to Pro when inventory hurts"),
			(
				"p",
				"If you are guessing stock levels, duplicating item lists, or reconciling deliveries "
				"in chat threads, inventory belongs in the same system as sales. Pro unlocks stock "
				"workflows so operations and selling share one item master.",
			),
			("h2", "Move to Pro when accounting hurts"),
			(
				"p",
				"When invoices, payments, and bank reconciliation are daily, exporting CSVs every "
				"Friday stops scaling. Pro brings full accounting into Zivvy so finance is not a "
				"separate weekend project.",
			),
			(
				"p",
				"You do not need both pain points at once — either one is enough to justify Pro. "
				"Compare plans on the pricing page.",
			),
		],
	},
	{
		"slug": "data-residency-india-eu-us",
		"title": "Data residency: India, EU, or US",
		"date": "2026-07-21",
		"excerpt": (
			"How to think about where your Zivvy workspace should live — and why we ask for a "
			"datacenter preference at signup."
		),
		"body": [
			(
				"p",
				"Buyers increasingly ask where company data is stored. For Indian SMEs selling "
				"locally, India residency often feels natural. For exporters or global teams, EU "
				"or US regions may match customer expectations or existing vendor footprints.",
			),
			("h2", "What we ask at signup"),
			(
				"p",
				"During signup, Zivvy collects a datacenter preference: India, EU, or US. That "
				"choice records where you want the workspace to live as we expand regional capacity. "
				"It is part of making residency an explicit product decision — not a footnote.",
			),
			("h2", "How to choose"),
			(
				"ul",
				[
					"India — primary customers, finance team, and compliance conversations are India-first",
					"EU — you sell into Europe or prefer EU-centric vendor posture",
					"US — your buyers, parent company, or existing stack already orbit US regions",
				],
			),
			("h2", "What does not change"),
			(
				"p",
				"Plans, Polar billing, and product features stay the same across preferences. "
				"Privacy and terms still apply via Vestcodes Co. If you need a written residency "
				"discussion for a procurement review, contact contact@vestcodes.com.",
			),
		],
	},
	{
		"slug": "polar-billing-per-seat-explained",
		"title": "Polar billing and per-seat pricing explained",
		"date": "2026-07-21",
		"excerpt": (
			"Why Zivvy bills per seat through Polar, what System Managers control, and how "
			"upgrades differ from surprise SKUs."
		),
		"body": [
			(
				"p",
				"Zivvy’s paid plans are per-seat and billed through Polar. Pro is $18 per "
				"user / month; Business is $30 (annual −20%). Free stays at $0 with a soft cap of two system users.",
			),
			("h2", "Why per-seat"),
			(
				"p",
				"Per-seat pricing maps to how teams actually grow: you add people when work "
				"increases. You are not pushed into opaque “module packs” that unlock three features "
				"you need and twelve you do not.",
			),
			("h2", "What Polar handles"),
			(
				"ul",
				[
					"Checkout for Pro or Business",
					"Invoices and payment methods",
					"Customer portal for seat and subscription changes",
				],
			),
			("h2", "What you do in Zivvy"),
			(
				"p",
				"System Managers open Desk → Billing to start checkout or open the Polar portal. "
				"Your effective plan gates which workflows are available; demo accounts can inspect "
				"status without consuming seats.",
			),
			(
				"p",
				"Full matrix: see pricing. Integrators can use the public pricing and billing API "
				"routes documented in product onboarding and plan materials.",
			),
		],
	},
	{
		"slug": "migrating-from-spreadsheets",
		"title": "Migrating from spreadsheets without a big-bang project",
		"date": "2026-07-22",
		"excerpt": (
			"A staged path from Sheets chaos to a shared Zivvy workspace — CRM first, then "
			"orders, then books."
		),
		"body": [
			(
				"p",
				"Spreadsheet migrations fail when teams try to recreate every tab on day one. "
				"Succeed when you move the shared source of truth in layers.",
			),
			("h2", "Week 1 — customers and pipeline"),
			(
				"p",
				"Import or re-enter active leads and customers. Agree that new opportunities live "
				"in Zivvy, not in a parallel sheet. This alone removes most “which file is latest?” "
				"arguments.",
			),
			("h2", "Week 2 — items and simple orders"),
			(
				"p",
				"Put your selling catalog in one place. Use Free-tier order flows for the deals you "
				"already close in chat. Keep historical sheets read-only as archive.",
			),
			("h2", "When spreadsheets still win"),
			(
				"ul",
				[
					"One-off board models and scenario planning",
					"Ad-hoc analysis exports",
					"Personal scratchpads that never become company process",
				],
			),
			(
				"p",
				"Upgrade to Pro when stock or accounting tabs become the sheets everyone fears "
				"editing. That is the signal the spreadsheet is now a production system in disguise.",
			),
		],
	},
	{
		"slug": "sales-pipeline-on-zivvy-free",
		"title": "Building a sales pipeline on Zivvy Free",
		"date": "2026-07-22",
		"excerpt": (
			"How a two-person team can run leads, opportunities, and simple orders on Free "
			"before paying for seats."
		),
		"body": [
			(
				"p",
				"Zivvy Free is intentionally narrow: CRM basics, items, and simple orders with a "
				"soft cap of two system users. That is enough for a founder and one seller to share "
				"a real pipeline.",
			),
			("h2", "A simple weekly rhythm"),
			(
				"ul",
				[
					"Monday — review open opportunities and next actions",
					"Throughout the week — log every serious lead the same day",
					"Friday — convert won deals to orders; archive noise",
				],
			),
			("h2", "Portal without opening the desk"),
			(
				"p",
				"When customers need read-oriented visibility, use portal-style sharing instead of "
				"handing out full workspace access. That keeps Free seats for people who actually "
				"operate the system.",
			),
			("h2", "Know the upgrade line"),
			(
				"p",
				"If a third teammate needs write access, or you need accounting and stock, move to "
				"Pro. Do not stretch Free with shadow spreadsheets — that recreates the problem "
				"you left.",
			),
		],
	},
	{
		"slug": "multi-company-when-you-need-business",
		"title": "Multi-company: when Business is worth it",
		"date": "2026-07-23",
		"excerpt": (
			"Holding companies, sister brands, and manufacturers often outgrow a single-company "
			"Pro workspace — here is when Business pays off."
		),
		"body": [
			(
				"p",
				"Pro covers a lot: accounting, inventory, HR, projects, and core manufacturing. "
				"Business is for teams that need advanced production, quality, assets, subscriptions, "
				"or more than one company in the same product.",
			),
			("h2", "Signals you need Business"),
			(
				"ul",
				[
					"Two or more legal entities must share processes without mixing books casually",
					"Quality, assets, or advanced manufacturing are daily — not experimental",
					"You want priority support surfaced inside the product",
				],
			),
			("h2", "Signals you can wait"),
			(
				"p",
				"If you are still stabilizing CRM and first invoices on one company, stay on Pro. "
				"Multi-company complexity before process discipline creates more cleanup than leverage.",
			),
			(
				"p",
				"Compare the full matrix on features and pricing, then upgrade seats when the "
				"operating model is clear.",
			),
		],
	},
	{
		"slug": "what-indian-saas-teams-need",
		"title": "What Indian SaaS teams need from business software",
		"date": "2026-07-23",
		"excerpt": (
			"Clear plans, per-seat billing, and room to grow — without pretending every startup "
			"needs an enterprise rollout."
		),
		"body": [
			(
				"p",
				"Indian SaaS teams buy tools the way they ship product: iteratively. They want a "
				"credible Free tier, transparent upgrades, and branding that feels like a product — "
				"not a project kickoff.",
			),
			("h2", "Clarity beats catalog size"),
			(
				"p",
				"A long module list is not a strategy. Zivvy groups capability into Free, Pro, and "
				"Business so finance, ops, and founders can agree on when to spend.",
			),
			("h2", "Billing that matches headcount"),
			(
				"p",
				"Per-seat Polar billing keeps cost conversations boring — in a good way. You add "
				"seats when you hire; you do not renegotiate a SKU puzzle every quarter.",
			),
			("h2", "Grow into depth"),
			(
				"p",
				"CRM first. Then stock and books. Then manufacturing or multi-company if the "
				"business earns it. That path is how Zivvy is designed — and how most Indian SaaS "
				"ops teams actually mature.",
			),
			(
				"p",
				"Explore the product story on the home page, or start free when you are ready.",
			),
		],
	},
	{
		"slug": "from-quotes-to-cash-on-zivvy",
		"title": "From quotes to cash without tool-hopping",
		"date": "2026-07-23",
		"excerpt": (
			"How Zivvy keeps the path from opportunity to order to invoice coherent as you "
			"move from Free to Pro."
		),
		"body": [
			(
				"p",
				"Tool-hopping — CRM in one place, orders in another, invoices in a third — creates "
				"silent revenue leaks. Names diverge, statuses drift, and nobody trusts the dashboard.",
			),
			("h2", "One customer record"),
			(
				"p",
				"Keep the customer master in Zivvy from the first serious conversation. Quotes and "
				"orders should point at the same record your team already uses in CRM.",
			),
			("h2", "Upgrade the financial layer, not the relationship layer"),
			(
				"p",
				"When you adopt Pro accounting, you are deepening the same workspace — not "
				"migrating relationships again. That is the point of staged plans.",
			),
			(
				"p",
				"If your current stack requires copy-paste between quote and invoice every week, "
				"start by consolidating CRM and orders on Free, then turn on Pro when cash "
				"application needs a real ledger.",
			),
		],
	},
]


def list_posts() -> list[dict]:
	return [dict(post) for post in _sorted_posts()]


def get_post(slug: str) -> dict | None:
	slug = (slug or "").strip().lower()
	post = _posts_by_slug().get(slug)
	return dict(post) if post else None


@lru_cache(maxsize=1)
def _sorted_posts() -> tuple[dict, ...]:
	# Static seeded content: memoize sort to avoid repeat work on hot blog routes.
	return tuple(sorted(POSTS, key=lambda p: p["date"], reverse=True))


@lru_cache(maxsize=1)
def _posts_by_slug() -> dict[str, dict]:
	return {post["slug"]: post for post in POSTS}
