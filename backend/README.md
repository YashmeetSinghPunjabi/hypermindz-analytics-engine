# HyperMindZ Backend 🐍

The backend of HyperMindZ is built using **FastAPI** and **LangChain**. It uses `gemini-2.5-flash-lite` to handle natural language processing, transforming plain-text questions into deterministic SQLite queries.

## Architecture
The backend is completely modularized for scalability:
- `routers/auth_routes.py`: Manages JWT generation and session management.
- `routers/files_routes.py`: Handles CSV/Excel file uploads and ingest processes.
- `routers/query_routes.py`: Contains the core LangChain agent logic to convert NL to SQL.
- `schemas.py`: Centralized Pydantic data models for strong request/response typing.
- `utils.py`: Helper functions for secure file I/O and query execution.

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables:**
   Create a `.env` file in the `backend` directory (do not commit this to version control).
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the Server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

The FastAPI server will be available at `http://localhost:8000`. You can view the automated Swagger docs at `http://localhost:8000/docs`.
