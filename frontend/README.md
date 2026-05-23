# HyperMindZ Frontend ⚛️

The frontend of HyperMindZ is a modern, component-driven React application built on **Next.js**. It features a stunning UI built with Vanilla CSS and Tailwind CSS principles.

## Architecture
The frontend utilizes a modular architecture within the `app/components` folder:
- `Sidebar.tsx`: Persistent navigation and layout control.
- `DataCatalog.tsx`: Interface for uploading, profiling, and managing tabular datasets.
- `Playground.tsx`: The primary AI chat console with integrated SQL execution logs and dynamic **Recharts** visualization.
- `Settings.tsx`: User configuration and theme preferences.

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run the Development Server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.
