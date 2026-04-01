from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app import models
from app.routers import auth, plans, tasks, ai, analytics

# Create db tables for first run if Alembic is not set up
# Ideally handled by Alembic, but this is a fallback
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Apna Manager", description="Premium Expense and Todo Manager API")

origins = [
    "http://localhost:5173", # Vite default
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Apna Manager API"}

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(plans.router, prefix="/api/plans", tags=["Plans"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
