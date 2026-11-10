# NEXUS — Digital Laboratory

**Current release: 0.9.0. Flow Studio milestone: 2.2.0 — Typed Variable Controls.**

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
- Reporter blocks can be nested into expression slots: number, variable, arithmetic, comparison, boolean, AND, OR, NOT, text, join, length and contains.
- `say` and `think` accept text reporters, so nested expressions can generate stage messages without JavaScript code.
- Numeric text fields also accept safe expressions such as `($score + 3) * 2`; no JavaScript `eval` is used.
- Comparisons support numeric and text values; text equality and contains checks are case-insensitive, while mixed-type comparisons are rejected.
- Arithmetic reporters reject non-finite results instead of allowing `Infinity` into the runtime.
- `set`, `change`, repeat counts and arithmetic statement blocks accept reporter expressions.
- A variable manager supports up to 100 typed variables: Number, Text and Boolean. Variable targets use live dropdowns; numeric-only blocks filter to Number variables, while assignment, print and variable reporters can select every type. Types can be changed with checked conversions: text must be a finite numeric string to become Number; Boolean accepts only true/false text or 0/1; Boolean-to-Number maps to 1/0; Number/Boolean-to-Text uses the displayed value. Rejected conversions leave the original variable unchanged. Legacy numeric variables migrate automatically to Number records; typed values persist with the local project and are retained between runs.
- The `when key pressed` event listens for real keyboard input while the runtime is active. It supports space, arrow keys, Enter, Escape, letter/number keys and an any-key option; form fields are ignored. Event hats stay at the top level and cannot be wired as incoming blocks.
- The generic variable reporter preserves the stored type. Numeric expressions and arithmetic reject Text/Boolean variables, logical operators require Boolean inputs, and assignments cannot silently change an existing variable's type.
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
Open `index.html` in a modern browser. Run Flow Studio unit tests with `npm run test:flow` in a Node.js 20+ environment. No local build step is required. GitHub Pages can host the project from the main branch root. The code editor loads Ace from a CDN and needs an internet connection; GitHub browsing and saving require an active NEXUS GitHub session.

## Limitations
- Terminal is a browser command simulator, not an operating-system shell.
- Flow Studio runs visual commands in the browser; it does not execute arbitrary external code or connect to external services.
- Arithmetic expressions remain Number-only; Text and Boolean values must be handled through compatible reporters and typed assignments. Changing a variable type does not rewrite existing expressions; incompatible uses are still reported by runtime type checks.
- Keyboard event blocks ignore browser key-repeat events and do not capture keystrokes while an input, select, textarea or editable element has focus.
- `forever` loops and keyboard listeners remain active until STOP. A 100,000-block safety limit prevents runaway execution; GSAP-backed sprite effects are cancelled when STOP is requested or Flow Studio is closed.
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
