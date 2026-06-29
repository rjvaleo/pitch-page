# rjvaleo · Pitch Pages

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen?logo=github)](https://rjvaleo.github.io/pitch/)
[![Built With](https://img.shields.io/badge/Built%20With-HTML%20%7C%20CSS%20%7C%20Vanilla%20JS-blue)](/)
[![Config Format](https://img.shields.io/badge/Config-JSON-orange)](./jobs/)
[![No Dependencies](https://img.shields.io/badge/Dependencies-None-lightgrey)](/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

A single-template, JSON-driven pitch page system for job applications. One HTML template. One CSS file. One JS renderer. One JSON config per job. The result: a custom, evidence-dense pitch page for every application — built in ~30 minutes per role, not from scratch each time.

**Live:** [rjvaleo.github.io/pitch/?job=crocs](https://rjvaleo.github.io/pitch/?job=crocs)

---

## What It Does

Standard resumes and cover letters answer the question: *does this candidate qualify?*

This answers the harder question recruiters are actually asking: *why is this specific person the right hire for this specific role?*

Each pitch page is a seven-section, evidence-dense case built from the job description — mapping every stated requirement to specific proof from the candidate's work history, showing the tech stack the hiring company actually uses, walking through realistic failure modes and how the candidate responds, and presenting a concrete 30-day ramp plan. It is not a portfolio. It is a risk-mitigation document disguised as one.

The URL goes in the resume header immediately after the name:

```
For [Company]: rjvaleo.github.io/pitch/?job=[slug]
```

That link is the first thing a recruiter sees before reading a single bullet point.

---

## How It Works

```
index.html     ← single template (structure only, no content)
style.css      ← design system (dark theme, teal/gold palette, responsive)
pitch.js       ← renderer (reads ?job= param, fetches config, builds page)
jobs/
  crocs.json             → /pitch/?job=crocs
  network-to-code.json   → /pitch/?job=network-to-code
  akkodis.json           → /pitch/?job=akkodis
  davita.json            → /pitch/?job=davita
  capgemini.json         → /pitch/?job=capgemini
  agile-coach.json       → /pitch/?job=agile-coach
```

The renderer fetches the JSON config and populates the template. Everything in the HTML is a placeholder. Everything in the JSON is the substance. The design never changes; only the content does.

---

## The Seven Sections

Every pitch page has the same structure. The content is entirely per-job.

| # | Section | What It Does |
|---|---|---|
| 01 | **The Case** | JD requirement → candidate evidence, row by row. Click to expand detail. |
| 02 | **The Stack** | Visual diagram of the actual tech ecosystem the company uses. Click a node for the PM's role in it. |
| 03 | **When Things Break** | Three realistic incident types with specific response patterns. Pattern recognition over theory. |
| 04 | **How I Run a Room** | The operational outputs from every interaction — what you actually get. |
| 05 | **Track Record** | Selected engagements most relevant to the role, with outcomes. |
| 06 | **The Sr. Partner** | Before/after: what changes when this hire is in the seat. Centers the hiring manager's actual pain. |
| 07 | **The Ramp** | Day 1 through Day 30. Specific, concrete, no hedging. |

---

## Adding a New Job

Copy any existing config and update the fields. The schema:

```json
{
  "slug": "company-role",
  "company": "Company Name",
  "role": "Role Title",
  "subtitle": "Subtitle line under the role",
  "hero_title": "HTML for the hero headline — supports <br> and <em>",
  "hero_sub": "One or two sentences. The value statement.",

  "the_case": [
    {
      "need": "JD requirement (verbatim where possible)",
      "answer": "One-sentence evidence summary",
      "detail": "Expanded evidence for the click-through panel"
    }
  ],

  "the_stack": {
    "headline": "Section headline",
    "subhead": "One sentence framing",
    "nodes": [
      {
        "label": "Tool or Platform Name",
        "desc": "What it is / what it does",
        "pm_role": "Where the delivery role intersects with this node"
      }
    ]
  },

  "when_things_break": [
    {
      "scenario": "Realistic failure mode",
      "response": [
        "Step 1",
        "Step 2",
        "Step 3"
      ]
    }
  ],

  "how_i_run_a_room": [
    "Operational output 1",
    "Operational output 2"
  ],

  "track_record": [
    {
      "company": "Company Name",
      "role": "Role Title",
      "period": "YYYY–YYYY",
      "points": ["Point 1", "Point 2"]
    }
  ],

  "sr_partner": {
    "before": ["Pain point 1", "Pain point 2"],
    "after":  ["Resolution 1", "Resolution 2"]
  },

  "the_ramp": [
    {
      "timeframe": "Week 1",
      "deliverable": "What gets done in this window."
    }
  ]
}
```

Save to `jobs/[slug].json`. The page is live at `rjvaleo.github.io/pitch/?job=[slug]` immediately after push.

---

## Design System

| Variable | Value | Usage |
|---|---|---|
| `--black` | `#0a0a0a` | Background |
| `--off-white` | `#f5f2ec` | Primary text |
| `--teal` | `#1a6b5a` | Accent, section backgrounds |
| `--gold` | `#c9a84c` | Highlight, cursor, section labels |
| `--mid` | `#6b6560` | Secondary text |
| Font (display) | Playfair Display | Headlines |
| Font (mono) | DM Mono | Labels, navigation, metadata |
| Font (body) | DM Sans | Body text |

---

## Why This Exists

> *The pitch page was the decisive differentiator in the placement that led to my first contract this year. The hiring manager said they clicked the link before finishing the resume.*

At high application volume (500–1,500+ applicants on a typical LinkedIn posting), the resume has to clear an ATS filter and then stand out to a human in under 10 seconds. A URL in the header that links to a page built specifically for that company and role is a different category of signal than a PDF.

This system makes that custom page producible in ~30 minutes per application instead of hours — the JSON schema forces the right thinking (evidence per requirement, specific ramp plan, realistic failure modes) and the template handles everything else.

---

## Tech Stack

- **HTML5** — semantic, accessible structure
- **CSS3** — custom properties, grid, flexbox, scroll animations, responsive
- **Vanilla JavaScript** — no framework, no build step, no dependencies
- **JSON** — one config file per job
- **GitHub Pages** — zero-cost static hosting, instant deployment on push

No build pipeline. No npm. No dependencies. The entire system is four files plus the configs.

---

## License

MIT — use this pattern for your own job search if it's useful.
