# 🛡️ Aegis Careers: Graduate AI, ML & Data Science Dashboard (London & UK Hubs)

A premium, interactive Single Page Web Application designed to aggregate, parse, and categorize graduate-level opportunities across **Artificial Intelligence, Machine Learning, Data Science**, and specialized **Bio/Pharma/Healthcare Applications** in the London and UK hubs.

Built with **React, Vite, and Vanilla CSS**, it features a gorgeous responsive interface with a glassmorphic design, aggregate statistics, live API synchronization, and full-screen description views.

---

## 🚀 Key Features

*   **Four Distinct Career Tracks (Panes)**:
    1.  🛡️ **Artificial Intelligence**: Large Language Models, Prompt Architectures, Agentic Systems, and general GenAI.
    2.  ⚙️ **Machine Learning**: Deep Learning, Computer Vision, NLP, PyTorch modeling, and autonomous driving architectures.
    3.  📊 **Data Science**: Statistical modeling, A/B Testing, business metrics, Pandas, SQL data engineering.
    4.  🧬 **Bio & Healthcare (Medicine/Pharma)**: Computational biology, bioinformatics, drug discovery, clinical trials, and oncology analytics.
*   **Structured View Details**:
    *   Company name and initials-based gradient logo.
    *   Job Title & Location (Remote/Hybrid/Onsite).
    *   **Pay Band** (emphasized capsule badge in local GBP `£` or relevant currency).
    *   **Top 3 Skills** required for the position.
*   **Resilient Dual-Mode Synchronization**:
    *   *Verified Curated*: Pre-seeded with high-fidelity graduate jobs at premier UK firms (Stability AI, Google DeepMind, Wayve, Deliveroo, G-Research, AstraZeneca, GSK, BenevolentAI, Healx, Exscientia, and others).
    *   *Live Remote Sync*: Dynamically queries the public **Remotive API** through resilient CORS proxies (`corsproxy.io` and `allorigins.win`).
*   **Dynamic Data Parser**:
    *   Filters jobs specifically for graduate, junior, entry-level, and intern classifications.
    *   Performs location-filtering to restrict candidates to London, Cambridge, Oxford, Reading, or UK-remote eligible listings.
    *   Scans job descriptions for key technical skills and extracts the top 3 matches.
    *   Estimates market-rate compensation bands in **GBP (£)** if salary info is missing.
*   **Premium UI/UX Design**:
    *   A glassmorphic theme supporting **Light Mode** and **Dark Mode** toggle options.
    *   *Outfit* (headers) and *Plus Jakarta Sans* (interface) premium typography.
    *   Dynamic hover micro-animations, loading indicators, and aggregate stats boards.
    *   Centered details overlay modal with clean layout, quick-info dashboard, and apply links.

---

## 🛠️ Tech Stack

*   **Core**: React 19 (Hooks, custom state, effects)
*   **Build Tool**: Vite (Fast HMR and Rolldown/Vite builds)
*   **Icons**: Lucide React
*   **Styling**: Custom Vanilla CSS (flexbox, CSS grid, variables, backdrop filters)

---

## 📂 Project Structure

```
agy_cli_projects/
├── index.html           # SEO-optimized metadata, descriptive tags, and icon
├── package.json         # Scripts, dependencies (react, lucide-react)
├── .gitignore           # Ignores build outputs, node_modules, logs, and envs
├── src/
│   ├── main.jsx         # App bootstrapping
│   ├── App.jsx          # Sync engine, filtering logic, and main interface components
│   ├── App.css          # Design system variables, core stylesheet, layout structure
│   ├── index.css        # Clean global resets
│   └── jobsData.js      # London-specific pre-seeded database
```

---

## ⚙️ Local Development

To run or build the application locally, make sure you have [Node.js](https://nodejs.org/) installed, and run:

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Start development server**:
    ```bash
    npm run dev
    ```
    Open **[http://localhost:5173/](http://localhost:5173/)** to view the app with Hot Module Replacement (HMR).
3.  **Build production-ready bundle**:
    ```bash
    npm run build
    ```
    This compiles the output into the `dist/` directory, which can be deployed to static hosting solutions (such as Netlify, Vercel, or GitHub Pages) for free.
