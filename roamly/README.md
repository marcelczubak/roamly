# Roamly

**Your next adventure, planned in seconds.**

Roamly is an AI-powered travel planner that turns a city, budget, group size, and interests into a complete day-by-day itinerary — with real venues, photos, menu prices, weather-aware planning, and walk / transit / taxi routes via Google Maps.

Built for a hackathon to show how AI can replace hours of manual trip research with one form and a single click.

---

## Demo video

[![Roamly demo video](https://img.shields.io/badge/Watch-Demo%20Video-red?style=for-the-badge&logo=youtube)]([YOUR_VIDEO_URL_HERE](https://github.com/user-attachments/assets/b279d089-540a-46b9-9871-cc71bd986b56))


**What the demo covers:**
- Planning a multi-day trip (e.g. Dublin or Cork)
- Setting travelers, budget, travel style, and interests
- AI-generated day-by-day itinerary
- Activity cards with images, menus, and local tips
- Route options between stops (walk, bus, taxi) with Google Maps links

---

## Features

| Feature | Description |
|--------|-------------|
| **AI itinerary generation** | Full trip plan in ~30–60 seconds using Gemini (with optional Ollama fallback) |
| **City search** | Autocomplete for destinations like Dublin, Cork, Galway, and more |
| **Group planning** | 1–10 travelers with costs calculated for the whole group |
| **Smart budget** | Slider adjusts to trip length and group size; breakdown by accommodation, food, activities, transport |
| **Travel styles** | Backpacker, mid-range, or luxury |
| **Personal interests** | Cafés, food, nature, museums, nightlife, shopping, history, art, adventure |
| **Weather-aware** | Live forecast shapes indoor vs outdoor activities per day |
| **Rich activity cards** | Venue name, address, neighborhood, photo, description, and AI reasoning |
| **Menu prices** | Real dish names and prices for restaurants and cafés |
| **Route comparison** | Walk, public transit, or taxi between each stop — time, distance, and cost |
| **Google Maps** | One-click directions for any leg of the trip |
| **Day regeneration** | Swap a single day without rebuilding the full itinerary |

---

## How it works

1. **Enter trip details** — city, number of days, travelers, budget, style, and interests.
2. **Weather is fetched** — Open-Meteo provides a forecast for your trip dates.
3. **AI builds the plan** — Gemini generates a structured JSON itinerary with real venues and costs.
4. **Routes are computed** — Google Routes API compares walking, transit, and taxi between stops.
5. **Browse your trip** — day-by-day cards with images, menus, tips, and maps.

---

## Tech stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS 4, shadcn/ui, Framer Motion
- **AI:** Google Gemini 2.5 Flash (primary), Ollama / Qwen 2.5 (optional local fallback)
- **Validation:** Zod
- **Weather:** [Open-Meteo](https://open-meteo.com)
- **Maps & routes:** Google Maps Platform (Routes API, Places)
- **Language:** TypeScript

---

## Getting started

### Prerequisites

- **Node.js** 20+ (22 recommended)
- **npm**
- API keys (see below)
- *(Optional)* [Ollama](https://ollama.com) for local AI testing

### Installation

```bash
git clone https://github.com/marcelczubak/roamly.git
cd roamly/roamly
npm install
```

### Environment variables

Create a `.env.local` file in the `roamly/` directory:

```env
# Required — AI itinerary generation
GEMINI_API_KEY=your_gemini_api_key

# Required — route comparison & Google Maps links
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Optional — force local Ollama instead of Gemini
AI_PROVIDER=ollama

# Optional — Ollama model (default: qwen2.5:7b)
OLLAMA_MODEL=qwen2.5:7b
```

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes* | Google AI Studio API key for itinerary generation |
| `GOOGLE_MAPS_API_KEY` | Yes | Google Maps Platform key for routes between activities |
| `AI_PROVIDER` | No | Set to `ollama` to skip Gemini and use local Qwen |
| `OLLAMA_MODEL` | No | Ollama model name (default `qwen2.5:7b`) |

\*Not required if `AI_PROVIDER=ollama` and Ollama is running locally.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other commands

```bash
npm run build   # Production build
npm run start   # Start production server
npm run lint    # ESLint
```

---

## Using Ollama (local AI)

For offline or hackathon demos without a Gemini key:

```bash
# Terminal 1 — start Ollama
ollama serve
ollama pull qwen2.5:7b

# Terminal 2 — run Roamly with Ollama
# In .env.local:
#   AI_PROVIDER=ollama
npm run dev
```

With `AI_PROVIDER=gemini` (default), Ollama is still used automatically if Gemini fails.

---

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/generate` | POST | Generate full trip itinerary |
| `/api/regenerate-day` | POST | Regenerate a single day |
| `/api/routes` | POST | Walk / transit / taxi comparison between two venues |
| `/api/weather` | GET | Weather forecast for a destination and date range |
| `/api/city-search` | GET | City autocomplete suggestions |
| `/api/place-image` | GET | Activity photos |
| `/api/city-backdrop` | GET | Landing page city backdrop image |
| `/api/reverse-geocode` | GET | Detect user's current city |

---

## Project structure

```
roamly/
├── src/
│   ├── app/
│   │   ├── api/              # API routes (generate, routes, weather, …)
│   │   ├── page.tsx          # Homepage
│   │   └── layout.tsx
│   ├── components/
│   │   ├── trip-form.tsx     # Trip input form
│   │   ├── itinerary-results.tsx
│   │   ├── activity-leg.tsx  # Walk / bus / taxi between stops
│   │   └── ...
│   └── lib/
│       ├── schemas.ts        # Zod types for trips & itineraries
│       ├── gemini.ts         # Gemini client helpers
│       ├── google-routes.ts  # Route comparison logic
│       └── weather.ts        # Open-Meteo integration
├── .env.local                # Your API keys (not committed)
└── package.json
```

---

## Example trip

| Setting | Value |
|---------|-------|
| Destination | Dublin |
| Days | 5 |
| Travelers | 3 |
| Budget | €2,500 |
| Style | Mid-range |
| Interests | Cafés, Food, Shopping |

**Output:** A 5-day plan with morning / afternoon / evening activities, group costs, menu prices at restaurants, weather per day, and route options between every stop.

---

## Screenshots

<!-- Add screenshots to /public/screenshots/ and uncomment:

![Roamly homepage](./public/screenshots/homepage.png)
![Itinerary results](./public/screenshots/itinerary.png)
![Route comparison](./public/screenshots/routes.png)

-->

> Add screenshots to `public/screenshots/` and link them here for GitHub.

---

## Team

Built at a hackathon by the Roamly team.

| | |
|---|---|
| **Repository** | [github.com/marcelczubak/roamly](https://github.com/marcelczubak/roamly) |
| **Demo** | [http://localhost:3000](http://localhost:3000) (local) |

---

## License

This project was built for a hackathon. See repository settings for license details.
