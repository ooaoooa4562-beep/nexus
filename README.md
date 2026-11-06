# NEXUS — Digital Laboratory

**Current release: 0.7.0 — Monitor, Network and Extensions.**

## Implemented

### Terminal
- Interactive command line with history (arrow keys).
- Commands: `help`, `status`, `time`, `clear`, `modules`, `about`, `echo`, `calc`.
- Runs inside the browser; it is not an operating-system shell.

### Storage
- Create, edit, search and delete text records.
- Import and export JSON.
- Data persists in browser localStorage, not on a server.

### Flow Studio
- Add action, condition and output blocks.
- Edit block titles and descriptions; reorder and delete blocks.
- Run a step-by-step workflow simulation.
- Saves the workflow draft in browser localStorage.

### Monitor
- Session uptime, browser memory when supported, online state and viewport.
- Module health overview and browser error/event stream.

### Network
- Browser connectivity status.
- Round-trip health check against the NEXUS GitHub API.
- Local test history.

### Extensions
- Built-in module registry.
- Enable/disable modules locally, with protected Extension Manager.
- Third-party extension loading is not enabled.

## Structure

- `index.html`
- `assets/css/style.css`
- `assets/js/app.js`
- `assets/js/terminal.js`
- `assets/js/storage.js`
- `assets/js/flow.js`
- `assets/js/monitor.js`
- `assets/js/network.js`
- `assets/js/extensions.js`

## Run
Open `index.html` in a modern browser. No build tools or dependencies are required. GitHub Pages can host the project from the main branch root.

## Limitations
- Terminal is a browser command simulator, not a real OS shell.
- Flow Studio simulates steps; it does not execute external code or connect to services.
- Storage is local to the browser profile. Clearing site data may remove records.
- Dashboard activity metrics are illustrative.

## Roadmap
- [x] 0.1.0 Dashboard foundation
- [x] 0.2.0 Terminal, Storage and Flow Studio
- [ ] 0.3.0 Advanced data collections
- [x] 0.4.0 Monitor
- [x] 0.5.0 Network
- [ ] 0.6.0 Advanced workflow engine
- [x] 0.7.0 Extension system
- [ ] 1.0.0 Integrated release

## Technology
HTML5, CSS3, vanilla JavaScript and browser localStorage. Python and SQLite are potential future desktop/backend components.

## License
MIT
