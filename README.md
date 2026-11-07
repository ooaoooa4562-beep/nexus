# NEXUS — Digital Laboratory

**Current release: 0.9.0. Flow Studio milestone: 1.0.0 — Expression Reporters.**

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
- Scratch-style nested statement blocks with separate `DO` and `ELSE` bodies; blocks can be moved between containers and nested sequences.
- `if`, `if / else`, `repeat` and `forever` execute their nested bodies with STOP cancellation and runtime safety limits.
- Reporter blocks can be nested into expression slots: number, variable, arithmetic, comparison, boolean, AND, OR and NOT.
- Numeric text fields also accept safe expressions such as `($score + 3) * 2`; no JavaScript `eval` is used.
- `set`, `change`, repeat counts and arithmetic statement blocks accept reporter expressions.
- A variable manager supports creating, deleting and browsing up to 100 numeric variables; variable values are saved with the local project and retained between runs.
- Top-level statement blocks can still be connected with manual wires; reporters are restricted to expression slots.
- Existing local projects and manually wired legacy repeat/if scripts are normalized for backward compatibility.

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
- `assets/js/extensions.js`
- `assets/js/editor.js`
- `server.js`

## Run
Open `index.html` in a modern browser. No local build step is required. GitHub Pages can host the project from the main branch root. The code editor loads Ace from a CDN and needs an internet connection; GitHub browsing and saving require an active NEXUS GitHub session.

## Limitations
- Terminal is a browser command simulator, not an operating-system shell.
- Flow Studio runs visual commands in the browser; it does not execute arbitrary external code or connect to external services.
- The key-pressed event block currently logs a manual-start event; it does not yet listen for physical keyboard input.
- `forever` loops must be stopped manually. A 100,000-block safety limit prevents runaway execution.
- Storage and Flow Studio projects are local to the browser profile. Clearing site data may remove them.
- Dashboard activity metrics are illustrative.
- The code editor currently supports text files up to 1 MB and uses GitHub as its file backend.

## Roadmap
- [x] 0.1.0 Dashboard foundation
- [x] 0.2.0 Terminal, Storage and Flow Studio
- [ ] 0.3.0 Advanced data collections
- [x] 0.4.0 Monitor
- [x] 0.5.0 Network
- [ ] 0.6.0 Advanced workflow engine
- [x] 0.7.0 Extension system
- [x] 0.8.0 GitHub-connected Code Editor
- [x] 0.9.0 Nested Flow Studio runtime
- [ ] 1.0.0 Integrated release

## Technology
HTML5, CSS3, vanilla JavaScript and browser localStorage. Python and SQLite are potential future desktop/backend components.

## License
MIT
