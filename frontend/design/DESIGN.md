# Design System Strategy: The Sovereign Ledger

## 1. Overview & Creative North Star
**Creative North Star: "The Architectural Vault"**

This design system moves away from the "SaaS-standard" look of boxes and lines. Instead, it treats the Contract Ledger platform as a high-end architectural space—a digital vault that is both impenetrable and transparent. The aesthetic is defined by **Atmospheric Depth**; we do not build interfaces, we layer light and glass. 

The experience must feel "State-of-the-Art" through intentional asymmetry: large, editorial headlines paired with high-density data visualizations. We break the grid by allowing glass containers to overlap slightly, creating a sense of physical space and "living" documents.

## 2. Colors & Surface Philosophy
The palette is rooted in the depth of a midnight sky (`background: #0e0e10`), punctuated by the "electric intelligence" of Indigo and Emerald.

### The "No-Line" Rule
Traditional 1px borders are strictly prohibited for sectioning. They create visual noise and "trap" the data. Structure is defined exclusively through:
*   **Tonal Shifts:** Placing a `surface_container_low` section against the `surface` background.
*   **Negative Space:** Using the `12` (4rem) and `16` (5.5rem) spacing tokens to create breathing room between functional blocks.

### Surface Hierarchy & Nesting
Treat the UI as a series of nested frosted glass sheets. 
*   **Base:** `surface` (#0e0e10).
*   **Primary Containers:** `surface_container` (#19191c).
*   **Floating/Active Elements:** `surface_container_highest` (#262528) with a 60% opacity and a `backdrop-blur` of 20px.

### The "Glass & Gradient" Rule
To ensure the dashboard feels premium, use subtle linear gradients (135°) for primary actions, transitioning from `primary` (#a3a6ff) to `primary_container` (#9396ff). This adds "soul" and prevents the UI from feeling "flat-dark."

## 3. Typography
We utilize a dual-font high-end editorial approach to balance authority with readability.

*   **Display & Headlines (Manrope):** Used for "The Big Picture." Large scales like `display-lg` (3.5rem) should be used for contract values or total counts to create an authoritative, data-rich impact.
*   **Body & Labels (Inter):** Used for the "Fine Print." Inter's neutrality ensures that complex legal text remains legible. 
*   **The Power Scale:** By pairing a `headline-lg` title with a `label-sm` metadata tag in `secondary` (#69f6b8), we create a high-contrast hierarchy that guides the user’s eye to what matters first.

## 4. Elevation & Depth
Depth is a functional tool, not a decoration. We use **Tonal Layering** to convey importance.

*   **The Layering Principle:** A "Summary Card" should be `surface_container_lowest`. When hovered, it transitions to `surface_container_high`, creating a natural "lift" without moving a single pixel.
*   **Ambient Shadows:** For floating modals or dropdowns, use a shadow with a 40px blur, 0% spread, and a color of `on_surface` (#f9f5f8) at **4% opacity**. This mimics the soft glow of a screen in a dark room.
*   **The Ghost Border Fallback:** If a boundary is required for accessibility in data tables, use `outline_variant` (#48474a) at **15% opacity**. It should be felt, not seen.
*   **Glassmorphism:** Navigation rails and top bars must use `surface_container_low` at 70% opacity with a `saturate(180%)` backdrop filter to keep the underlying "slate" tones vibrant.

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_dim`), `xl` (0.75rem) roundedness, `title-sm` typography. 
*   **Secondary:** Ghost style. No background, `outline` token at 20% opacity, `on_surface` text.
*   **Tertiary:** Text only in `secondary` (#69f6b8) for "Success" actions like "Execute Contract."

### Inputs & Fields
*   **Visual Style:** Forgo the "box." Use a `surface_container_highest` background with a bottom-only "Ghost Border."
*   **States:** On focus, the bottom border glows with `secondary` (#69f6b8) and a subtle 4px outer glow.

### Cards & Lists (The Ledger View)
*   **Rule:** Forbid divider lines. 
*   **Implementation:** Separate contract entries using `2` (0.7rem) vertical spacing. Use a background shift (`surface_container_low` vs `surface_container`) to define rows.
*   **The "Active" Row:** Should use a subtle `secondary_container` (#006c49) background at 10% opacity to highlight the current selection.

### Custom Component: The "Status Pulse"
*   For active contract monitoring, use a `secondary` (#69f6b8) dot with a CSS animation that pulses a 10% opacity ring outward. It communicates "Live Data" without needing a label.

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical padding. A dashboard sidebar can have `spacing-6` left padding and `spacing-4` right padding to create a bespoke, custom-built feel.
*   **Do** lean into the "Slate" depth. Use `surface_bright` (#2c2c2f) sparingly only for tooltips or high-priority callouts.
*   **Do** use `secondary_fixed` (#69f6b8) for all monetary values to signify growth and "Green-lit" status.

### Don't:
*   **Don't** use pure white (#FFFFFF). Always use `on_surface` (#f9f5f8) to avoid harsh eye strain in dark mode.
*   **Don't** use hard-edged corners. Every container must use at least `lg` (0.5rem) roundedness to maintain the "Glassware" aesthetic.
*   **Don't** crowd the screen. If a dashboard feels "busy," increase the spacing between containers by one tier in the scale rather than shrinking the text.