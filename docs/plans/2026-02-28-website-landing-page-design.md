# Mindspark Landing Page Design

**Date:** 2026-02-28
**Status:** Approved
**Approach:** Integrated into existing Next.js project (方案 A)

## Overview

Build a product landing page for Mindspark within the existing Next.js application. The page serves as the public-facing entry point for all users, communicating what Mindspark is, its core value, and driving sign-ups.

## Goals

- Attract and convert new users across broad audiences (general users + tech enthusiasts)
- Communicate Mindspark's core value: "Record = Query = Result" with zero cognitive load
- Maintain brand consistency with the app's Morandi aesthetic
- Support both Chinese and English

## Architecture

### Routing

| Route | Purpose |
|-------|---------|
| `/` | Landing Page (new) |
| `/app` | Main note-taking canvas (moved from `/`) |
| `/daily-review` | Daily review page (unchanged) |
| `/sign-in` | Clerk auth (unchanged) |
| `/sign-up` | Clerk auth (unchanged) |

Logged-in users visiting `/` are redirected to `/app`.

### i18n Strategy

- Lightweight: language toggle button (中/EN) in navbar
- React state + context for current locale
- Translation strings stored in JSON objects per component (no external i18n library)
- Default language detected from browser `navigator.language`

## Page Structure (Single-page scroll)

```
┌─────────────────────────────────────┐
│  Navbar                             │
│  Logo | Features | How | FAQ | Lang │
│  [开始使用 CTA]                      │
├─────────────────────────────────────┤
│  Hero Section                       │
│  Tagline + subtitle + mockup + CTA  │
├─────────────────────────────────────┤
│  Features Section (4 cards)         │
│  Smart classify | AI process |      │
│  Daily review | Share               │
├─────────────────────────────────────┤
│  How It Works (3 steps)             │
│  Note → AI processes → Review       │
├─────────────────────────────────────┤
│  Value Proposition                  │
│  Traditional AI chat vs Mindspark   │
├─────────────────────────────────────┤
│  FAQ (4-6 items)                    │
├─────────────────────────────────────┤
│  Final CTA                          │
├─────────────────────────────────────┤
│  Footer                             │
└─────────────────────────────────────┘
```

## Visual Design

### Color Palette (Morandi)

- Sage: `#949F97`
- Cream: `#EBE2AA`
- Mint: `#C8D5C5`
- Beige: `#EEE9D0`
- Text dark: `#2D3436`
- Text light: `#636E72`
- Background: warm white with floating gradient orbs

### Style Elements

- Glassmorphism cards (backdrop-blur, semi-transparent backgrounds)
- Floating gradient circles in background (consistent with app)
- Smooth scroll animations (fade-in + slide-up on section enter)
- Responsive: mobile-first, works on all screen sizes

## Content

### Hero Section

**Chinese:**
- Tagline: 「记录即思考，AI 帮你连点成线」
- Subtitle: 「不用刻意和 AI 对话，只需随手记录，MindSpark 自动帮你整理、回答、拓展每一条想法」
- CTA: 「免费开始使用」

**English:**
- Tagline: "Just note it. AI connects the dots."
- Subtitle: "No need to chat with AI deliberately. Just capture your thoughts — MindSpark automatically organizes, answers, and expands every idea."
- CTA: "Get Started Free"

### Features (4 cards)

1. **Smart Classification** - AI auto-categorizes notes into Action, Query, Idea, Resource
2. **Deep AI Processing** - Auto-decompose todos, instant answers, creative expansion
3. **Daily Review** - AI semantic summary + theme clustering + spaced repetition of old insights
4. **One-Click Share** - Generate beautiful cards for social media

### How It Works (3 steps)

1. **Capture** - Jot down any thought, anytime
2. **AI Processes** - Automatic classification and intelligent expansion
3. **Review & Grow** - Daily AI-powered review surfaces patterns and forgotten gems

### Value Proposition

Comparison table: Traditional AI Chat Apps vs Mindspark
- Interaction mode: Active prompting vs Passive recording
- Cognitive load: High (learn prompting) vs Zero (use existing habits)
- Knowledge management: Scattered conversations vs Structured + reviewed
- Learning loop: None vs Daily review with spaced repetition

### FAQ

1. Is Mindspark free? — Yes, free to use with generous limits.
2. Is my data safe? — Encrypted and stored securely via Supabase. We don't sell your data.
3. What platforms are supported? — Web app, accessible from any browser.
4. What AI models are used? — Google Gemini and Qwen for different tasks.
5. Can I export my notes? — Yes, beautiful shareable cards or future export options.

## Technical Implementation

### New Files

- `app/(landing)/page.tsx` — Landing page (server component shell)
- `app/(landing)/layout.tsx` — Landing layout (no app chrome)
- `components/landing/` — All landing page components:
  - `Navbar.tsx`
  - `HeroSection.tsx`
  - `FeaturesSection.tsx`
  - `HowItWorks.tsx`
  - `ValueProposition.tsx`
  - `FAQSection.tsx`
  - `CTASection.tsx`
  - `Footer.tsx`
  - `LanguageToggle.tsx`
- `lib/i18n.ts` — Translation strings and locale context
- Move current `/` page to `/app` route group

### Animation

- Use CSS animations + Intersection Observer for scroll-triggered effects
- No heavy animation libraries needed
- Subtle: fade-in, slide-up, scale-in for cards

### Responsive Breakpoints

- Mobile: < 640px (stack everything vertically)
- Tablet: 640-1024px (2-column feature grid)
- Desktop: > 1024px (full layout)

## Testing

- Visual review across breakpoints (mobile, tablet, desktop)
- Language toggle works correctly
- CTA buttons link to correct routes
- Logged-in user redirect works
- Accessibility: keyboard navigation, screen reader friendly
- Performance: Lighthouse score > 90
