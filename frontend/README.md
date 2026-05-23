# HyperMindZ Frontend Architecture ⚛️

The HyperMindZ frontend is a highly interactive, component-driven React application built on **Next.js**. It serves as the primary visual interface for users to upload datasets and converse with their data via AI.

## 🏗️ Component Architecture

To ensure high maintainability and testability, the user interface has been modularized into distinct visual and functional scopes inside `app/components/`:

1. **`page.tsx` (State Container)**: Acts as the primary orchestrator. It manages the global UI state (active tabs, chat threads, session tokens) and passes them down as props to child components.
2. **`Sidebar.tsx`**: Provides persistent navigation, allowing users to switch between the Dashboard, Data Catalog, AI Playground, and Settings.
3. **`DataCatalog.tsx`**: A robust interface for managing data sources. 
   - Handles Drag & Drop file uploads.
   - Provides an interactive grid to preview dataset rows.
   - Triggers basic data profiling metrics (row counts, column tracking).
4. **`Playground.tsx`**: The crown jewel of the frontend.
   - **Chat Interface**: Renders the back-and-forth conversational threads between the user and the AI.
   - **SQL Execution Logs**: Displays raw, generated SQLite queries for transparency.
   - **Dynamic Visualization Renderer**: Uses `Recharts` to automatically plot data tables into Area, Line, Bar, or Pie charts based on the backend's heuristic recommendations.
5. **`Settings.tsx`**: Manages user configuration, aesthetic theme preferences, and session management.

## ⚙️ How It Works (Frontend Lifecycle)

1. **Authentication**: Users must pass the secure login wall. The application requests a JWT from the backend and persists it securely.
2. **Dataset Uploads**: When a user uploads a CSV, `DataCatalog` makes a multipart API request. Once ingested, the file appears in their available sandboxes.
3. **Querying Data**: In the `Playground`, users submit natural language questions. The app optimistically updates the UI while waiting for the AI response.
4. **Dynamic Rendering**: Upon receiving the response, the `Playground` component parses the raw JSON row data and the `visualization_config`. It dynamically selects the appropriate `Recharts` component and maps the X and Y axes automatically to provide an immediate visual answer.

## 🚀 Setup & Development

1. **Install Node Modules:**
   ```bash
   npm install
   ```
2. **Start the Next.js Dev Server:**
   ```bash
   npm run dev
   ```
3. **Build for Production:**
   ```bash
   npm run build
   npm run start
   ```

*Ensure the backend is running concurrently on port 8000 to prevent CORS and connection errors.*
