# Design System — Go User Manager

A locked design system for the Go User Manager web application. Every page and component in this frontend reads and complies with this design specification.

## Genre
`modern-minimal`

## Macrostructure Family
- **App Pages** (`DashboardLayout`, `UsersPage`, `ProfilePage`, `SettingsPage`): **Workbench** layout (refined floating sidebar navigation, hairline borders, asymmetric metrics/containers, high-contrast typography).
- **Auth Pages** (`LoginPage`, `RecoverPasswordPage`): **Centered Panel Card** (tinted OKLCH paper, solid ink typography, clean form controls).

## Theme Tokens (OKLCH Palette)
- `--color-paper`: `oklch(98.5% 0.005 260)` / Dark: `oklch(15.5% 0.01 260)`
- `--color-paper-2`: `oklch(96.5% 0.008 260)` / Dark: `oklch(19.5% 0.012 260)`
- `--color-ink`: `oklch(20% 0.02 260)` / Dark: `oklch(96% 0.005 260)`
- `--color-ink-2`: `oklch(45% 0.02 260)` / Dark: `oklch(70% 0.015 260)`
- `--color-rule`: `oklch(90% 0.01 260)` / Dark: `oklch(26% 0.015 260)`
- `--color-accent`: `oklch(58% 0.23 275)` (Violet / Indigo Accent)
- `--color-accent-hover`: `oklch(50% 0.24 275)`
- `--color-accent-ink`: `oklch(99% 0 0)`
- `--color-focus`: `oklch(62% 0.22 275)`
- `--color-danger`: `oklch(60% 0.22 25)`
- `--color-success`: `oklch(62% 0.18 145)`

## Typography
- Display: `Space Grotesk`, sans-serif (Weights: 600, 700)
- Body: `Inter`, sans-serif (Weights: 400, 500, 600)
- Mono: `JetBrains Mono`, monospace (Weights: 400, 500)
- **No italic headers**. Headings are strictly roman (`font-style: normal`).

## Iconography & Affordances
- Icon Library: `lucide-react` (Stroke width: 1.75px, size: 18-20px).
- Zero OS emoji glyphs (`⚡`, `👤`, `👥`, `⚙️`, `🚪`, `🔐`, `🔍`, `✏️`, `🗑️`, `🔒`, `📷`) in production UI.

## Microinteractions & Motion
- Hover transitions: `transition: background-color var(--dur-short) var(--ease-out), border-color var(--dur-short) var(--ease-out)`
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (`var(--ease-out)`)
- Focus rings: `:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }` (Instant display, no delay).
