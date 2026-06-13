# Last Race

A single-player metro route-planning game inspired by "Race the Rails".

## Screenshots

*(Add screenshots here once running — commit images to `/screenshots/` and link them below.)*

## Credentials

| Username | Password  |
|----------|-----------|
| alice    | password1 |
| bob      | password2 |
| carol    | password3 |

---

## Server-side

### HTTP APIs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/sessions` | No | Login. Body: `{ username, password }`. Returns `{ id, username }`. |
| `DELETE` | `/api/sessions/current` | Yes | Logout. Returns 204. |
| `GET` | `/api/sessions/current` | No | Check current session. Returns `{ id, username }` or 401. |
| `GET` | `/api/network` | Yes | Full network: `{ lines, stations, segments }` with line colors and names. |
| `POST` | `/api/games` | Yes | Create a new game. Returns `{ startStation, endStation }` (random, min distance 3). |
| `POST` | `/api/games/submit` | Yes | Submit a route. Body: `{ route: number[], startStationId, endStationId }`. Returns `{ valid, reason?, score, steps }`. |
| `GET` | `/api/ranking` | Yes | Leaderboard. Returns array of `{ username, best_score, games_played }` sorted by best score. |

### Database Tables

| Table | Purpose |
|-------|---------|
| `lines` | Metro lines with name and display color. |
| `stations` | All stations with unique names. |
| `segments` | Direct connections between adjacent stations on a line. Each row is one hop. |
| `events` | Random events with a description and integer effect (−4 to +4). |
| `users` | Registered users with bcrypt-equivalent (scrypt) hashed and salted passwords. |
| `games` | Completed games with user, start/end station, score, and timestamp. |

---

## Client-side

### React Routes

| Path | Description |
|------|-------------|
| `/` | Home page — game instructions visible to everyone. Anonymous users see no map or play button. |
| `/login` | Login form. Redirects to `/game` on success. |
| `/game` | Main game page (protected). Contains all 4 game phases: Setup, Planning, Execution, Result. |
| `/ranking` | Leaderboard (protected). Shows best score per registered user. |

### Main React Components

| Component | Purpose |
|-----------|---------|
| `App` | Root component. Sets up `BrowserRouter`, `UserProvider`, and `Routes`. |
| `Navbar` | Sticky top navigation. Shows Login or user info + Logout based on auth state. |
| `NetworkMap` | SVG map of the metro network. Accepts `showLines` (hides lines in planning phase) and `highlightRoute` props. |
| `UserContext` / `UserProvider` | React context for global auth state (user, login, logout). Session is verified on mount. |
| `SetupPhase` | Shows full network map with line legend. Player studies before starting. |
| `PlanningPhase` | 90-second countdown. Player builds route by clicking segments. Shows partial map and segment list. |
| `ExecutionPhase` | Displays each journey step with random event and coin delta. |
| `ResultPhase` | Shows final score with option to play again or view ranking. |
| `LoginPage` | Controlled form component. Calls `UserContext.login` and navigates on success. |
| `RankingPage` | Fetches and displays the leaderboard table. |
| `HomePage` | Instructions page. CTA differs for anonymous vs. authenticated users. |

.
