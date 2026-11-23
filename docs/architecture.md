# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Build React 19 pages and navigation routes in `octofit-tracker/frontend/src` with Bootstrap styling and a shared API client calling relative `/api` paths (proxied by Vite on port `5173` to `http://localhost:8000`), keeping business logic and direct database access out of UI components.
- Logic tier decision: Implement Express and TypeScript route handlers and service functions in `octofit-tracker/backend/src` on port `8000` to validate request payloads, return deliberate 4xx errors instead of unhandled 500 cast errors, and orchestrate data operations.
- Data tier decision: Define Mongoose schemas and models in `octofit-tracker/backend/src/models` along with an idempotent seed script in `octofit-tracker/backend/src/scripts/seed.ts` targeting MongoDB on port `27017`.
- Activity tracking approach: Implement `GET /api/activities` and `POST /api/activities`; validate that `userId` and `teamId` are valid ObjectIds referencing existing user and team records (returning `400` or `404` otherwise), compute `points` from activity type and `minutes`, and persist `user`, `team`, `type`, `minutes`, `points`, and `occurredAt`.
- Team management approach: Implement `GET /api/teams` and `POST /api/teams` to list and create teams with `name`, `mascot`, and member references, returning `400` whenever `name` is missing or empty.
- Leaderboard approach: Implement `GET /api/leaderboard` to aggregate total activity points per team, sort teams in descending order of `totalPoints`, and return objects with `teamName`, `totalPoints`, and a 1-based `rank`.
- Workout suggestions approach: Implement `GET /api/workouts/suggestions/:userEmail` to look up the user by email (returning `404` when no match exists) and return tailored workout recommendations where the first entry's `focus` and `reason` match the user's goal or recent activity history.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — Verifies Mongoose schemas, validation rules, model relations, and seed data persistence in MongoDB (`27017`); failures indicate missing schema fields, broken constraints, or seeding errors.
- API command: `npm run test:api --prefix octofit-tracker/backend` — Verifies Express `/api/*` endpoints, HTTP status codes (2xx and deliberate 4xx validation), leaderboard sorting/ranking, and workout suggestions; failures indicate route, validation, or service-layer defects.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — Verifies React Router views, Bootstrap UI rendering, user interactions, and shared API client calls; failures indicate broken component state, form handling, or API contract mismatches.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — Compiles the TypeScript backend in `octofit-tracker/backend`; failures indicate type mismatches, invalid imports, or `tsconfig` issues.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — Builds the Vite + React production bundle in `octofit-tracker/frontend`; failures indicate TypeScript/JSX compilation errors or broken module references.