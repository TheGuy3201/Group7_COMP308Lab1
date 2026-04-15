# Environmental Software Initiative Summarizer

This project generates an assignment-ready summary on the environmental impact of emerging software technologies and highlights sustainability initiatives from major software makers. It supports both:

- CLI summarizer workflow
- Local web UI workflow

The solution was updated to include recent, publicly available source links so findings stay current.

## 1) Recent Sources Included

The summarizer currently uses a curated source catalog in `sources.js` that includes updates from 2025-2026:

1. Microsoft - A Planetary Computer for a Sustainable Future  
   https://planetarycomputer.microsoft.com/
2. AWS - AWS Cloud Sustainability  
   https://www.aboutamazon.com/sustainability/aws-cloud
3. Google - 2025 Environmental Report / Sustainability Hub  
   https://sustainability.google/
4. Google - Sustainability Stories (2026 updates)  
   https://sustainability.google/stories/
5. Meta - Sustainability Program  
   https://sustainability.atmeta.com/

## 2) Process Documentation: How the Summarizer Was Implemented

### Step A: Refactor to shared summarizer logic

Implemented shared modules so both CLI and UI use the same behavior:

- `sources.js`
  - Stores structured source metadata (provider, title, URL, recency year, excerpt).
  - Supports source filtering by selected IDs.
- `summarizer.js`
  - Builds a prompt that enforces:
    - structured report sections
    - explicit "Recent source links" section
    - no fabricated citations/URLs
    - emphasis on latest available updates
   - Calls the OpenAI API and returns summary + metadata.

### Step B: Build CLI summarizer flow

Updated `generateReport.js` to:

- list source IDs (`--list-sources`)
- summarize with selected source IDs (`--sources=id1,id2`)
- add custom focus guidance (`--focus=...`)

### Step C: Build simple local UI

Implemented a lightweight local UI:

- `server.js`: Node HTTP server + API endpoints
  - `GET /api/sources`
  - `POST /api/summarize`
- `public/index.html`: source selection + prompt form + output panel
- `public/app.js`: frontend fetch logic and form handling
- `public/styles.css`: responsive visual design for desktop/mobile

## 3) Process Documentation: How Articles Were Selected

Selection criteria used:

1. Official publisher pages from major software makers.
2. Recent publication windows (2025-2026 where available).
3. Direct relevance to sustainability initiatives in software/cloud operations.
4. Mix of environmental themes:
   - energy efficiency
   - renewable energy
   - water stewardship
   - circular economy/device lifecycle
   - emissions impact

## 4) Process Documentation: How Testing Was Done

### A. Configuration/prompt validation test

Added `validateSetup.js` and script:

- checks minimum source count
- checks source recency threshold
- checks HTTPS links
- checks prompt includes required "Recent source links" requirement
- checks prompt includes selected URLs and custom focus text

Run:

- `npm test`

### B. Manual run checks performed

CLI checks:

1. list sources
2. generate with default source set
3. generate with selected source IDs
4. generate with custom focus context

UI checks:

1. source list loads from API
2. user can choose subset of sources
3. summary request succeeds and displays output
4. responsive layout works on narrow viewport

## 5) Group Collaboration Plan (for cohesive submission)

Use this division to collaborate effectively while keeping one coherent final submission.

1. Joshua Desroches - Source curation and verification

2. Yusuf Nasimi - Prompt and summarizer quality

3. John Berber - UI/UX and QA packaging


Integration workflow:

1. each member works on a branch
2. open pull requests with short checklists
3. at least one peer review per PR
4. final merge pass verifies style, wording, and assignment requirements

## 6) Setup

### Prerequisites

- Node.js 18+
- OpenAI API key

### Environment file

Create `.env` in project root:

- `OPENAI_API_KEY=your_openai_api_key_here`
- optional: `OPENAI_MODEL=gpt-4o-mini`
- optional: `PORT=3000`

Install dependencies:

- `npm install`

## 7) Run Instructions (Code + UI)

### CLI summarizer

1. List available sources:
   - `npm run summarize:list-sources`
2. Generate report with all sources:
   - `npm run summarize`
3. Generate report with selected sources:
   - `node generateReport.js --sources=microsoft-planetary-computer,amazon-aws-sustainability`
4. Add custom focus:
   - `node generateReport.js --focus="Compare water use and carbon reduction metrics."`
5. Choose a specific OpenAI model when needed:
   - `node generateReport.js --model=gpt-4o-mini`
6. Dry-run without calling OpenAI API (for prompt/source verification):
   - `npm run summarize:dry-run`

### Web UI summarizer

1. Start server:
   - `npm run ui`
2. Open browser:
   - http://localhost:3000
3. In UI:
   - select sources
   - optionally add focus text
   - click Generate Summary

## 8) Project Scripts

- `npm run summarize` -> Run CLI summarizer
- `npm run summarize:dry-run` -> Show selected sources + generated prompt (no API call)
- `npm run summarize:list-sources` -> Print source IDs
- `npm run ui` -> Start local UI server
- `npm test` -> Run local validation checks
- `npm run check:submission` -> Run non-billing submission readiness checks

## 9) Notes for Submission

- Keep the source list updated before final submission by reviewing 2026 updates from the same official pages.
- Save one generated sample report output for appendix/proof of execution if your instructor requires run evidence.
- Main report draft for this assignment is in `Exercise1_Report.md`.
- If billing/quota is temporarily unavailable, run `npm run summarize:dry-run` and `npm run check:submission` to document non-billing completeness while you resolve quota.

## 10) Pre-Submission Checklist

- `Exercise1_Report.md` includes both required one-page summaries and recent links.
- `README.md` includes implementation process, source selection process, testing process, and run instructions.
- `npm test` passes.
- `npm run summarize:list-sources` works and shows recent article sources.
- `npm run ui` starts the interface at `http://localhost:3000`.
- At least one summary was generated with OpenAI API and included in your report submission.
