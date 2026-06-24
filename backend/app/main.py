from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth, categories, requests, messages, ratings, payments, admin, provider

from app.config import settings

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MtaaniGo API", version="1.0.0", description="Location-based service marketplace for Kenya")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(requests.router)
app.include_router(messages.router)
app.include_router(ratings.router)
app.include_router(payments.router)
app.include_router(admin.router)
app.include_router(provider.router)


@app.get("/")

def health_check():
    return {"status": "healthy", "app": "MtaaniGo API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
