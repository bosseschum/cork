# Cork — A Personal Dashboard

Cork is a modern, modular personal dashboard application designed to host a variety of handy widgets (such as Todos, Weather, Calendar events, and more) tied together by a personal AI assistant.

Currently, the project features a fully functional, highly polished **Todo Widget** connected to an Express-powered backend, with placeholders ready for upcoming widgets like Weather.

---

## 🚀 The Tech Stack

The workspace is a monorepo consisting of a decoupled TypeScript backend and React frontend.

### Backend (`cork-backend`)

- **Node.js & TypeScript**
- **Express v5.x:** Leverages native Promise handling in route handlers, eliminating the need for boilerplate `express-async-errors` or try-catch wraps for async middleware.
- **tsx:** Used for extremely fast TypeScript execution and live-reloading during development without pre-compiling.
- **Zod:** Used for declarative request body validation and runtime type assertion.

### Frontend (`cork-web`)

- **React 19:** Utilizing the latest React features and concurrent rendering primitives.
- **Vite v8.x:** Provides an ultra-fast build toolchain and Hot Module Replacement (HMR).
- **TypeScript:** Full-stack type safety.
- **Bootstrap v5.3 & Sass:** Offers modern styling, clean layout components, and structured custom theme overrides.
- **Zod:** Used for API response validation, guaranteeing the client never processes malformed or unexpected API responses.

---

## 🏗️ Architecture

```
                                  +-------------------+
                                  |    cork-web       |
                                  |   (React/Vite)    |
                                  +---------+---------+
                                            |
                                  HTTP REST | (CORS)
                                            v
                                  +-------------------+
                                  |   cork-backend    |
                                  |    (Express)      |
                                  +-------------------+
```

### Backend Structure

The backend is structured around a classic **Route-Model-Schema** pattern to cleanly separate HTTP concerns, business logic, and validation:

1.  **Schemas (`src/schemas/`)**: Declares the structure of data transfer objects (DTOs) and models using Zod. It serves as the single source of truth for TypeScript types (via `z.infer`).
2.  **Models (`src/models/`)**: Pure domain logic. Functions here are stateless and side-effect-free (e.g., adding, filtering, or modifying entities), making them highly testable.
3.  **Routes (`src/routes/`)**: Handles the HTTP request/response lifecycle, validates inputs against schemas, catches custom exceptions, and manages the in-memory database state.

### Frontend Structure

The frontend follows a hierarchical, modular component boundary design:

- **State Orchestrator (`TodoList.tsx`)**: Holds the primary React state (`todos`, `isDialogOpen`, `loading`, etc.) and manages API side-effects (`fetch`, `POST`, `PATCH`, `DELETE`). Keeping state at this level avoids synchronization bugs and prop-drilling.
- **Presenter Components (`TodoItem.tsx`, `AddTodoDialog.tsx`)**: Pure presentational components that receive data and callback event handlers (such as `toggleTodo`, `deleteTodo`, or `handleSubmit`) via props. This maximizes component reusability and testing simplicity.

---

## 🧠 Interesting Decisions & Trade-Offs

### 1. State Ownership vs. ESM's Read-Only Import Bindings

In ECMAScript Modules (ESM), exported variables are live, read-only bindings to the module's memory space.

- **The Issue:** If another file imports `let todos` from `routes/todos.ts` and attempts to reassign it (`todos = []`), JavaScript throws a `TypeScript compile-time error about assigning to an imported binding` (or similar bundler/runtime error) because external modules cannot reassign an exported binding.
- **The Decision:** The route handlers in `routes/todos.ts` hold direct ownership of the in-memory array. The array is updated _within_ the module itself via `todos = updatedTodos;` (which is permitted), ensuring external consumers always receive the latest live reference, but cannot mutate the binding.

### 2. Immutability & Why React Cares

Our domain models (`models/todo.ts`) use immutable operations (e.g., array spreading `[...todos, newTodo]`, `.map()`, and `.filter()`) instead of in-place mutation (e.g., `.push()`, `.splice()`).

- **Why?** React relies on **shallow reference equality** (`===`) to determine if state has changed and a re-render is necessary. If we mutated the array in-place, the reference would remain unchanged, and React would skip updating the UI. Emphasizing pure-functional models ensures seamless integration with React's state model and guarantees side-effect-free code on the backend.

### 3. Custom `NotFoundError` Class vs. String Matching

When a domain model function fails to find an entity (e.g., during toggle or delete), it raises an exception.

- **The Trade-Off:** I chose to implement a custom class `NotFoundError extends Error` instead of checking error strings (e.g., `error.message === 'Todo not found'`).
- **Why?** Runtime string-matching is incredibly fragile. A simple typo, internationalization, or a minor refactoring of the error message would quietly break the API's status-code logic (mapping to 500 instead of 404). Checking at compile time here is that error is properly narrowed to type NotFoundError inside the if block and highly explicit.

### 4. Controlled vs. Native `<dialog>` Modal State

I utilized the modern HTML `<dialog>` element for the "Add Todo" interface.

- **The Issue:** Simply setting the attribute `<dialog open={isOpen}>` in React displays the element, but _fails_ to show it as a true modal (i.e., it doesn't render the dark backdrop via `::backdrop`, doesn't trap keyboard focus, and doesn't handle native `Escape` closures correctly).
- **The Decision:** To get true modal behavior, the browser requires calling the native imperative DOM methods `.showModal()` and `.close()`. We bridged this with React's declarative state model by keeping a single source of truth (`isDialogOpen`) and synchronizing it with the DOM using a `useRef` and a `useLayoutEffect` to trigger the imperative calls immediately before the browser repaints.

### 5. Why Date Becomes String at the API Boundary

- **The Mismatch:** On the backend, `TodoSchema` declares `createdAt: z.date()`, representing a native JS `Date` object. However, JSON serialization via HTTP does not have a native representation for Dates; it serializes them to ISO strings.
- **The Decision:** On the frontend, `TodoSchema` declares `createdAt: z.string()`. This acknowledges the physical reality of the API boundary: dates are sent as strings and must be parsed as strings (or hydrated back to Dates) by the client.

### 6. Toggle-Semantics vs. Set-Semantics for PATCH

- **The Trade-Off:** The `PATCH /todos/:id` endpoint accepts no request body and simply toggles the `completed` flag on the server.
- **Why?**
  - _Toggle-Semantics (Current):_ Extremely concise, requiring no body-validation schemas or merge logic on the backend.
  - _Set-Semantics:_ Accepting `{ completed: boolean }` is more robust, idempotent (multiple identical calls guarantee the exact same state), and extensible for editing other fields (like the todo's text).
  - I prioritized toggle simplicity for the initial dashboard, but recognize that set-semantics are preferred for more complex, race-resistant APIs.

---

## 💻 Running It Locally

You can run both the backend and frontend simultaneously. Open two terminals in the root directory:

### Terminal 1: Backend

```bash
# Navigate to backend directory
cd cork-backend

# Install dependencies
npm install

# Start the dev server (running on port 3000)
npm run dev
```

### Terminal 2: Frontend

```bash
# Navigate to frontend directory
cd cork-web

# Install dependencies
npm install

# Start the Vite development server (running on port 5173)
npm run dev
```

Open your browser and navigate to `http://localhost:5173` to view the dashboard!

---

## 🛠️ What's Not Done / Next Steps

1.  **Persisted Storage:** Currently, the backend maintains state in-memory. Restarting the backend server resets the todo list. The next step is adding SQLite or PostgreSQL integration.
2.  **Weather Widget (`Weather.tsx`)**: The frontend currently contains an empty placeholder component for the Weather widget. Implementing this with a free weather API (e.g., OpenWeatherMap) is planned.
