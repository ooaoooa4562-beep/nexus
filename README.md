# NEXUS — Digital Laboratory

**Current release: 0.9.0.**

## Implemented

### Terminal
- Interactive command line with history (arrow keys).
- Commands: `help`, `status`, `time`, `clear`, `modules`, `about`, `echo`, `calc`, `install requirements.txt`, `install .gitignore`.
- Runs inside the browser; it is not an operating-system shell.

### Storage
- Create, edit, search and delete text records.
- Import and export JSON.
- Data persists in browser localStorage, not on a server.

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


### Authentication setup (Render)

- GitHub OAuth requires `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` and `SESSION_SECRET`.
- Google sign-in additionally requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the Render service environment.
- Register this exact Google Authorized redirect URI in Google Cloud Console: `https://nexus-github-api.onrender.com/auth/google/callback`.
- Register this exact GitHub callback URL in the GitHub OAuth App: `https://nexus-github-api.onrender.com/auth/github/callback`.
- Keep all client secrets in Render Environment Variables. Never put them in frontend files or commit them to Git.
- Google sign-in creates a NEXUS identity session; GitHub repository access still requires the separate **Connect GitHub** authorization because Google does not grant GitHub permissions.

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
- Arithmetic expressions remain Number-only; Text and Boolean values must be handled through compatible reporters and typed assignments.
- Storage records are local to the browser profile. Clearing site data may remove them.
- Dashboard activity metrics are illustrative.
- The code editor currently supports text files up to 1 MB and uses GitHub as its file backend.

## Roadmap
- [x] 0.1.0 Dashboard foundation
- [x] 0.2.0 Terminal and Storage
- [ ] 0.3.0 Advanced data collections
- [x] 0.4.0 Monitor
- [x] 0.5.0 Network
- [x] 0.7.0 Extension system
- [x] 0.8.0 GitHub-connected Code Editor
- [ ] 1.0.0 Integrated release

## Technology
HTML5, CSS3, vanilla JavaScript and browser localStorage. Python and SQLite are potential future desktop/backend components.

## License
MIT
