## 🧠 Interesting Decisions & Trade-Offs

### 1. State Ownership vs. ESM's Read-Only Import Bindings

In ECMAScript Modules (ESM), exported variables are live, read-only bindings to the module's memory space.

- **The Issue:** If an external consumer imports `let todos` from `routes/todos.ts` and attempts to reassign it (`todos = []`), the TypeScript compiler rejects it with `Cannot assign to 'todos' because it is an import` (TS2632). It never runs because `tsc` halts before emit.
- **The Decision:** The route handlers in `routes/todos.ts` maintain direct ownership of the in-memory array. Reassignment happens strictly _inside_ the module via `todos = updatedTodos;`. External consumers can read the exported reference, but cannot mutate the binding directly.

### 2. Immutability & Why React Cares

Our domain models (`models/todo.ts`) use immutable operations (such as array spreading `[...todos, newTodo]`, `.map()`, and `.filter()`) instead of in-place mutation (`.push()`, `.splice()`).

- **Why?** React relies on **shallow reference equality** (`===`) to determine whether state changed and a re-render is necessary. Mutating the array in place preserves the reference, causing React to skip UI updates. Using pure functions on the backend keeps domain logic side-effect-free and aligns directly with frontend state expectations.

### 3. Custom `NotFoundError` Class vs. String Matching

When a domain model function fails to locate an entity (e.g., during an update or delete), it raises an explicit exception.

- **The Trade-Off:** Implemented a custom `NotFoundError extends Error` class instead of checking error messages (`error.message === 'Todo not found'`).
- **Why?** String matching at runtime is fragile; minor phrasing changes, typos, or localization instantly break HTTP status-code mappings (turning 404s into 500s). Using `instanceof NotFoundError` provides an explicit runtime type check, which simultaneously allows TypeScript to narrow the `error` type safely within the catch block.

### 4. Controlled vs. Native `<dialog>` Modal State

I utilized the modern HTML `<dialog>` element for the "Add Todo" interface.

- **The Issue:** Setting `<dialog open={isOpen}>` renders the element, but fails to trigger modal behavior: it omits the backdrop (`::backdrop`), fails to trap keyboard focus, and ignores native `Escape` dismissals.
- **The Decision:** True modal behavior requires the native imperative methods `.showModal()` and `.close()`. A `useRef` paired with `useLayoutEffect` synchronizes React's declarative `isDialogOpen` state with these imperative DOM calls right before the browser paints.

### 5. Why Date Becomes String at the API Boundary

- **The Mismatch:** On the backend, `TodoSchema` validates `createdAt: z.date()`, representing a native JavaScript `Date`. HTTP JSON serialization converts Dates to ISO strings, stripping the type.
- **The Decision:** On the frontend, `TodoSchema` expects `createdAt: z.string()`. Acknowledging this boundary keeps client parsing predictable without silent hydration issues.

### 6. Toggle-Semantics vs. Set-Semantics for PATCH

- **Initial Approach:** The `PATCH /todos/:id` route originally accepted an empty body and acted strictly as a toggle for `completed`. This was simple to wire up, but inflexible: as soon as inline text editing was introduced, the endpoint couldn't support it without awkward parallel endpoints.
- **Current Architecture:** Replaced the toggle design with general set-semantics. The endpoint now accepts a partial payload validated via `UpdateTodoSchema.partial()`. Domain logic merges incoming fields into a single `updateTodo` model function. Toggling is now handled cleanly on the client by computing `!todo.completed` and sending the explicit target value.
