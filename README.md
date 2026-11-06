# NEXUS — Digital Laboratory

**Current release: 0.8.0 — GitHub-connected Code Editor.**

## Implemented

### Terminal
- Interactive command line with history (arrow keys).
- Commands: `help`, `status`, `time`, `clear`, `modules`, `about`, `echo`, `calc`, `install requirements.txt`, `install .gitignore`.
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

### Code Editor
- GitHub repository explorer with directory navigation.
- Multi-file tabs, syntax highlighting, editor search, quick file open and keyboard shortcuts.
- Save existing repository files directly through the NEXUS API.
- New files and folders can be created from the editor.

### Terminal additions
- `install requirements.txt` creates a basic Python dependency file.
- `install .gitignore` creates a standard Python ignore file.

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
- `assets/js/extensions.js`\n- `assets/js/editor.js`

## Run
Open `index.html` in a modern browser. No local build step is required. GitHub Pages can host the project from the main branch root. The code editor loads Ace from a CDN and needs an internet connection; GitHub browsing and saving require an active NEXUS GitHub session.

## Limitations
- Terminal is a browser command simulator, not a real OS shell.
- Flow Studio simulates steps; it does not execute external code or connect to services.
- Storage is local to the browser profile. Clearing site data may remove records.
- Dashboard activity metrics are illustrative.\n- The code editor currently supports text files up to 1 MB and uses GitHub as its file backend.

## Roadmap
- [x] 0.1.0 Dashboard foundation
- [x] 0.2.0 Terminal, Storage and Flow Studio
- [ ] 0.3.0 Advanced data collections
- [x] 0.4.0 Monitor
- [x] 0.5.0 Network
- [ ] 0.6.0 Advanced workflow engine
- [x] 0.7.0 Extension system\n- [x] 0.8.0 GitHub-connected Code Editor
- [ ] 1.0.0 Integrated release

## Technology
HTML5, CSS3, vanilla JavaScript and browser localStorage. Python and SQLite are potential future desktop/backend components.

## License
MIT
