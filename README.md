# NEXUS — Digital Laboratory

**NEXUS** is a modular digital workspace concept for workflow design, local data organization, system insights and extensible tools.

> Current release: **0.1.0 — Interface foundation**

## Preview

The first release contains a responsive dashboard with:
- A workspace overview and module navigation
- System status and activity panels
- A live local clock and date
- A responsive sidebar for mobile screens
- Dark and light appearance toggle
- A basic activity log
- Placeholder pages for planned modules

The dashboard currently uses illustrative demo metrics. It does not yet inspect real system resources, network traffic or storage.

## Project structure

```text
NEXUS/
├── index.html
├── README.md
└── assets/
    ├── css/
    │   └── style.css
    └── js/
        └── app.js
```

## Run locally

No build tools are required for the first release.

1. Clone or download this repository.
2. Open `index.html` in a modern browser.

For GitHub Pages, open **Settings → Pages**, select **Deploy from a branch**, choose the `main` branch and `/ (root)`, then save.

## Roadmap

- [x] 0.1.0 — Dashboard foundation
- [ ] 0.2.0 — NEXUS Terminal
- [ ] 0.3.0 — Storage module
- [ ] 0.4.0 — Monitor module
- [ ] 0.5.0 — Network module
- [ ] 0.6.0 — Visual Flow Studio
- [ ] 0.7.0 — Extension system
- [ ] 1.0.0 — Integrated release

## Technology

- HTML5
- CSS3
- Vanilla JavaScript

Python and SQLite are planned for the desktop/backend phase. The initial web interface is intentionally static and can be hosted with GitHub Pages.

## License

MIT
