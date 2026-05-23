# HyperMindZ Analytics Engine

HyperMindZ Analytics Engine is a full-stack, AI-powered tabular query console. It allows users to upload datasets (CSV/Excel) and query them securely using plain natural language. The system translates the queries into SQL under the hood, processes them safely in isolated SQLite databases, and dynamically visualizes the results.

## Architecture Overview

This monorepo consists of two main components:
- [**Backend**](./backend/README.md): A modular, high-performance FastAPI server utilizing LangChain and Google's Gemini 2.5 Flash Lite LLM for natural-language-to-SQL translation.
- [**Frontend**](./frontend/README.md): A beautiful, component-driven React application built with Next.js, featuring dynamic Recharts visualizations and a modern dashboard UI.

## Features
- **Data Catalog:** Upload and profile tabular datasets dynamically.
- **Natural Language Querying:** Ask analytical questions in plain English.
- **Dynamic Visualizations:** The AI automatically recommends and plots data via Recharts.
- **Isolated Sandboxes:** Each dataset operates in a fully isolated SQLite database.

## Prerequisites
- Node.js (v16+)
- Python 3.9+

## Quick Start
To run this application locally, you will need to boot up both the frontend and the backend. Please see their respective README files for detailed instructions.
