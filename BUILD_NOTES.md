# Purelane homepage: build notes

Built on stock Dawn. All Purelane code is namespaced (`pl-` classes, `--pl-` tokens) so it can't restyle anything Dawn owns.

## What I'd flag about the original file

1. **Two colour themes ship at once.** A dark `:root` palette loads first, then a second `<style>` block ("VERSION 2, light") overrides the same variables. The light one is what renders, so that's the spec. The dark block is dead weight, and it's easy to copy values from the wrong one (I did, once: see "Mistakes caught" below).
2. **The page is one script, not independent sections.** A fixed full-screen background cross-fades based on each section's `data-scene="1..4"`, which assumes a fixed page order. Reorder or remove a section in the theme editor and the backgrounds go wrong. Each section here owns its background as a merchant setting instead.
3. **The markup is broken in places.** The hero's slide-dots `<div>` is cut off mid-element, and the reviews track is truncated in the middle of an `<h5>`. Browsers patch this silently, which hides the bug.
4. **Products are drawings, not products.** Bottles are base64 SVG backgrounds and inline SVGs, with prices and review counts typed into the HTML. The shop shelf also repeats the same four products twice (the second set as inline SVG instead of the shared asset).
5. **"Add to cart" does nothing.** It's a bare `<button>` with no form, variant or handler, and product cards don't link to the product page.
6. **Heading levels skip** from `h2` to `h4` on cards, and `h5` on review cards.
7. **Reveal animations hide content without JS.** `.rv` sets `opacity: 0` unconditionally, so if the script fails the page is blank below the fold. The blur filter on every revealing element is also costly to paint.
8. **Class names collide with Dawn.** `.card`, `.btn`, `.badge`, `.wrap` would clash with or be restyled by Dawn's CSS.
9. **Heavy animated SVG filters** (`feTurbulence` / `feDisplacementMap`) repaint continuously behind the whole page.
10. Fonts load from Google Fonts: two extra third-party connections before any text can render in the right typeface.

## What I changed and why

**Shared layer** (`assets/purelane-base.css`, `assets/purelane-reveal.js`, `snippets/purelane-head.liquid`)
- One token set (light palette), glass panel, buttons, type, divider and card styles, loaded once from `theme.liquid`.
- Reveal only hides content when Dawn's `.js` class is present, and the script re-scans on `shopify:section:load` / `reorder`, so sections added in the editor never get stuck invisible. Reduced motion shows everything immediately.

**Hero** (`sections/hero-banner.liquid`)
- Badges and product slides are blocks, so marketing can add, remove, reorder and relabel them. Desktop rail and mobile strip render from the same block loop.
- Slide images, prices and compare-at prices come from the chosen products.
- Buttons use the shared `pl-btn` classes.

**Shop grid** (`sections/purelane-shop.liquid`, `snippets/purelane-product-card.liquid`)
- Products come from a merchant-picked collection; count and desktop columns are settings. Default is 8 products in 4 columns, matching the file.
- Card is a snippet so combos and bundles can reuse it.
- Badge pill reads `custom.badge`. Rating reads Shopify's standard `reviews.rating` / `reviews.rating_count` (what review apps write) and falls back to `custom.rating` / `custom.review_count` for a store with no app yet.
- Real add to cart: a native product form posting the variant, so it works without JS. Multi-variant products link to the product page ("Choose options"). Sold-out products get a disabled "Sold out" button. Button text uses Dawn's own translation keys.
- Missing image falls back to Shopify's placeholder SVG; long titles clamp at three lines and stay fully readable to screen readers.
- Card titles are `h3` links; ratings and struck prices get screen-reader text.
- Anchor ID is a setting (default `shop`) so the hero's "Shop now" link keeps working wherever the section sits.

**Reviews rail** (`sections/purelane-reviews.liquid`, `assets/purelane-reviews.js`)
- Each review is a block (stars, title, text, name, verified tick, product). The product label comes from a product picker, with a text override, so it stays in sync with the catalogue.
- The two headline stats are inline rich text settings, so marketing can bold the number without touching code.
- Marquee is pure CSS. The loop duplicates the list once in Liquid; the copy is `aria-hidden` so screen readers hear each review once. The original used a gap on the track, which makes the -50% loop jump by half a gap at the seam; each list now carries its own trailing space so the seam is exact.
- Pauses on hover and on focus, and a pause button appears for keyboard users (auto-moving content over 5 seconds needs a way to stop it). Reduced motion turns it into a normal swipeable row with the duplicate removed.
- Loop speed is a setting; mobile runs at the same 0.77 ratio the original used (52s to 40s).
- Kicker is now the section's `h2` (it was a `span`, so the section had no heading), and card titles are `h3` instead of `h5`. Visual output unchanged.

**Bundles** (`sections/purelane-bundles.liquid`)
- Each tier is a block that points at a real **bundle product** (e.g. "Starter box: any 2 products", ₹349, compare-at ₹598). Price, struck price and the per-product figure all come from that product. Change the price in admin and the section, cart and checkout all agree.
- The hero's product slides can now take their price from the same bundle product ("Price this slide from"), so "Any 2 products ₹349" in the hero and the Starter tier can't drift apart. Before this, the hero added up individual bottle prices, which didn't match the design.
- Tier features are one-per-line text, the pictured bottles are a product list (images come from the catalogue), and the highlighted tier gets the primary button and accent border, as in the file.
- The original's hardcoded per-product maths was inconsistent: ₹349 / 2 = ₹174.50 shown as ₹174 (rounded down), ₹799 / 5 = ₹159.80 shown as ₹160 (rounded up). It's now calculated and rounded the same way every time, so the Starter tier reads ₹175. That's one intentional visual difference, and it's a correctness fix.
- The other: tier buttons are pinned to the bottom of each card. In the file the Starter tier has one fewer feature line, so its button sits higher than its neighbours. Aligning them is a layout-logic fix, not a restyle; everything else about the cards is unchanged.

**Combos** (`sections/purelane-combos.liquid`)
- Each combo card is a block pointing at a real **combo product** (price, compare-at, savings) plus a product list for what's inside. Title and description default to the combo product's own, with overrides.
- The one-line benefit under each bottle in the tray ("Cuts grease instantly") is a product metafield, `custom.tagline`, not text typed into the section. Write it once per product and every combo that includes that product shows it.
- "3 products" is counted from the included list, and "You save ₹398" is calculated. The "Biggest saving" pill is an optional override.
- A product with no image falls back to the dashed leaf tile, which is how the file already draws the fabric conditioner.
- In the file the toilet cleaner has two different taglines in two combos ("Kills 99.9% germs" and "Fights limescale in the bowl"). With one metafield per product that can't happen; it's the same product, so it gets one description. Flagging it rather than adding a per-combo override nobody would maintain.
- Rail is a native horizontal scroller with snap, same as the file. Cards are list items; titles are `h3`.

**Fonts** (`snippets/purelane-head.liquid`)
- Outfit and Inter are self-hosted on the Shopify CDN as variable woff2 files (one file per family covers every weight) and preloaded. That removes the Google Fonts round trips and clears Theme Check's `RemoteAsset` warnings.
- "₹" isn't in the latin subset. Rather than load the 15 to 85 KB latin-ext files for one character, each family gets a ~1 KB subset containing only U+20B9, picked up automatically through `unicode-range`.
- Theme Check now reports zero errors and no warnings in any Purelane file; the remaining warnings are in stock Dawn files.

**CI** (`.github/workflows/ci.yml`)
- Dawn's Lighthouse job needs store secrets and failed on every push, so it's removed. Theme Check still runs on every push.

## Bonus

**Club signup** (`sections/purelane-signup.liquid`)
- The prototype's form was `onsubmit="return false"`, so signing up did nothing. It now posts to Shopify's customer form: the email is saved in Customers with marketing consent and the tags `newsletter, purelane-club`, ready for Shopify Email.
- Success and error states are rendered by Shopify after the post; the success message is rich text so marketing can put the live discount code in it.
- Real `<label>` for the email field, `autocomplete="email"`, and a visible focus ring (the file set `outline: none` with no replacement).

**Header and announcement bar** (restyle of Dawn's `header` and `announcement-bar` sections, `assets/purelane-base.css`)
- Dawn's header is restyled into the prototype's floating glass pill rather than replaced. Dawn keeps handling dropdown menus, the mobile drawer, predictive search, the live cart count and account links, which the prototype's header only drew (its buttons did nothing).
- Brand lockup is an image in Theme settings > Logo, and the links come from Content > Menus, so both are editable without code. Menu underline is the prototype's slide-in accent bar.
- On the home page the header floats over the hero and stays pinned while scrolling, done with `position: sticky` and a negative bottom margin, no scroll listener. Other pages get the same pill in normal flow.
- Announcement bar is styled as the prototype's light ticker strip. It rotates messages (Dawn's behaviour) rather than scrolling them as a marquee; I kept Dawn's version because it's accessible out of the box.
- On phones Dawn's layout is kept (menu button on the left), where the prototype puts it on the right.

## Metafield definitions (Products)

| Namespace.key | Type | Used for |
|---|---|---|
| `custom.badge` | Single line text | Card pill ("Best seller", "New") |
| `custom.rating` | Decimal | Rating fallback |
| `custom.review_count` | Integer | Review count fallback |
| `custom.tagline` | Single line text | One-line benefit under each bottle in combo trays |

## Mistakes caught in review

- The first hero pass copied button colours from the dark palette (amber gradient) instead of the light one (teal), and defined `.button` globally, which restyled every Dawn button in the store, including Add to cart on product pages. Moved to namespaced `pl-btn` with the light-palette values.
- Hero overlay defaulted to 45% dark, which isn't in the design. Default is now 0.

## Known gaps / what I'd do with more time

- **The mix-and-match picker itself.** "Build this box" goes to the bundle product. Letting the customer choose which 2, 3 or 5 products go in needs Shopify Bundles or a bundle app with line-item properties; that's a product decision as much as a build.
- **Water background.** Replaced with static per-section gradients for performance. Visually close but not identical to the animated original; with more time I'd rebuild the caustics as a single lightweight canvas or pre-rendered video loop and measure it.
- Add `size-adjust` fallback faces so the swap from system font to Outfit/Inter causes no layout shift.
- AJAX add to cart through Dawn's cart drawer instead of a full page post.
- Reviews as a metaobject (or read from a review app) so the same reviews can feed product pages, not just this section.
- The combos rail hides its scrollbar, as the file does. Keyboard users reach every card by tabbing through the buttons, but mouse users without a trackpad have no visible way to scroll. I'd add small prev/next arrows on desktop and flag it to design first.
- Store currency format set to `₹{{amount_no_decimals}}` to match "₹200".

## AI workflow

- **Delegated:** mapping the 1,700-line file (section boundaries, the duplicate palette, broken tags), first-pass Liquid and schema, extracting exact CSS values per selector, seed product CSV.
- **Where it failed:** it pulled values from the wrong palette and wrote an unscoped `.button` rule that leaked into all of Dawn. Both passed a read-through and only showed up when the section was viewed inside a real store next to Dawn's own pages. It also defaulted to "simplify the expensive effect" without flagging that the brief treats visual changes as a fail.
- **What I'd systematise for 20 more:** a token-extraction script that dumps only the winning cascade values per selector, a namespace lint that rejects any selector not prefixed `pl-`, a standard card snippet contract, and a screenshot diff at 375 / 768 / 1280 against the prototype before anything is called done.
