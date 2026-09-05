# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: Chilean owner-operators of small cargo businesses who move loads every day
and are weighing an electric trike against a gasoline pickup or van. Concretely the
site speaks to feriantes (street-market vendors), repartidores (last-mile delivery),
ferretería (hardware-store) owners, and maestros constructores (builders moving
materials). They are price-sensitive, wary of paying money before they can see the
vehicle, and pick a model by matching its load capacity to their daily haul. They
transact and ask questions over WhatsApp, in Chilean Spanish, in CLP.

Secondary: the business owner acting as catalog administrator
(`joaquinphm@gmail.com`, `profiles.role = 'admin'`), who edits products, prices,
specs, photos, and availability through the in-app `/admin` panel.

## Product Purpose

Orient Lion Chile sells 100% electric cargo tricycles ("toritos eléctricos de
carga") in distinct load-capacity tiers, currently up to 1000 kg. The website is a
landing page plus a catalog whose single job is to move a visitor to request a
quote over WhatsApp; there is no online checkout. Success is a qualified WhatsApp
conversation that leads to a delivered, invoiced sale.

## Positioning

- Fully electric cargo trikes sold in capacity tiers (currently 500 / 800 / 1000 kg);
  the core pitch is eliminating fuel spend versus a gasoline vehicle.
- Cash on delivery at the buyer's door, nothing paid in advance — stated on the site;
  the owner has not confirmed this as an unconditional promise (see Capabilities and
  Constraints).
- Nationwide dispatch with freight priced by locality; the site currently claims
  same-day or next-day dispatch (firmness unconfirmed).
- Every sale invoiced with IVA included, final price stated up front (firmness
  unconfirmed).
- Spare parts for all models available "at the best price" (owner's words).
- Sales and pre-purchase advice run through WhatsApp (+56 9 9912 5871), not a cart.

## Operating Context

- The entire funnel ends in a WhatsApp deep link: hero CTA, nav "Cotizar", per-model
  "Cotizar este modelo", the floating button, and the contact form (which composes a
  prefilled WhatsApp message rather than sending anything server-side).
- Buyers self-select a model by comparing `capacidad_kg` to their typical load; the
  contact form asks model of interest and destination comuna.
- All copy is Chilean Spanish, informal "tú"; prices in CLP formatted `es-CL`; the
  trikes are referred to affectionately as "toritos" / "el torito".
- Catalog content is database-driven (Supabase `products`) and edited by the admin:
  price, price note, spec rows, photo URLs, color swatches, featured flag + label,
  sort order, active flag. Product and hero imagery lives in Supabase Storage
  (`product-images`), referenced by public URL, and is not in the repo or the deploy
  payload.
- Accounts exist so customers can "hacer seguimiento a sus cotizaciones", though
  quote tracking itself is not yet built.

## Capabilities and Constraints

Built and working:

- Public landing page (hero, "cómo trabajamos" services, DB-driven model catalog,
  testimonials, contact section), footer, and a floating WhatsApp button.
- Model cards with color-swatch and photo switching, featured treatment, a spec
  table, and a per-model WhatsApp CTA; an inline SVG placeholder shows when a model
  has no photos.
- Contact form that validates name + phone and opens WhatsApp with a prefilled
  message; nothing is stored or emailed.
- Email + password accounts: `/registro`, `/login`, `/perfil` (edit display name,
  change password). Email is auto-confirmed by a DB trigger.
- Role-gated `/admin` panel: create / edit / delete products, upload photos straight
  to Storage with the admin session, toggle `activo` and `destacado`. RLS enforces
  admin-only writes.

Constraints and undecided facts:

- Sales channel is WhatsApp only; no cart, payment, or order object exists and none
  is in current scope.
- No SMTP configured, so there is no email password reset; Supabase "leaked password
  protection" is off.
- The three landing-page testimonials (Roberto Muñoz, Carolina Vidal, Jorge Paredes)
  are invented placeholders — future work must not present them, their names, or
  their claims as real customer evidence.
- The operational promises (pay on delivery, same-/next-day dispatch, nationwide
  delivery, IVA invoice on every sale) are published claims the owner declined to
  confirm as unconditional; verify before amplifying them or making them more
  prominent.
- Warranty is 1 year on the vehicle. Spare parts and repair / service support exist
  for all models.
- This machine has no git remote and no Node runtime; builds use a scratchpad Node,
  and deploys go through the Vercel MCP (`deploy_to_vercel`, team `proyecto29`,
  project `orient-lion-chile`) and require `projectSettings: { framework: "nextjs" }`.
- Terminology to preserve: "torito" / "torito eléctrico de carga", capacities in
  kilos, "cotizar", "contra entrega", "flete", "comuna".

## Brand Commitments

- Name: Orient Lion / Orient Lion Chile. Wordmark "ORIENT LION" with "LION" set in a
  dimmer weight; the mark is a concentric-circle roundel.
- Voice: plain, direct, and reassuring about money risk — "sin vueltas", "sin líos",
  "sin sorpresas", "no adelantes ni un peso hasta tener el vehículo en tus manos".
  Speaks to working people in the informal "tú", with no corporate register.
- The affectionate "torito" framing is part of the brand, not incidental.
- WhatsApp is the deliberate primary contact and sales channel.

No logo file, color specification, or typography standard has been declared binding
by the owner.

## Evidence on Hand

- Real product photography in the repo: `images/500kg-rojo-1.jpg`,
  `images/500kg-rojo-2.jpg`, `images/500kg-rojo-3.jpg` (red 500 kg model), and
  `images/triciclo-azul.png` (blue trike); the hero image is in Storage at
  `product-images/site/hero-torito.png`. Live catalog photos are additional URLs
  held in the database.
- Capacity tiers referenced in the UI: 500, 800, 1000 kg.
- WhatsApp number: +56 9 9912 5871.
- Physical store, confirmed real: San Diego 310, Santiago, Región Metropolitana,
  Chile. Shown on the landing page (contact section, with an embedded map) and
  in the footer.
- After-sales the owner confirms is real: 1-year vehicle warranty, spare parts
  stocked for all models, repair / service support.
- Not available and not to be fabricated: real customer testimonials or reviews,
  sales or unit counts, pricing history (live prices come from the database only),
  press, case studies, store hours, or company-history claims.

## Product Principles

1. Every screen's job is to start a WhatsApp conversation; judge surfaces by whether
   they make that easier, not by time on page.
2. Speak to someone deciding whether to trust a stranger with a large purchase — lead
   with the money-risk reversal (pay on delivery, invoice, warranty), not with specs.
3. The buyer's mental model is "how much can it carry vs. what I haul daily";
   capacity is the primary axis of the catalog.
4. Never dress up unverified claims or placeholder social proof as fact; if the
   evidence isn't in hand, don't imply it.
5. The catalog is the owner's to run day to day — keep it fully editable through
   `/admin`, and make no design choice that assumes a fixed model count, copy, or
   set of photography.

## Accessibility & Inclusion

The audience skews non-technical and mobile-first, often on variable mobile
connections; keep flows lightweight and legible. Interface language is Spanish
(`lang="es"`). No formal conformance standard has been set by the owner.
