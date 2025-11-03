
# Coding Guidelines: Aura - The Emergency Response Network

## 1. Architecture
Aura will be developed as a monolithic Next.js application using the App Router. This approach allows for server-side rendering (SSR) for performance, API routes for backend logic, and a unified codebase for both the User and Hospital portals.

-   **Frontend:** React components built with TypeScript and styled with Tailwind CSS.
-   **Backend:** Next.js API Routes (`/app/api/...`) will handle business logic, database interactions, and authentication.
-   **Database:** PostgreSQL with Prisma as the ORM for type-safe database access.
-   **Authentication:** NextAuth.js for handling user and hospital staff authentication.

## 2. File Structure
The project will adhere to the standard Next.js App Router structure.

/
├── /app/                      # Main application routes
│   ├── /api/                  # Backend API endpoints
│   ├── (user)/                # Route group for user portal
│   │   ├── /dashboard/        # User's main dashboard
│   │   └── /profile/          # User's medical profile page
│   ├── (hospital)/            # Route group for hospital portal
│   │   └── /dashboard/        # Hospital's alert dashboard
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── /components/               # Shared React components (Buttons, Forms, etc.)
│   ├── /ui/                   # Re-usable low-level components (Shadcn/UI)
│   └── /specific/             # Components specific to a feature
├── /lib/                      # Helper functions, DB client, utils
├── /prisma/                   # Prisma schema and migrations
├── /docs/                     # Project documentation (PRD, Guidelines, etc.)
├── /public/                   # Static assets (images, fonts)
└── next.config.mjs            # Next.js configuration

## 3. Coding Vibe
-   **Language:** TypeScript is mandatory. Use strict mode.
-   **Naming Conventions:**
    -   Components: `PascalCase` (e.g., `EmergencyButton.tsx`)
    -   Variables/Functions: `camelCase` (e.g., `sendAlert`)
    -   API Files/Routes: `kebab-case`
-   **Formatting:** `Prettier` will be used for automatic code formatting. A `.prettierrc` file will be provided.
-   **State Management:** Use React Server Components where possible. For client-side state, use React Context for simple state and consider Zustand for more complex, global state.
-   **Error Handling:** All API routes and data-fetching functions must have robust `try/catch` blocks. Errors should be logged clearly for debugging.

## 4. In-IDE Assistant Priming
To maximize the effectiveness of in-IDE assistants like GitHub Copilot:
-   **Primary Context:** Before starting a task, instruct your assistant to "review `/docs/Project_Requirements.md` and `/docs/Coding_Guidelines.md`."
-   **Task-Specific Context:** When building a component, provide the FR-ID. For example: "I am working on FR-002, the single-click emergency alert. Let's build the `EmergencyButton` component. It should be large, red, and call the `/api/alert/create` endpoint on click."
-   **Prisma Schema:** Always have the `/prisma/schema.prisma` file open in a separate tab to give the assistant context on the data models.
