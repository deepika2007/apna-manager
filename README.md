Apna Manager - Task Breakdown

1. Project Setup

 Initialize Backend (FastAPI, SQLAlchemy, Alembic, PostgreSQL connection)
 Initialize Frontend (React 19, TypeScript, Vite, Tailwind CSS)
 Set up project structure and environment variables
 
2. Backend Development (FastAPI)

 Database Models (User, Plan, Task, Expense)
 Auth Endpoints (Register, Login, Forgot Password, Reset Password with JWT)
 Plan Endpoints (CRUD operations for Plans)
 Task Endpoints (CRUD operations for Tasks/Expenses under a Plan)
 Analytics Endpoints (Aggregation for dashboard)
 AI Endpoints (Integration with OpenAI/Gemini for insights and audio processing)
 
3. Frontend Development (React 19 + TypeScript)

 Core Setup (Routing, State Management, API Client, Layout, Premium UI Design System)
 Auth Pages (Login, Register, Forgot/Reset Password)
 Dashboard (List of Plans, Create/Edit/Delete Plans)
 Plan Details & Task List (List Tasks, Add Expense/Task, Edit/Delete, Audio Input Button)
 Analytics Dashboard (Charts/Graphs for expenses)
 AI Chat Interface (Ask AI for expense reduction tips)
 
4. Advanced Features

 Audio Feature: Implement microphone recording in the browser, send audio to backend, use Speech-to-Text API to parse plan/task details, and auto-populate the form.
 AI Insights: Implement a chat/prompt interface where users can select a task/expense and ask the backend AI how to reduce this expense.

5. Verification & Testing
 Test Auth Flow End-to-End
 Test CRUD operations for Plans and Tasks
 Test Audio processing pipeline
 Test AI insights functionality
 Ensure UI is responsive and premium
