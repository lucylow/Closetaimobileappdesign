# ClosetAI 🚀 — AI Wardrobe, Virtual Try-On & Skin Care Mobile App

**ClosetAI** is a cross-platform React Native + Expo mobile application that combines **AI-powered wardrobe management, virtual try-on, personalized styling, creative shopping journeys, and a new Skin Care experience** into one consumer fashion-and-beauty platform.

The newest Skin Care experience is designed to connect **how you dress, how you style yourself, and how you care for your skin** inside one mobile journey.

> **Hackathon focus:** YouCam API Skin AI + Apparel Virtual Try-On
> **Current development mode:** Skin Care includes a demo-first mock-data experience so the mobile UI can be demonstrated reliably in Expo while the live YouCam API integration is being finalized.

---

# ✨ Features at a Glance

| Consumer Experience            | AI / Beauty           | Virtual Try-On           | Business                  |
| ------------------------------ | --------------------- | ------------------------ | ------------------------- |
| 👗 AI Outfit Recommendations   | 🧬 Skin Care Snapshot | 👚 Clothing              | 💰 B2C + B2B              |
| 🪄 Virtual Try-On              | 💧 Hydration Analysis | 💍 Jewelry               | 🏢 Enterprise             |
| 🧴 Personalized Skin Care      | ✨ Radiance            | 👜 Accessories           | 📊 Analytics              |
| 🛍️ Creative Shopping Journeys | 🔴 Redness            | 👟 Footwear              | 🔄 Personalization        |
| 🌤️ Weather-Aware Styling      | 🧼 AM/PM Routine      | 🎩 Hats / Scarves / Bags | 🎯 Retail Recommendations |
| 👤 Personal Style Profile      | 🔎 Pores / Texture    | ⌚ Watches                | 🚀 AI Commerce            |

---

# 🎯 What Is ClosetAI?

ClosetAI is designed around a simple consumer question:

> **"How can I look and feel my best today?"**

Instead of treating fashion, beauty, skincare, and shopping as separate experiences, ClosetAI brings them together.

A user can:

1. Open the mobile application.
2. View their wardrobe.
3. Get an AI outfit recommendation.
4. Virtually try on an outfit.
5. Open the new **Skin Care** experience.
6. Review a personalized demo skin snapshot.
7. Explore a suggested morning or evening routine.
8. See skincare product recommendations.
9. Explore **Skin × Wardrobe** styling recommendations.
10. Eventually connect the experience to live YouCam Skin AI analysis.

The goal is to create a more complete personal styling journey rather than a collection of disconnected API demonstrations.

---

# 🧴 NEW: SKIN CARE EXPERIENCE

The newest major addition to ClosetAI is the **Skin Care** mobile experience.

The Skin Care feature was designed specifically for the YouCam API Skin AI & Apparel VTO Hackathon.

The hackathon requires projects to integrate at least one YouCam API and demonstrate meaningful consumer or retail value.

ClosetAI's Skin Care concept goes beyond simply displaying an API response.

The intended experience is:

```text
SELFIE / DEMO PROFILE
        ↓
SKIN SNAPSHOT
        ↓
SKIN CONCERNS
        ↓
PERSONALIZED ROUTINE
        ↓
PRODUCT RECOMMENDATIONS
        ↓
SKIN × WARDROBE
        ↓
PERSONALIZED STYLE JOURNEY
```

---

# 🧬 Skin Care Demo Mode

The current mobile implementation uses a **demo-first mock-data architecture**.

This is intentional.

The application should not appear blank when the user opens the Skin Care tab simply because:

* a YouCam API key is missing;
* a backend is unavailable;
* a selfie has not been selected;
* the asynchronous API request has not completed;
* the Expo environment cannot reach the production API;
* or the developer is testing the interface before connecting live data.

Instead, the Skin Care screen can immediately display a realistic **demo skin snapshot**.

### Demo Mode provides:

* Preloaded skin profile
* Overall skin score
* Skin type
* Hydration
* Oiliness
* Texture
* Pores
* Redness
* Blemishes
* Radiance
* Dark spots
* Fine lines
* AM skincare routine
* PM skincare routine
* Recommended skincare products
* Skin × Wardrobe recommendations
* Progress/history preview
* Demo scan controls
* Optional selfie flow

### Important

The demo values are **fictional mock data**.

They are not medical diagnoses and should not be presented as actual analysis of a user's skin.

The demo layer exists to make the mobile experience visible and testable.

---

# 📱 Skin Care Mobile Experience

When the user opens:

```text
Home
  ↓
Skin
```

the application should immediately show a complete Skin Care dashboard.

Example:

```text
──────────────────────────────

YOUCAM SKIN AI
DEMO EXPERIENCE

Skin Care

Your personalized skin snapshot

84
Overall Demo Score

Combination Skin

──────────────────────────────

SKIN METRICS

Hydration       78
████████████████░░░░

Oiliness        46
█████████░░░░░░░░░░

Texture         72
██████████████░░░░░░

Pores           39
████████░░░░░░░░░░░░

Redness         28
██████░░░░░░░░░░░░░░

Blemishes       18
████░░░░░░░░░░░░░░░░

Radiance        81
████████████████░░░░

Dark Spots      61
████████████░░░░░░░░

Fine Lines      67
█████████████░░░░░░░

──────────────────────────────

PERSONALIZED ROUTINE

Morning Routine
Cleanse
Hydrate
Protect

Evening Routine
Cleanse
Treat
Moisturize

──────────────────────────────

RECOMMENDED PRODUCTS

Hydrating Cleanser
Barrier Moisturizer
Niacinamide Serum
Daily SPF
Gentle Night Treatment

──────────────────────────────

SKIN × WARDROBE

Recommended colors
Recommended fabrics
Recommended styling

──────────────────────────────

LOAD DEMO SCAN

──────────────────────────────
```

The important UX principle is:

> **The Skin Care screen should never be empty just because live AI is unavailable.**

---

# 🧴 Skin Snapshot

The demo Skin Snapshot represents the beginning of the user's personalized skincare journey.

Example demo profile:

```text
Overall Score: 84

Skin Type:
Combination

Hydration:
78

Oiliness:
46

Texture:
72

Pores:
39

Redness:
28

Blemishes:
18

Radiance:
81

Dark Spots:
61

Fine Lines:
67
```

These values are illustrative UI data.

They should be clearly identified as demo information until live YouCam analysis is connected.

---

# 💧 Skin Metrics

The Skin Care experience provides a visual dashboard rather than presenting raw API output.

## Hydration

Example:

```text
Hydration
78 / 100
Good
```

Potential UI interpretation:

> Your demo profile indicates a generally hydrated skin profile.

---

## Oiliness

Example:

```text
Oiliness
46 / 100
Balanced
```

---

## Texture

Example:

```text
Texture
72 / 100
Good
```

---

## Pores

Example:

```text
Pores
39 / 100
Low concern
```

---

## Redness

Example:

```text
Redness
28 / 100
Low concern
```

---

## Blemishes

Example:

```text
Blemishes
18 / 100
Low concern
```

---

## Radiance

Example:

```text
Radiance
81 / 100
High
```

---

## Dark Spots

Example:

```text
Dark Spots
61 / 100
Moderate
```

---

## Fine Lines

Example:

```text
Fine Lines
67 / 100
Moderate
```

---

# 🧼 Personalized Skin Care Routine

The next layer converts skin information into an easy-to-understand routine.

## Morning Routine

Example:

### 1. Cleanse

Use a gentle cleanser to remove overnight oil and buildup.

### 2. Hydrate

Apply a lightweight hydrating product.

### 3. Treatment

Use a suitable treatment based on the user's selected skincare goals.

### 4. Moisturize

Apply moisturizer appropriate for the user's skin profile.

### 5. SPF

Finish with daily sunscreen.

---

# 🌙 Evening Routine

Example:

### 1. Cleanse

Remove makeup, sunscreen, and daily buildup.

### 2. Hydrate

Restore moisture.

### 3. Treatment

Apply the selected nighttime treatment.

### 4. Moisturize

Support the skin barrier with moisturizer.

---

# 🛍️ Mock Product Recommendations

The current demo implementation can include fictional or clearly labeled demonstration products.

Example:

```text
Hydra Balance Cleanser
Gentle daily cleanser

Barrier Restore Cream
Moisturizing barrier cream

Niacinamide Balance Serum
Lightweight treatment serum

Daily Shield SPF 50
Daily sunscreen

Night Renewal Cream
Evening moisturizer
```

These should remain clearly identified as **demo products** unless connected to a real product catalog.

The eventual production version can replace these records with:

```text
Real Product Catalog
        ↓
Ingredient Data
        ↓
Skin Concerns
        ↓
Compatibility Rules
        ↓
Personalized Recommendations
        ↓
Add to Cart
```

---

# 👗 Skin × Wardrobe

One of the most important differences between ClosetAI and a traditional skincare application is the connection between skincare and fashion.

The Skin Care experience should eventually connect to the user's wardrobe.

For example:

```text
SKIN SNAPSHOT
      +
WARDROBE
      +
STYLE PROFILE
      ↓
PERSONALIZED LOOK
```

The application can recommend:

### Colors

```text
Recommended:
• Soft neutrals
• Warm earth tones
• Deep greens
• Soft blues
```

### Outfit direction

```text
Today's recommendation:

Hydrating skincare routine
+
Cream knit top
+
Dark denim
+
Minimal gold accessories
```

### Styling considerations

The system can eventually use the user's selected preferences to suggest:

* outfit colors;
* accessories;
* neckline choices;
* clothing combinations;
* makeup-compatible styling;
* occasion;
* weather;
* personal wardrobe inventory.

This turns Skin Care into part of the broader ClosetAI experience.

---

# 📸 Selfie Flow

The intended live experience eventually begins with a selfie.

Example:

```text
Skin Care

Let's take a quick skin snapshot.

[ Choose Selfie ]

Use a clear, front-facing image
with good lighting.

[ Analyze My Skin ]
```

However, the application should not require a selfie to display the demo experience.

Therefore:

```text
No selfie
   ↓
Show demo skin profile
```

and:

```text
Selfie selected
   ↓
Try live YouCam analysis
   ↓
Success → Show live result
Failure → Show demo result
```

This architecture makes the app more resilient during development.

---

# 🧪 Demo-First Architecture

The Skin Care experience follows this pattern:

```text
                    ┌─────────────────┐
                    │   Skin Screen   │
                    └────────┬────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Demo Data Available │
                  └──────────┬──────────┘
                             │
                       YES ──┴── NO
                        │         │
                        ▼         ▼
                 Show Demo     Empty State
                 Immediately
                        │
                        ▼
                Optional Selfie
                        │
                        ▼
                Live YouCam API
                        │
                 ┌──────┴──────┐
                 │             │
               SUCCESS       ERROR
                 │             │
                 ▼             ▼
            Live Results    Demo Results
```

This prevents the mobile application from appearing broken during development.

---

# 🔌 YouCam API Integration

The eventual live architecture uses the YouCam Skin Analysis workflow.

Conceptually:

```text
Mobile App
    ↓
Backend
    ↓
Upload Image
    ↓
YouCam API
    ↓
Create Skin Analysis Task
    ↓
Poll Task Status
    ↓
Receive Results
    ↓
Normalize Results
    ↓
Mobile Skin Dashboard
```

The API credentials should never be placed directly into the React Native mobile application.

Use server-side secrets instead.

Example:

```text
PERFECT_YOUCAM_API_KEY
PERFECT_YOUCAM_SECRET_KEY
```

The mobile application should communicate with the application's backend.

---

# 🔐 Security

Do not expose API credentials in:

```text
app/
components/
lib/
public/
assets/
```

Do not hard-code:

```text
PERFECT_YOUCAM_API_KEY=...
```

into client-side React Native code.

Instead:

```text
Expo Mobile
     ↓
ClosetAI Backend
     ↓
YouCam API
```

The backend owns the credentials.

---

# 🧠 Skin Data Model

A simplified demo model can look like:

```ts
export interface SkinMetric {
  id: string;
  name: string;
  score: number;
  status: string;
  description?: string;
}

export interface SkinProfile {
  id: string;
  skinType: string;
  overallScore: number;
  metrics: SkinMetric[];
  lastUpdated: string;
}
```

Example:

```ts
const demoSkinProfile = {
  id: "demo-skin-001",
  skinType: "Combination",
  overallScore: 84,
  lastUpdated: "Demo",
  metrics: [
    {
      id: "hydration",
      name: "Hydration",
      score: 78,
      status: "Good"
    },
    {
      id: "oiliness",
      name: "Oiliness",
      score: 46,
      status: "Balanced"
    }
  ]
};
```

---

# 📊 Skin Progress

The application can eventually allow users to compare their skin snapshots over time.

Example:

```text
SKIN PROGRESS

July 12
Score: 79

July 26
Score: 82

August 11
Score: 84

        79 → 82 → 84
```

For the current mock implementation, this can remain fictional demo history.

The production version should only display real historical results after obtaining appropriate user consent and implementing the required privacy controls.

---

# 🧴 Skin Care Navigation

The mobile navigation should include Skin Care as a first-class experience.

Example:

```text
HOME
WARDROBE
STUDIO
SKIN
PROFILE
```

The Skin tab should be easy to discover from the Home screen.

A Home quick action can display:

```text
✨ Skin AI

Check your skin
Build your routine
Match your style
```

---

# 🏠 Home Screen Integration

The Home screen can include:

## Skin AI Quick Action

```text
──────────────────────────────

🧬 SKIN AI

Your skin snapshot is ready.

84
Demo Score

[ View Skin Care ]

──────────────────────────────
```

This creates a direct connection between the main ClosetAI experience and the new skincare module.

---

# 🎨 Design Principles

The Skin Care UI should feel like a native part of ClosetAI rather than an external embedded tool.

Recommended design characteristics:

* clean;
* premium;
* minimal;
* fashion-forward;
* beauty-oriented;
* mobile-first;
* easy to scan;
* strong visual hierarchy;
* large touch targets;
* readable metrics;
* clear demo labels.

Avoid overwhelming the user with raw technical API information.

The user should understand:

```text
How is my skin doing?
        ↓
What should I do?
        ↓
What products could help?
        ↓
How does this connect to my style?
```

---

# ⚠️ Medical & Safety Positioning

ClosetAI Skin Care should not present the application as a dermatologist or medical diagnostic service.

Use language such as:

```text
Skin insights
Skin snapshot
Skin concerns
Beauty recommendations
Skincare routine suggestions
```

Avoid presenting demo data as:

```text
Medical diagnosis
Disease diagnosis
Guaranteed treatment
Dermatologist replacement
```

The demo mode must clearly indicate that its results are illustrative.

---

# 📱 Expo Development

The application is designed to run using Expo / React Native.

Typical development command:

```bash
npx expo start
```

For a tunnel connection:

```bash
npx expo start --tunnel
```

After changing Skin Care files:

```bash
Stop Expo
Restart Expo
Clear Metro cache
Reload the application
```

Example:

```bash
npx expo start -c
```

This is especially important if the new Skin Care screen is not appearing because Metro is serving an older JavaScript bundle.

---

# 🛠️ Skin Care Troubleshooting

If the Skin tab does not appear:

### 1. Confirm the route exists

Check:

```text
app/
```

for the Skin Care route.

### 2. Confirm navigation

Make sure the Skin tab is registered in the Expo Router tab layout.

### 3. Confirm imports

Check that the screen imports the mock data correctly.

Example:

```ts
import { demoSkinProfile } from "@/lib/skin-mock-data";
```

### 4. Restart Expo

```bash
npx expo start -c
```

### 5. Check Metro errors

Look for:

```text
Unable to resolve module
```

or:

```text
Route not found
```

### 6. Check TypeScript

Run:

```bash
npx tsc --noEmit
```

### 7. Verify the screen does not depend on API credentials

Demo mode should render even when:

```text
PERFECT_YOUCAM_API_KEY
```

is not configured.

---

# 🏗️ Recommended Project Structure

The repository currently contains the major application areas including:

```text
app/
assets/
components/
constants/
contexts/
lib/
server/
shared/
src/
```

The Skin Care implementation should remain modular.

Recommended structure:

```text
lib/
├── skin-mock-data.ts
├── skin-types.ts
└── skin-api.ts

app/
└── (tabs)/
    └── skin-care.tsx

components/
└── skin/
    ├── SkinMetricCard.tsx
    ├── SkinScoreCard.tsx
    ├── SkinRoutineCard.tsx
    ├── SkinProductCard.tsx
    └── SkinWardrobeCard.tsx

server/
└── routes/
    └── skin-analysis.ts
```

This keeps the Skin Care feature isolated and maintainable.

---

# 🧪 Testing the Demo Experience

The minimum Skin Care test should be:

```text
1. Start Expo
2. Open mobile application
3. Navigate to Skin
4. Confirm Skin Care screen renders
5. Confirm demo score appears
6. Confirm all skin metrics appear
7. Confirm AM routine appears
8. Confirm PM routine appears
9. Confirm products appear
10. Confirm Skin × Wardrobe appears
11. Press Load Demo Scan
12. Confirm screen updates
```

The application should pass these tests without:

```text
YouCam credentials
Backend database
Selfie
External API
Production account
```

---

# 🚀 Future Live Skin AI Flow

After the demo experience is stable, replace the mock analysis path with the live YouCam integration.

Target architecture:

```text
                MOBILE
                  │
                  ▼
          Skin Care Screen
                  │
                  ▼
            Select Selfie
                  │
                  ▼
          Backend API Route
                  │
                  ▼
             YouCam API
                  │
                  ▼
          Skin Analysis Task
                  │
                  ▼
           Poll Completion
                  │
                  ▼
         Normalize Response
                  │
                  ▼
          Skin Care Profile
                  │
        ┌─────────┼──────────┐
        ▼         ▼          ▼
      Routine   Products   Wardrobe
```

The mock layer should remain available as a development fallback.

---

# 👗 Skin AI + Apparel VTO

The most ambitious version of ClosetAI combines both hackathon themes.

```text
                 USER
                  │
          ┌───────┴────────┐
          ▼                ▼
      SKIN AI          APPAREL VTO
          │                │
          ▼                ▼
   Skin Snapshot       Outfit
          │                │
          └───────┬────────┘
                  ▼
          PERSONAL STYLE AI
                  │
                  ▼
          COMPLETE LOOK
                  │
       ┌──────────┼───────────┐
       ▼          ▼           ▼
    Skincare    Outfit     Accessories
```

This is the core long-term vision.

ClosetAI should not simply say:

> "Here is your skin score."

It should eventually say:

> "Here is your personalized beauty and fashion journey."

---

# 🛍️ Retail Opportunity

The Skin Care experience creates additional retail opportunities.

Potential future flow:

```text
Skin Snapshot
     ↓
Recommended Routine
     ↓
Recommended Products
     ↓
Product Detail
     ↓
Add to Cart
     ↓
Complete Outfit
     ↓
Virtual Try-On
     ↓
Checkout
```

This creates a bridge between:

* beauty;
* skincare;
* fashion;
* apparel;
* accessories;
* personalization;
* commerce.

---

# 💰 Business Model

The Skin Care feature can eventually support several revenue opportunities.

## Consumer

```text
FREE
Basic Skin Snapshot

PRO
Advanced Skin History
Personalized Routines
Expanded Styling
Advanced Recommendations
```

## Retail

Brands could eventually integrate:

```text
Skin Analysis
Product Recommendations
Virtual Try-On
Outfit Recommendations
```

into their digital commerce experiences.

---

# 🎯 Hackathon Positioning

ClosetAI is designed for the YouCam API Skin AI & Apparel VTO Hackathon.

The Skin Care component aligns with the **Skin AI** category.

The broader product can align with:

**Skin AI + Apparel VTO**

because both experiences can operate together.

The key concept is:

```text
SKIN
+
STYLE
+
WARDROBE
+
VIRTUAL TRY-ON
=
PERSONALIZED BEAUTY + FASHION EXPERIENCE
```

---

# 🏆 Demo Story

A strong demonstration can follow this sequence:

### 1. Start

Open ClosetAI.

```text
"Meet your AI personal stylist."
```

### 2. Wardrobe

Show the user's wardrobe.

### 3. Outfit

Generate today's outfit.

### 4. Try-On

Use virtual try-on.

### 5. Skin

Open:

```text
Skin AI
```

### 6. Skin Snapshot

Show the demo skin dashboard.

### 7. Routine

Show:

```text
Morning
Evening
```

### 8. Products

Show recommended products.

### 9. Skin × Wardrobe

Show how skincare and styling connect.

### 10. Future

Explain that the demo layer can be replaced with live YouCam Skin AI analysis.

---

# 🎥 Recommended 90-Second Demo

```text
0:00 — Open ClosetAI

0:10 — Show wardrobe

0:20 — Generate outfit

0:30 — Virtual try-on

0:40 — Open Skin Care

0:50 — Show Skin Snapshot

1:00 — Show skincare routine

1:10 — Show product recommendations

1:20 — Show Skin × Wardrobe

1:30 — Explain YouCam integration
```

The key message:

> **ClosetAI connects skincare and fashion into one personalized styling experience.**

---

# 📂 Important Skin Care Files

The current Skin Care implementation should primarily be organized around:

```text
lib/skin-mock-data.ts
```

and:

```text
app/(tabs)/skin-care.tsx
```

Additional reusable components can live under:

```text
components/skin/
```

The mock-data file should contain demo information only.

The UI screen should consume that data instead of embedding large amounts of mock data directly inside the component.

---

# 🔄 Development Strategy

The recommended development sequence is:

## Phase 1 — UI

```text
Skin Tab
↓
Skin Dashboard
↓
Metrics
↓
Routine
↓
Products
↓
Skin × Wardrobe
```

## Phase 2 — Mock Data

```text
Static Demo Profile
↓
Demo Scan Button
↓
Loading State
↓
Demo Results
```

## Phase 3 — Live API

```text
Selfie
↓
Backend
↓
YouCam
↓
Live Results
```

## Phase 4 — Personalization

```text
Skin Results
+
Wardrobe
+
Weather
+
Preferences
```

## Phase 5 — Commerce

```text
Recommendations
↓
Product Catalog
↓
Add to Cart
↓
Virtual Try-On
↓
Checkout
```

---

# 🌟 Product Vision

ClosetAI is evolving from an AI wardrobe application into a broader **personal beauty + fashion assistant**.

The long-term experience is:

```text
                    CLOSET AI
                        │
          ┌─────────────┼─────────────┐
          │             │             │
          ▼             ▼             ▼
       WARDROBE       SKIN CARE      STYLE AI
          │             │             │
          ▼             ▼             ▼
      TRY-ON         SKIN AI       OUTFITS
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                PERSONALIZED LOOK
                        │
                        ▼
                   SHOP / SAVE
```

The user does not need to think about which AI technology is running behind the scenes.

They simply get a better answer to:

> **"What should I wear, how should I style myself, and how can I prepare for the day?"**

---

# 🧪 Current Status

| Feature                  | Status                      |
| ------------------------ | --------------------------- |
| React Native Mobile App  | ✅                           |
| Expo                     | ✅                           |
| Wardrobe                 | ✅                           |
| AI Outfit Concept        | ✅                           |
| Apparel VTO Concept      | ✅                           |
| Skin Care Navigation     | ✅                           |
| Skin Care Dashboard      | ✅                           |
| Mock Skin Data           | ✅                           |
| Skin Metrics             | ✅                           |
| AM Routine               | ✅                           |
| PM Routine               | ✅                           |
| Mock Products            | ✅                           |
| Skin × Wardrobe Concept  | ✅                           |
| Live YouCam Skin API     | 🔄 Integration / Validation |
| Live Product Catalog     | 🔄 Future                   |
| Persistent Skin History  | 🔄 Future                   |
| Advanced Skin + Style AI | 🔄 Future                   |

---

# ⚠️ Demo Data Disclaimer

The Skin Care mock mode is intended for:

* UI development;
* Expo testing;
* product demonstrations;
* hackathon prototyping;
* user-flow testing.

The values displayed in mock mode are **not real measurements** and should not be interpreted as medical advice or a medical diagnosis.

Live analysis should only be presented as actual user-specific results when the application has successfully received valid results from the intended analysis service.

---

# 🚀 Quick Start

## Clone

```bash
git clone https://github.com/lucylow/Closetaimobileappdesign.git
cd Closetaimobileappdesign
```

## Install

```bash
npm install
```

## Start Expo

```bash
npx expo start
```

Or:

```bash
npx expo start --tunnel
```

## Clear Metro Cache

If Skin Care changes are not visible:

```bash
npx expo start -c
```

Then reload the mobile application.

---

# 🔧 Recommended Development Commands

```bash
npm install
```

```bash
npx expo start
```

```bash
npx expo start -c
```

```bash
npx tsc --noEmit
```

Use the TypeScript check before committing significant Skin Care changes.

---

# 🧭 Roadmap

## v1 — ClosetAI

* AI wardrobe
* Outfit recommendations
* Virtual try-on
* Creative shopping

## v1.1 — Multi-Category Try-On

* Clothing
* Accessories
* Footwear
* Jewelry

## v1.2 — Skin Care

* Skin Care tab
* Skin Snapshot
* Mock Skin AI
* AM/PM routines
* Product recommendations
* Skin × Wardrobe

## v1.3 — Live YouCam Skin AI

* Selfie upload
* YouCam analysis
* Live skin metrics
* Real analysis states
* API error handling
* Secure backend integration

## v1.4 — Skin + Style Intelligence

* Skin-aware outfit recommendations
* Color recommendations
* Occasion styling
* Weather-aware recommendations
* Personalized beauty + fashion journeys

## v2.0 — Beauty + Fashion Commerce

* Product catalog
* Add to cart
* Brand integrations
* Virtual try-on
* Skincare recommendations
* Personalized shopping

---

# 🤝 Contributing

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/skin-care
```

3. Make your changes.
4. Test the Expo application.
5. Run TypeScript validation.

```bash
npx tsc --noEmit
```

6. Commit.

```bash
git commit -m "Improve Skin Care experience"
```

7. Push.

```bash
git push origin feature/skin-care
```

8. Open a Pull Request.

---

# 📄 License

See the repository's current license and attribution files for applicable terms.

---

# 🔗 Project

**GitHub Repository**

[ClosetAI GitHub Repository](https://github.com/lucylow/Closetaimobileappdesign/tree/main?utm_source=chatgpt.com)

**Replit Application**

[ClosetAI Replit App](https://closet-organizer-ai--lucylow.replit.app/?utm_source=chatgpt.com)

---

# ❤️ Vision

ClosetAI started with:

> **"What should I wear today?"**

The next evolution is:

> **"How can I look and feel my best today?"**

By combining:

```text
AI WARDROBE
+
APPAREL VIRTUAL TRY-ON
+
SKIN AI
+
SKINCARE ROUTINES
+
PRODUCT DISCOVERY
+
PERSONALIZED STYLE
```

ClosetAI can become a unified personal beauty and fashion assistant.

**Fashion meets beauty.
Beauty meets AI.
AI meets your closet.**

---

## Built for the next generation of personalized fashion & beauty technology.
