```markdown
# Design System: The Botanical Editorial
 
## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Digital Apothecary."** 
 
We are moving away from the "template" look of health-food e-commerce. Instead, we are building a high-end editorial experience that feels like a premium lifestyle magazine. This system rejects the rigid, boxy constraints of traditional web design in favor of **Intentional Asymmetry** and **Tonal Depth**. 
 
To achieve this, we utilize overlapping elements (e.g., a botanical motif bleeding behind a product card) and a high-contrast typography scale that juxtaposes a massive, sophisticated serif against hyper-clean, functional sans-serif metadata. The goal is to make the user feel they are browsing a curated collection of wellness, not just a grocery list.
 
---
 
## 2. Colors & Surface Architecture
 
The color palette is rooted in African botanicals, translated into a sophisticated Material hierarchy.
 
### Color Tokens
- **Primary (Hibiscus):** `#66001e` – Used for moments of high-brand authority and primary actions.
- **Secondary (Baobab):** `#4d6630` – Used for organic accents and wellness-focused UI elements.
- **Tertiary (Tamarind/Gold):** `#735c00` – Reserved for premium highlights and rewards.
- **Background (Soft Cream):** `#fcf9f4` – The "paper" on which our editorial sits.
 
### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for sectioning. Separation of concerns must be achieved through:
1.  **Background Color Shifts:** A section using `surface-container-low` placed against the `surface` background.
2.  **Generous Negative Space:** Using 80px+ vertical padding to define a transition.
3.  **Soft Tonal Transitions:** Subtle gradients transitioning from `surface` to `surface-container`.
 
### Surface Hierarchy & Nesting
Treat the UI as physical layers of fine vellum paper.
- **Layer 0 (Base):** `surface` (#fcf9f4).
- **Layer 1 (Sections):** `surface-container-low` (#f6f3ee) for large content areas.
- **Layer 2 (Cards):** `surface-container-lowest` (#ffffff) to provide a "bright" lift for product highlights.
- **Layer 3 (Floating UI):** Use semi-transparent versions of `surface_bright` with a `20px` backdrop-blur for navigation bars.
 
### The "Glass & Gradient" Rule
To add "soul," primary buttons and hero backgrounds should utilize a subtle linear gradient: `primary` (#66001e) to `primary_container` (#8d0b2f) at a 135-degree angle. This creates a velvet-like depth that flat hex codes cannot replicate.
 
---
 
## 3. Typography
 
The typography strategy relies on the tension between the "Old World" authority of Noto Serif and the "Modern Precision" of Manrope.
 
### Type Scale
- **Display (Noto Serif):** Use `display-lg` (3.5rem) for hero statements. Tighten the letter-spacing by -0.02em for a high-end editorial feel.
- **Headline (Noto Serif):** Use `headline-lg` (2rem) for section titles. These should often be center-aligned or intentionally offset to the left.
- **Title (Manrope):** Use `title-md` (1.125rem) for product names. Set in Medium weight for clarity.
- **Body (Manrope):** Use `body-lg` (1rem) for all descriptive text. Ensure a generous line-height (1.6) to maximize readability.
- **Label (Manrope):** Use `label-md` (0.75rem) for Banting/Vegan tags, set in All-Caps with +0.05em letter-spacing.
 
---
 
## 4. Elevation & Depth
 
### The Layering Principle
Do not use shadows to create hierarchy; use **Tonal Layering**. 
*Example:* A `surface-container-lowest` (pure white) card sitting on a `surface-container-low` (pale cream) background creates a natural, sophisticated lift.
 
### Ambient Shadows
When a floating element (like a "Buy Now" FAB) is necessary, use an ambient shadow:
- **Shadow Color:** `#584143` (at 6% opacity).
- **Blur:** 32px.
- **Spread:** -4px.
- **Offset:** Y: 12px.
 
### The "Ghost Border" Fallback
If accessibility requires a container boundary, use the `outline_variant` (#dfbfc0) at **15% opacity**. Never use a 100% opaque border.
 
---
 
## 5. Components
 
### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `xl` (1.5rem) rounded corners, white text.
- **Secondary:** Transparent fill with a `Ghost Border` and `primary` colored text.
- **Tertiary:** No fill or border. `title-sm` typography with a `secondary` color and a subtle botanical icon suffix.
 
### Cards (The "Organic Container")
- **Shape:** Use `xl` (1.5rem) roundedness.
- **Padding:** 24px internal padding.
- **Rule:** Never use dividers. Separate the image from the text using a `16px` vertical gap or a slight background color change within the card footer.
 
### Botanical Accents (Custom Component)
- **Motifs:** Use SVG-based leaf/fruit motifs in `on_secondary_container` (#516a34) at 5%–10% opacity. 
- **Placement:** Position these motifs to "break" the container edges, peeking out from behind cards or floating in the corner of sections to soften the digital geometry.
 
### Inputs
- **Style:** Underline-only or subtle "Surface Lowest" fills. 
- **Active State:** The label should float and transition to `primary` color. The underline should thicken to 2px using the `tertiary` (Gold) accent.
 
---
 
## 6. Do's and Don'ts
 
### Do:
- **Do** use asymmetrical layouts (e.g., image on the left, text offset to the right-center).
- **Do** prioritize white space. If you think there's enough room, add 20% more.
- **Do** use `secondary_container` (#cceaa6) for success states or "Natural" callouts instead of a generic "Green."
 
### Don't:
- **Don't** use black (#000000). Use `on_surface` (#1c1c19) for all "black" text to maintain warmth.
- **Don't** use standard "drop shadows." They feel cheap. Use tonal shifts or ambient blurs.
- **Don't** use sharp corners. This brand is "Plant-Based" and "Natural"—it should feel soft and approachable.
- **Don't** use horizontal dividers. Let the content breathe to define its own borders.
